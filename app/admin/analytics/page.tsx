'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Head from 'next/head';
import { Analytics } from '@vercel/analytics/next';

interface AnalyticsData {
  period: string;
  timestamp: string;
  summary: {
    totalVisitors: number;
    totalPageViews: number;
    avgTimeOnSite: string;
    bounceRate: string;
  };
  visitors: {
    total: number;
    timeseries: any[];
  };
  pageViews: {
    total: number;
    timeseries: any[];
  };
  topPages: {
    pages: Array<{ path: string; views: number }>;
  };
  devices: {
    desktop: number;
    mobile: number;
    tablet: number;
  };
  countries: {
    top: Array<{ country: string; count: number }>;
  };
}

export default function AnalyticsPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [adminEmail, setAdminEmail] = useState('');
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [period, setPeriod] = useState('7d');
  const router = useRouter();

  useEffect(() => {
    // Verificar autenticación
    const authStatus = localStorage.getItem('admin_auth');
    const email = localStorage.getItem('admin_email');

    if (authStatus === 'true' && email) {
      setIsAuthenticated(true);
      setAdminEmail(email);
    } else {
      // Redirigir a login si no está autenticado
      router.push('/admin/login');
    }
  }, [router]);

  // Fetch analytics data
  useEffect(() => {
    if (!isAuthenticated) return;

    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch(`/api/analytics/vercel?period=${period}`, {
          headers: {
            'Authorization': `Bearer admin-token-123`, // Este token se debe configurar
          },
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to fetch analytics');
        }

        const data = await response.json();
        setAnalyticsData(data);
      } catch (err) {
        console.error('Error fetching analytics:', err);
        setError(err instanceof Error ? err.message : 'Failed to load analytics');
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [isAuthenticated, period]);

  const handleLogout = () => {
    localStorage.removeItem('admin_auth');
    localStorage.removeItem('admin_email');
    router.push('/admin/login');
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-white text-xl">Verificando autenticación...</div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Analytics Dashboard | Discipline Rift Admin</title>
        <meta name="robots" content="noindex,nofollow" />
      </Head>
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
        <Analytics />
      
      {/* Header */}
      <header className="bg-white/5 backdrop-blur-lg border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-white">Analytics Dashboard</h1>
              <p className="text-gray-400 text-sm mt-1">Discipline Rift</p>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-gray-300 text-sm">{adminEmail}</span>
              <button
                onClick={handleLogout}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
              >
                Cerrar Sesión
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Period Selector */}
        <div className="mb-6 flex gap-2">
          {['24h', '7d', '30d', '90d'].map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                period === p
                  ? 'bg-blue-600 text-white'
                  : 'bg-white/10 text-gray-300 hover:bg-white/20'
              }`}
            >
              {p === '24h' ? 'Últimas 24h' : p === '7d' ? 'Últimos 7 días' : p === '30d' ? 'Últimos 30 días' : 'Últimos 90 días'}
            </button>
          ))}
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="text-white text-lg">Cargando analytics...</div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-6 mb-6">
            <h3 className="text-red-400 font-semibold mb-2">⚠️ Error al cargar analytics</h3>
            <p className="text-gray-300 text-sm">{error}</p>
            <p className="text-gray-400 text-xs mt-2">
              Configura las variables de entorno en .env.local para ver los datos
            </p>
          </div>
        )}

        {/* Analytics Cards */}
        {!loading && !error && analyticsData && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {/* Card 1: Visitors */}
              <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 shadow-xl">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold text-gray-300">Visitantes Únicos</h3>
                  <div className="bg-blue-500/20 p-3 rounded-lg">
                    <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                  </div>
                </div>
                <p className="text-4xl font-bold text-white mb-2">
                  {analyticsData.summary.totalVisitors.toLocaleString()}
                </p>
                <p className="text-green-400 text-sm">📈 Activo</p>
              </div>

              {/* Card 2: Page Views */}
              <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 shadow-xl">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold text-gray-300">Páginas Vistas</h3>
                  <div className="bg-green-500/20 p-3 rounded-lg">
                    <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  </div>
                </div>
                <p className="text-4xl font-bold text-white mb-2">
                  {analyticsData.summary.totalPageViews.toLocaleString()}
                </p>
                <p className="text-green-400 text-sm">📊 Total views</p>
              </div>

              {/* Card 3: Desktop */}
              <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 shadow-xl">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold text-gray-300">Desktop</h3>
                  <div className="bg-purple-500/20 p-3 rounded-lg">
                    <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                </div>
                <p className="text-4xl font-bold text-white mb-2">
                  {analyticsData.devices.desktop.toLocaleString()}
                </p>
                <p className="text-gray-400 text-sm">💻 Escritorio</p>
              </div>

              {/* Card 4: Mobile */}
              <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 shadow-xl">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold text-gray-300">Mobile</h3>
                  <div className="bg-orange-500/20 p-3 rounded-lg">
                    <svg className="w-5 h-5 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                  </div>
                </div>
                <p className="text-4xl font-bold text-white mb-2">
                  {analyticsData.devices.mobile.toLocaleString()}
                </p>
                <p className="text-gray-400 text-sm">📱 Móvil</p>
              </div>
            </div>

            {/* Top Pages */}
            {analyticsData.topPages.pages.length > 0 && (
              <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 shadow-xl mb-8">
                <h2 className="text-xl font-bold text-white mb-4">📄 Páginas Más Visitadas</h2>
                <div className="space-y-3">
                  {analyticsData.topPages.pages.slice(0, 10).map((page: any, index: number) => (
                    <div key={index} className="flex items-center justify-between bg-white/5 rounded-lg p-3">
                      <div className="flex items-center gap-3">
                        <span className="text-gray-400 font-mono text-sm">#{index + 1}</span>
                        <span className="text-white font-medium">{page.path || '/'}</span>
                      </div>
                      <span className="text-blue-400 font-semibold">{page.views?.toLocaleString() || 0} views</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Top Countries */}
            {analyticsData.countries.top.length > 0 && (
              <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 shadow-xl mb-8">
                <h2 className="text-xl font-bold text-white mb-4">🌍 Países</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                  {analyticsData.countries.top.slice(0, 10).map((country: any, index: number) => (
                    <div key={index} className="bg-white/5 rounded-lg p-4 text-center">
                      <p className="text-2xl mb-2">{country.country || '🌎'}</p>
                      <p className="text-white font-semibold">{country.count?.toLocaleString() || 0}</p>
                      <p className="text-gray-400 text-xs">visitantes</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {/* Default State - No Data */}
        {!loading && !error && !analyticsData && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {/* Card 1: Visitors */}
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">Total Visitors</h3>
                <div className="bg-blue-500/20 p-3 rounded-lg">
                  <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
              </div>
              <p className="text-3xl font-bold text-white mb-2">-</p>
              <p className="text-gray-400 text-sm">Configura Vercel API</p>
            </div>

            {/* Card 2: Page Views */}
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">Page Views</h3>
                <div className="bg-green-500/20 p-3 rounded-lg">
                  <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </div>
              </div>
              <p className="text-3xl font-bold text-white mb-2">-</p>
              <p className="text-gray-400 text-sm">Configura Vercel API</p>
            </div>

            {/* Card 3: Conversions */}
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">Devices</h3>
                <div className="bg-purple-500/20 p-3 rounded-lg">
                  <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <p className="text-3xl font-bold text-white mb-2">-</p>
              <p className="text-gray-400 text-sm">Configura Vercel API</p>
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="bg-white/10 backdrop-blur-lg rounded-xl p-8 border border-white/20 shadow-xl">
          <h2 className="text-2xl font-bold text-white mb-4">📊 Cómo ver Analytics completo</h2>
          <div className="space-y-4 text-gray-300">
            <p className="text-lg">
              El componente <code className="bg-black/30 px-2 py-1 rounded text-blue-400">@vercel/analytics</code> ya está integrado en esta página.
            </p>
            
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
              <h3 className="text-white font-semibold mb-2">✅ Analytics está activo</h3>
              <p className="text-sm">
                Para ver las métricas completas, visita tu dashboard de Vercel:
              </p>
              <a 
                href="https://vercel.com/dashboard" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-block mt-3 bg-black hover:bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
              >
                🔗 Abrir Vercel Dashboard
              </a>
            </div>

            <div className="bg-gray-800/50 rounded-lg p-4 mt-4">
              <h3 className="text-white font-semibold mb-3">📈 Métricas disponibles en Vercel:</h3>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <span className="text-green-400 mt-1">✓</span>
                  <span><strong>Visitors:</strong> Usuarios únicos que visitan el sitio</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-400 mt-1">✓</span>
                  <span><strong>Page Views:</strong> Número total de páginas vistas</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-400 mt-1">✓</span>
                  <span><strong>Top Pages:</strong> Páginas más visitadas</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-400 mt-1">✓</span>
                  <span><strong>Referrers:</strong> De dónde vienen los visitantes</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-400 mt-1">✓</span>
                  <span><strong>Devices:</strong> Desktop, mobile, tablet</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-400 mt-1">✓</span>
                  <span><strong>Locations:</strong> Países y ciudades de los visitantes</span>
                </li>
              </ul>
            </div>

            <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4 mt-4">
              <h3 className="text-yellow-400 font-semibold mb-2">⚠️ Nota importante</h3>
              <p className="text-sm">
                Los datos de analytics pueden tardar hasta 24 horas en aparecer en el dashboard de Vercel después de la primera implementación.
              </p>
            </div>
          </div>
        </div>

        {/* Quick Links */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
          <a
            href="/"
            className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 shadow-xl hover:bg-white/15 transition group"
          >
            <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-blue-400 transition">
              🏠 Ir al Home
            </h3>
            <p className="text-gray-400 text-sm">Volver a la página principal</p>
          </a>

          <a
            href="/dashboard"
            className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 shadow-xl hover:bg-white/15 transition group"
          >
            <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-blue-400 transition">
              📋 Dashboard
            </h3>
            <p className="text-gray-400 text-sm">Ver dashboard de estudiantes</p>
          </a>
        </div>
      </main>
      </div>
    </>
  );
}

