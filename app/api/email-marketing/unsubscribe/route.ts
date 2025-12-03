import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { supabaseAdmin } from '@/lib/supabase-admin';

/**
 * Verifica y decodifica el JWT token de unsubscribe
 */
function verifyUnsubscribeToken(token: string): { email: string } | null {
  try {
    const secret = process.env.UNSUBSCRIBE_JWT_SECRET;
    
    if (!secret) {
      console.error('[UNSUBSCRIBE] ❌ UNSUBSCRIBE_JWT_SECRET no está configurado');
      return null;
    }

    const decoded = jwt.verify(token, secret) as { email: string };
    
    if (!decoded.email) {
      console.error('[UNSUBSCRIBE] ❌ Token no contiene email');
      return null;
    }

    return decoded;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      console.error('[UNSUBSCRIBE] ❌ Token expirado');
    } else if (error instanceof jwt.JsonWebTokenError) {
      console.error('[UNSUBSCRIBE] ❌ Token inválido:', error.message);
    } else {
      console.error('[UNSUBSCRIBE] ❌ Error verificando token:', error);
    }
    return null;
  }
}

/**
 * Elimina el email de la tabla Newsletter
 */
async function deleteNewsletterSubscription(email: string): Promise<{ success: boolean; error?: string }> {
  try {
    console.log('[UNSUBSCRIBE] 🗑️ Eliminando suscripción para:', email);

    // Usar supabaseAdmin para bypass RLS
    const { data, error } = await supabaseAdmin
      .from('Newsletter')
      .delete()
      .ilike('email', email)
      .select();

    if (error) {
      console.error('[UNSUBSCRIBE] ❌ Error de base de datos:', error);
      return { success: false, error: error.message };
    }

    if (!data || data.length === 0) {
      console.log('[UNSUBSCRIBE] ℹ️ Email no encontrado en la base de datos:', email);
      // Aún así consideramos esto como éxito para el usuario
      return { success: true };
    }

    console.log('[UNSUBSCRIBE] ✅ Suscripción eliminada exitosamente:', email);
    return { success: true };
  } catch (error) {
    console.error('[UNSUBSCRIBE] ❌ Error inesperado:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Error desconocido' 
    };
  }
}

/**
 * GET /api/email-marketing/unsubscribe?token=JWT_TOKEN
 * Maneja clicks manuales en el link de unsubscribe
 */
export async function GET(request: NextRequest) {
  try {
    console.log('[UNSUBSCRIBE] 📨 GET request recibido');

    // Obtener token del query string
    const searchParams = request.nextUrl.searchParams;
    const token = searchParams.get('token');

    if (!token) {
      console.error('[UNSUBSCRIBE] ❌ Token no proporcionado');
      return NextResponse.json(
        { error: 'Token requerido' },
        { status: 400 }
      );
    }

    // Verificar token
    const decoded = verifyUnsubscribeToken(token);
    
    if (!decoded) {
      console.error('[UNSUBSCRIBE] ❌ Token inválido o expirado');
      return NextResponse.json(
        { error: 'Token inválido o expirado' },
        { status: 400 }
      );
    }

    const { email } = decoded;
    console.log('[UNSUBSCRIBE] 📧 Email decodificado del token:', email);

    // Eliminar suscripción
    const result = await deleteNewsletterSubscription(email);

    if (!result.success) {
      console.error('[UNSUBSCRIBE] ❌ Error eliminando suscripción:', result.error);
      return NextResponse.json(
        { error: 'Error procesando unsubscribe' },
        { status: 500 }
      );
    }

    // Redirigir a página de éxito
    const successUrl = new URL('/unsubscribe-success', request.url);
    successUrl.searchParams.set('email', email);
    
    console.log('[UNSUBSCRIBE] ✅ Redirigiendo a página de éxito');
    return NextResponse.redirect(successUrl);

  } catch (error) {
    console.error('[UNSUBSCRIBE] ❌ Error no capturado:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/email-marketing/unsubscribe
 * Maneja Gmail One-Click Unsubscribe (List-Unsubscribe-Post)
 */
export async function POST(request: NextRequest) {
  try {
    console.log('[UNSUBSCRIBE] 📨 POST request recibido (Gmail One-Click)');

    // Obtener token del query string (Gmail envía el token en la URL)
    const searchParams = request.nextUrl.searchParams;
    const token = searchParams.get('token');

    if (!token) {
      console.error('[UNSUBSCRIBE] ❌ Token no proporcionado');
      return new NextResponse('Token requerido', { status: 400 });
    }

    // Verificar token
    const decoded = verifyUnsubscribeToken(token);
    
    if (!decoded) {
      console.error('[UNSUBSCRIBE] ❌ Token inválido o expirado');
      return new NextResponse('Token inválido', { status: 400 });
    }

    const { email } = decoded;
    console.log('[UNSUBSCRIBE] 📧 Email decodificado del token:', email);

    // Eliminar suscripción
    const result = await deleteNewsletterSubscription(email);

    if (!result.success) {
      console.error('[UNSUBSCRIBE] ❌ Error eliminando suscripción:', result.error);
      return new NextResponse('Error procesando unsubscribe', { status: 500 });
    }

    // Gmail One-Click espera respuesta simple "OK" con status 200
    console.log('[UNSUBSCRIBE] ✅ Unsubscribe exitoso (One-Click)');
    return new NextResponse('OK', { status: 200 });

  } catch (error) {
    console.error('[UNSUBSCRIBE] ❌ Error no capturado:', error);
    return new NextResponse('Error interno', { status: 500 });
  }
}








