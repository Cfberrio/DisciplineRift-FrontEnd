/**
 * Email validation utilities for newsletter subscription
 * Implements soft validation with disposable/role-based filtering
 */

// Common disposable email domains
export const DISPOSABLE_DOMAINS = new Set([
  '10minutemail.com',
  'guerrillamail.com',
  'mailinator.com',
  'tempmail.com',
  'throwaway.email',
  'yopmail.com',
  'getnada.com',
  'maildrop.cc',
  'temp-mail.org',
  'guerrillamail.info',
  'sharklasers.com',
  'guerrillamail.net',
  'guerrillamail.org',
  'guerrillamail.biz',
  'spam4.me',
  'grr.la',
  'guerrillamail.de',
  'trbvm.com',
  'mailin8r.com',
  'trashmail.com',
  'jetable.org',
  'trashmail.net',
  'throwam.com',
  'spamgourmet.com',
  'mintemail.com',
  '0-mail.com',
  'e4ward.com',
  'mytrashmail.com',
  'dodgit.com',
  'dontreg.com',
  'emailondeck.com',
  'filzmail.com',
  'getairmail.com',
  'gishpuppy.com',
  'momentics.ru',
  'mt2009.com',
  'pookmail.com',
  'sogetthis.com',
  'spamavert.com',
  'spambox.us',
  'spamfree24.org',
  'spamhole.com',
  'spamify.com',
  'spamthisplease.com',
  'supergreatmail.com',
  'trashmail.ws',
  'wegwerfmail.de',
  'wegwerfmail.net',
  'wegwerfmail.org',
  'zoemail.org',
]);

// Role-based email prefixes (generic accounts, not personal)
export const ROLE_BASED_PREFIXES = new Set([
  'admin',
  'support',
  'info',
  'sales',
  'contact',
  'help',
  'noreply',
  'no-reply',
  'webmaster',
  'postmaster',
  'hostmaster',
  'abuse',
  'marketing',
  'billing',
  'service',
  'feedback',
  'office',
  'test',
]);

// Common email domain typos and their corrections
export const DOMAIN_SUGGESTIONS: Record<string, string> = {
  'gmai.com': 'gmail.com',
  'gmial.com': 'gmail.com',
  'gmaul.com': 'gmail.com',
  'gmil.com': 'gmail.com',
  'gmal.com': 'gmail.com',
  'gnail.com': 'gmail.com',
  'gamil.com': 'gmail.com',
  'yahooo.com': 'yahoo.com',
  'yaho.com': 'yahoo.com',
  'yhoo.com': 'yahoo.com',
  'yaboo.com': 'yahoo.com',
  'outloo.com': 'outlook.com',
  'outlok.com': 'outlook.com',
  'hotmial.com': 'hotmail.com',
  'hotmal.com': 'hotmail.com',
  'hotmil.com': 'hotmail.com',
  'hotnail.com': 'hotmail.com',
  'iclod.com': 'icloud.com',
  'iclould.com': 'icloud.com',
  'icoud.com': 'icloud.com',
};

// Popular public/consumer domains
export const PUBLIC_DOMAINS = [
  'gmail.com',
  'yahoo.com',
  'outlook.com',
  'hotmail.com',
  'icloud.com',
  'aol.com',
  'protonmail.com',
  'live.com',
  'msn.com',
  'mail.com',
  'me.com',
  'mac.com',
  'ymail.com',
  'rocketmail.com',
  'googlemail.com',
  'inbox.com',
  'zoho.com',
  'fastmail.com',
];

// Popular valid domains (used for typo suggestions)
export const POPULAR_DOMAINS = [
  'gmail.com',
  'yahoo.com',
  'outlook.com',
  'hotmail.com',
  'icloud.com',
  'aol.com',
  'protonmail.com',
  'live.com',
  'msn.com',
  'mail.com',
];

/**
 * Basic email format validation
 */
export function isValidEmailFormat(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Normalize email (trim, lowercase)
 */
export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

/**
 * Extract domain from email
 */
export function extractDomain(email: string): string {
  const parts = email.split('@');
  return parts.length === 2 ? parts[1].toLowerCase() : '';
}

/**
 * Extract local part (prefix) from email
 */
export function extractLocalPart(email: string): string {
  const parts = email.split('@');
  return parts.length === 2 ? parts[0].toLowerCase() : '';
}

/**
 * Check if email domain is disposable
 */
export function isDisposableDomain(email: string): boolean {
  const domain = extractDomain(email);
  return DISPOSABLE_DOMAINS.has(domain);
}

/**
 * Check if domain is a public/consumer email provider
 */
export function isPublicDomain(email: string): boolean {
  const domain = extractDomain(email);
  return PUBLIC_DOMAINS.includes(domain);
}

/**
 * Check if email is role-based (generic account) on a public domain
 * Business emails (info@company.com) are allowed, but not info@gmail.com
 */
export function isRoleBasedEmail(email: string): boolean {
  const localPart = extractLocalPart(email);
  
  // Only reject role-based emails on public/consumer domains
  if (ROLE_BASED_PREFIXES.has(localPart)) {
    return isPublicDomain(email);
  }
  
  return false;
}

/**
 * Calculate Levenshtein distance between two strings
 * Used for typo detection
 */
function levenshteinDistance(a: string, b: string): number {
  const matrix: number[][] = [];

  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }

  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }

  return matrix[b.length][a.length];
}

/**
 * Suggest domain correction if typo detected
 */
export function suggestDomainCorrection(email: string): string | null {
  const domain = extractDomain(email);
  
  // Check exact match in typo map
  if (DOMAIN_SUGGESTIONS[domain]) {
    return DOMAIN_SUGGESTIONS[domain];
  }

  // Check similarity with popular domains
  for (const popularDomain of POPULAR_DOMAINS) {
    const distance = levenshteinDistance(domain, popularDomain);
    // If distance is 1 or 2, suggest correction
    if (distance > 0 && distance <= 2) {
      return popularDomain;
    }
  }

  return null;
}

/**
 * Get full suggested email with corrected domain
 */
export function getSuggestedEmail(email: string): string | null {
  const suggestion = suggestDomainCorrection(email);
  if (!suggestion) return null;

  const localPart = extractLocalPart(email);
  return `${localPart}@${suggestion}`;
}

/**
 * Comprehensive email validation
 */
export interface EmailValidationResult {
  valid: boolean;
  error?: string;
  suggestion?: string;
}

export function validateEmail(email: string): EmailValidationResult {
  // Normalize
  const normalized = normalizeEmail(email);

  // Check format
  if (!isValidEmailFormat(normalized)) {
    return { valid: false, error: 'Invalid email format' };
  }

  // Check if disposable
  if (isDisposableDomain(normalized)) {
    return { valid: false, error: 'Disposable email addresses are not allowed' };
  }

  // Check if role-based on public domain
  if (isRoleBasedEmail(normalized)) {
    return { valid: false, error: 'Generic email addresses (admin@, info@, etc.) are not allowed on public domains' };
  }

  // Check for typos and suggest
  const suggestion = getSuggestedEmail(normalized);
  if (suggestion && suggestion !== normalized) {
    return {
      valid: true,
      suggestion: suggestion,
    };
  }

  return { valid: true };
}

