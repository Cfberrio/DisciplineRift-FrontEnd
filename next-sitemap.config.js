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
  // Prioridades optimizadas para Google Sitelinks
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
    
    // Páginas clave para sitelinks - prioridad 0.8 (register, programs, contact)
    if (['/register', '/programs', '/contact'].includes(path)) {
      return {
        loc: path,
        changefreq: 'weekly',
        priority: 0.8,
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











