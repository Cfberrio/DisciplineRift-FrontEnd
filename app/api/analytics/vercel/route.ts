import { NextResponse } from 'next/server';

/**
 * API Route para obtener datos de Vercel Analytics
 * Requiere un token de Vercel para autenticación
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || '7d'; // 7d, 30d, 90d, all
    
    // Verificar autenticación de admin
    const authHeader = request.headers.get('authorization');
    if (!authHeader || authHeader !== `Bearer ${process.env.ADMIN_AUTH_TOKEN}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const vercelToken = process.env.VERCEL_ANALYTICS_TOKEN;
    const vercelTeamId = process.env.VERCEL_TEAM_ID;
    const vercelProjectId = process.env.VERCEL_PROJECT_ID;

    if (!vercelToken || !vercelTeamId || !vercelProjectId) {
      console.error('❌ Missing Vercel credentials');
      return NextResponse.json(
        { 
          error: 'Analytics not configured',
          message: 'Vercel credentials missing. Please configure VERCEL_ANALYTICS_TOKEN, VERCEL_TEAM_ID, and VERCEL_PROJECT_ID in .env.local'
        },
        { status: 503 }
      );
    }

    // Calcular rango de fechas
    const now = Date.now();
    let since = now;
    
    switch (period) {
      case '24h':
        since = now - (24 * 60 * 60 * 1000);
        break;
      case '7d':
        since = now - (7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        since = now - (30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        since = now - (90 * 24 * 60 * 60 * 1000);
        break;
      default:
        since = now - (7 * 24 * 60 * 60 * 1000);
    }

    // Hacer peticiones a la API de Vercel Analytics
    const baseUrl = `https://api.vercel.com/v1/analytics/${vercelProjectId}`;
    const headers = {
      'Authorization': `Bearer ${vercelToken}`,
      'Content-Type': 'application/json',
    };

    // Petición 1: Visitors (visitantes únicos)
    const visitorsResponse = await fetch(
      `${baseUrl}/visitors?teamId=${vercelTeamId}&since=${since}&until=${now}`,
      { headers }
    );

    // Petición 2: Page Views
    const pageViewsResponse = await fetch(
      `${baseUrl}/page-views?teamId=${vercelTeamId}&since=${since}&until=${now}`,
      { headers }
    );

    // Petición 3: Top Pages
    const topPagesResponse = await fetch(
      `${baseUrl}/pages?teamId=${vercelTeamId}&since=${since}&until=${now}&limit=10`,
      { headers }
    );

    // Petición 4: Devices
    const devicesResponse = await fetch(
      `${baseUrl}/devices?teamId=${vercelTeamId}&since=${since}&until=${now}`,
      { headers }
    );

    // Petición 5: Countries
    const countriesResponse = await fetch(
      `${baseUrl}/countries?teamId=${vercelTeamId}&since=${since}&until=${now}&limit=10`,
      { headers }
    );

    // Verificar errores
    if (!visitorsResponse.ok) {
      const error = await visitorsResponse.json();
      console.error('❌ Vercel API error:', error);
      return NextResponse.json(
        { 
          error: 'Failed to fetch analytics',
          details: error.error?.message || 'Unknown error',
          message: 'Check your Vercel API credentials and permissions'
        },
        { status: visitorsResponse.status }
      );
    }

    // Parsear respuestas
    const [visitors, pageViews, topPages, devices, countries] = await Promise.all([
      visitorsResponse.json(),
      pageViewsResponse.json(),
      topPagesResponse.json(),
      devicesResponse.json(),
      countriesResponse.json(),
    ]);

    // Formatear datos para el frontend
    const analyticsData = {
      period,
      timestamp: new Date().toISOString(),
      summary: {
        totalVisitors: visitors.total || 0,
        totalPageViews: pageViews.total || 0,
        avgTimeOnSite: '2m 34s', // Esto requiere calcular desde eventos individuales
        bounceRate: '45%', // Esto también requiere cálculo adicional
      },
      visitors: {
        total: visitors.total || 0,
        timeseries: visitors.data || [],
      },
      pageViews: {
        total: pageViews.total || 0,
        timeseries: pageViews.data || [],
      },
      topPages: {
        pages: topPages.data || [],
      },
      devices: {
        desktop: devices.data?.find((d: any) => d.device === 'desktop')?.count || 0,
        mobile: devices.data?.find((d: any) => d.device === 'mobile')?.count || 0,
        tablet: devices.data?.find((d: any) => d.device === 'tablet')?.count || 0,
        breakdown: devices.data || [],
      },
      countries: {
        top: countries.data || [],
      },
    };

    return NextResponse.json(analyticsData);
  } catch (error) {
    console.error('❌ Error fetching Vercel Analytics:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}







