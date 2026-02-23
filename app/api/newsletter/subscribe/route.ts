import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import {
  normalizeEmail,
  isValidEmailFormat,
  isDisposableDomain,
  isRoleBasedEmail,
} from '@/lib/email-validation';
import dns from 'dns';
import { promisify } from 'util';

const resolveMx = promisify(dns.resolveMx);

// Rate limiting storage (in-memory, suitable for single instance)
// For production with multiple instances, use Redis or similar
const rateLimitStore = new Map<string, { count: number; resetAt: number }>();

const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 5;

/**
 * Clean up expired rate limit entries
 */
function cleanupRateLimitStore() {
  const now = Date.now();
  for (const [key, value] of rateLimitStore.entries()) {
    if (value.resetAt < now) {
      rateLimitStore.delete(key);
    }
  }
}

/**
 * Check rate limit for a given key (IP or email)
 */
function checkRateLimit(key: string): boolean {
  const now = Date.now();
  const entry = rateLimitStore.get(key);

  if (!entry || entry.resetAt < now) {
    // Create new entry
    rateLimitStore.set(key, {
      count: 1,
      resetAt: now + RATE_LIMIT_WINDOW,
    });
    return true;
  }

  if (entry.count >= RATE_LIMIT_MAX_REQUESTS) {
    return false;
  }

  entry.count++;
  return true;
}

/**
 * Get client IP address from request
 */
function getClientIp(request: NextRequest): string {
  // Try various headers for IP (works with most proxies/CDNs)
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }

  const realIp = request.headers.get('x-real-ip');
  if (realIp) {
    return realIp;
  }

  // Fallback
  return 'unknown';
}

/**
 * Verify domain has valid MX records
 */
async function verifyMxRecords(domain: string): Promise<boolean> {
  try {
    const records = await resolveMx(domain);
    return records && records.length > 0;
  } catch (error) {
    return false;
  }
}

/**
 * POST /api/newsletter/subscribe
 * Subscribe email to newsletter with soft validation
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, name, sport, honeypot, phone } = body;

    // Honeypot check - if filled, pretend success but don't insert
    if (honeypot && honeypot.trim() !== '') {
      console.log('🍯 Honeypot triggered, ignoring submission');
      return NextResponse.json(
        { ok: true, msg: 'Subscribed' },
        { status: 200 }
      );
    }

    // Validate required fields
    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        { ok: false, msg: 'Email is required' },
        { status: 400 }
      );
    }

    // Normalize email
    const normalizedEmail = normalizeEmail(email);

    // Rate limiting - by IP
    const clientIp = getClientIp(request);
    cleanupRateLimitStore(); // Periodic cleanup

    if (!checkRateLimit(`ip:${clientIp}`)) {
      return NextResponse.json(
        { ok: false, msg: 'Too many requests. Please try again later.' },
        { status: 429 }
      );
    }

    // Rate limiting - by email
    if (!checkRateLimit(`email:${normalizedEmail}`)) {
      return NextResponse.json(
        { ok: false, msg: 'Too many attempts with this email.' },
        { status: 429 }
      );
    }

    // Validate email format
    if (!isValidEmailFormat(normalizedEmail)) {
      return NextResponse.json(
        { ok: false, msg: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Check disposable domains
    if (isDisposableDomain(normalizedEmail)) {
      return NextResponse.json(
        { ok: false, msg: 'Disposable email addresses are not allowed' },
        { status: 400 }
      );
    }

    // Check role-based emails (only on public domains)
    if (isRoleBasedEmail(normalizedEmail)) {
      return NextResponse.json(
        { ok: false, msg: 'Generic emails (admin@, info@, etc.) not allowed on public domains' },
        { status: 400 }
      );
    }

    // Extract domain for MX verification
    const domain = normalizedEmail.split('@')[1];
    
    // Verify MX records
    const hasMxRecords = await verifyMxRecords(domain);
    if (!hasMxRecords) {
      return NextResponse.json(
        { ok: false, msg: 'Email domain has no valid mail server' },
        { status: 400 }
      );
    }

    // Check if email already exists (case-insensitive)
    const { data: existing, error: checkError } = await supabase
      .from('Newsletter')
      .select('id')
      .ilike('email', normalizedEmail)
      .maybeSingle();

    if (checkError) {
      console.error('❌ Error checking existing email:', checkError);
      return NextResponse.json(
        { ok: false, msg: 'Database error' },
        { status: 500 }
      );
    }

    // If already exists, return success without inserting
    if (existing) {
      console.log('ℹ️ Email already subscribed:', normalizedEmail);
      return NextResponse.json(
        { ok: true, msg: 'Already subscribed' },
        { status: 200 }
      );
    }

    // Prepare data for insertion
    const insertData: any = {
      email: normalizedEmail,
    };

    // Include name if provided
    if (name && typeof name === 'string' && name.trim()) {
      insertData.name = name.trim();
    }

    // Include sport if provided
    if (sport && typeof sport === 'string' && sport.trim()) {
      insertData.sport = sport.trim();
    }

    // Include phone if provided
    if (phone && typeof phone === 'string' && phone.trim()) {
      insertData.phone = phone.trim();
    }

    // Insert new subscription
    const { error: insertError } = await supabase
      .from('Newsletter')
      .insert(insertData);

    if (insertError) {
      // Handle unique constraint violation (race condition)
      if (insertError.code === '23505') {
        console.log('ℹ️ Duplicate email (race condition):', normalizedEmail);
        return NextResponse.json(
          { ok: true, msg: 'Already subscribed' },
          { status: 200 }
        );
      }

      console.error('❌ Error inserting subscription:', insertError);
      return NextResponse.json(
        { ok: false, msg: 'Failed to subscribe' },
        { status: 500 }
      );
    }

    console.log('✅ New subscription:', normalizedEmail);
    return NextResponse.json(
      { ok: true, msg: 'Subscribed' },
      { status: 200 }
    );
  } catch (error) {
    console.error('❌ Newsletter subscription error:', error);
    return NextResponse.json(
      { ok: false, msg: 'Internal error' },
      { status: 500 }
    );
  }
}

