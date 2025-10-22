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
    unoptimized: true,
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
