import { withBotId } from 'botid/next/config'

/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
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
  async rewrites() {
    return [
      { source: '/programs', destination: '/' },
      { source: '/drexperience', destination: '/' },
      { source: '/club', destination: '/' },
      { source: '/faq', destination: '/' },
      { source: '/contact', destination: '/' },
      { source: '/join-team', destination: '/' },
      { source: '/register', destination: '/' },
    ]
  },
}

export default withBotId(nextConfig)
