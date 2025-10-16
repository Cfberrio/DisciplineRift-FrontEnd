import type React from "react"
import type { Metadata } from "next"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import V0SwFix from "@/components/v0-sw-fix"
import { Analytics } from "@vercel/analytics/next"
import BotIdProtection from "@/components/botid-client"

export const metadata: Metadata = {
  title: "Discipline Rift - Youth Sports Development",
  description: "Developing Young Athletes in Volleyball, Tennis, & Pickleball",
  generator: 'v0.dev',
  viewport: 'width=device-width, initial-scale=1.0',
  icons: {
    icon: [
      { url: '/android-chrome-192x192.png', sizes: '192x192', type: 'image/png' },
      { url: '/android-chrome-512x512.png', sizes: '512x512', type: 'image/png' },
    ],
    shortcut: '/android-chrome-192x192.png',
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
    other: [
      {
        rel: 'icon',
        type: 'image/png',
        sizes: '32x32',
        url: '/android-chrome-192x192.png',
      },
      {
        rel: 'icon',
        type: 'image/png', 
        sizes: '16x16',
        url: '/android-chrome-192x192.png',
      },
    ],
  },
  manifest: '/manifest.json',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className="antialiased"
      >
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
          <BotIdProtection />
          {children}
          <V0SwFix />
          <Analytics />
        </ThemeProvider>
      </body>
    </html>
  )
}
