/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: process.env.SITE_URL || 'https://www.disciplinerift.com',
  generateRobotsTxt: false, // Ya tenemos robots.txt personalizado
  generateIndexSitemap: false, // No necesario para sitio pequeño
  exclude: [
    '/admin/*',
    '/dashboard',
    '/api/*',
    '/auth/*',
    '/payment/*',
    '/students',
    '/example'
  ],
  robotsTxtOptions: {
    policies: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin/', '/dashboard', '/api/', '/auth/', '/payment/']
      }
    ],
    additionalSitemaps: []
  },
  // Prioridades por tipo de página
  transform: async (config, path) => {
    // Homepage tiene máxima prioridad
    if (path === '/') {
      return {
        loc: path,
        changefreq: 'daily',
        priority: 1.0,
        lastmod: new Date().toISOString(),
      }
    }
    
    // Página de registro - alta prioridad
    if (path === '/register') {
      return {
        loc: path,
        changefreq: 'weekly',
        priority: 0.9,
        lastmod: new Date().toISOString(),
      }
    }
    
    // Otras páginas públicas
    return {
      loc: path,
      changefreq: 'monthly',
      priority: 0.7,
      lastmod: new Date().toISOString(),
    }
  }
}











