import { withBotId } from 'botid/next/config'

/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'tdyyjoyotvzgbeowtlfv.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
  // Rewrites eliminados para /register, /programs, /contact (páginas reales para SEO/sitelinks)
  // Mantenemos solo rewrites internos de secciones
  async rewrites() {
    return [
      { source: '/drexperience', destination: '/' },
      { source: '/club', destination: '/' },
      { source: '/faq', destination: '/' },
      { source: '/join-team', destination: '/' },
    ]
  },
}

export default withBotId(nextConfig)
