import type React from "react"
import type { Metadata } from "next"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import V0SwFix from "@/components/v0-sw-fix"
import { Analytics } from "@vercel/analytics/next"
import BotIdProtection from "@/components/botid-client"

const siteUrl = 'https://www.disciplinerift.com'

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Discipline Rift - Youth Sports Development Programs",
    template: "%s | Discipline Rift"
  },
  description: "Elite youth sports development programs in Volleyball, Tennis & Pickleball. Professional coaching, state-of-the-art facilities, and a proven approach to building athletic excellence in young athletes.",
  keywords: ['youth sports', 'volleyball training', 'tennis lessons', 'pickleball programs', 'youth athletics', 'sports development', 'athletic training', 'youth coaching'],
  authors: [{ name: 'Discipline Rift' }],
  creator: 'Discipline Rift',
  publisher: 'Discipline Rift',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: siteUrl,
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: siteUrl,
    siteName: 'Discipline Rift',
    title: 'Discipline Rift - Youth Sports Development Programs',
    description: 'Elite youth sports development programs in Volleyball, Tennis & Pickleball. Professional coaching and proven athletic development.',
    images: [
      {
        url: '/og-image.svg', // TODO: Reemplazar con og-image.png profesional (ver /public/OG_IMAGE_INSTRUCTIONS.md)
        width: 1200,
        height: 630,
        alt: 'Discipline Rift - Youth Sports Development',
        type: 'image/svg+xml',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Discipline Rift - Youth Sports Development Programs',
    description: 'Elite youth sports development programs in Volleyball, Tennis & Pickleball.',
    images: ['/og-image.svg'], // TODO: Reemplazar con og-image.png
    creator: '@disciplinerift',
  },
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 5,
  },
  icons: {
    icon: [
      { url: '/favicon.png', sizes: '32x32', type: 'image/png' },
      { url: '/android-chrome-192x192.png', sizes: '192x192', type: 'image/png' },
      { url: '/android-chrome-512x512.png', sizes: '512x512', type: 'image/png' },
    ],
    shortcut: '/favicon.png',
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
    other: [
      {
        rel: 'icon',
        type: 'image/png',
        sizes: '16x16',
        url: '/favicon.png',
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
  // JSON-LD for Organization
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "SportsOrganization",
    "name": "Discipline Rift",
    "url": siteUrl,
    "logo": `${siteUrl}/android-chrome-512x512.png`,
    "description": "Elite youth sports development programs in Volleyball, Tennis & Pickleball",
    "foundingDate": "2024",
    "telephone": "+14076147454",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "713 W Yale St",
      "addressLocality": "Orlando",
      "addressRegion": "FL",
      "postalCode": "32804",
      "addressCountry": "US"
    },
    "sameAs": [
      "https://facebook.com/disciplinerift",
      "https://instagram.com/disciplinerift",
      "https://tiktok.com/@disciplinerift"
    ],
    "contactPoint": {
      "@type": "ContactPoint",
      "telephone": "+14076147454",
      "contactType": "Customer Service",
      "availableLanguage": ["English", "Spanish"],
      "areaServed": "US"
    },
    "areaServed": {
      "@type": "Place",
      "name": "United States"
    },
    "sport": ["Volleyball", "Tennis", "Pickleball"]
  }

  // JSON-LD for LocalBusiness
  const localBusinessSchema = {
    "@context": "https://schema.org",
    "@type": "SportsActivityLocation",
    "name": "Discipline Rift",
    "image": `${siteUrl}/og-image.svg`,
    "@id": siteUrl,
    "url": siteUrl,
    "telephone": "+14076147454",
    "priceRange": "$$",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "713 W Yale St",
      "addressLocality": "Orlando",
      "addressRegion": "FL",
      "postalCode": "32804",
      "addressCountry": "US"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": 28.5496,
      "longitude": -81.3897
    },
    "openingHoursSpecification": [
      {
        "@type": "OpeningHoursSpecification",
        "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
        "opens": "09:00",
        "closes": "18:00"
      }
    ],
    "sameAs": [
      "https://facebook.com/disciplinerift",
      "https://instagram.com/disciplinerift",
      "https://tiktok.com/@disciplinerift"
    ]
  }

  // JSON-LD for WebSite
  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "Discipline Rift",
    "url": siteUrl,
    "description": "Youth Sports Development Programs",
    "publisher": {
      "@type": "Organization",
      "name": "Discipline Rift"
    },
    "potentialAction": {
      "@type": "SearchAction",
      "target": `${siteUrl}/?s={search_term_string}`,
      "query-input": "required name=search_term_string"
    }
  }

  // JSON-LD for Service/Course offerings
  const serviceSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": "Youth Sports Programs",
    "description": "Elite youth sports development programs in Volleyball, Tennis, and Pickleball",
    "itemListElement": [
      {
        "@type": "Course",
        "name": "Youth Volleyball Program",
        "description": "Professional volleyball training and development for young athletes",
        "provider": {
          "@type": "Organization",
          "name": "Discipline Rift"
        },
        "educationalLevel": "Youth",
        "sport": "Volleyball"
      },
      {
        "@type": "Course",
        "name": "Youth Tennis Program",
        "description": "Comprehensive tennis instruction and skill development for youth",
        "provider": {
          "@type": "Organization",
          "name": "Discipline Rift"
        },
        "educationalLevel": "Youth",
        "sport": "Tennis"
      },
      {
        "@type": "Course",
        "name": "Youth Pickleball Program",
        "description": "Dynamic pickleball training program for young athletes",
        "provider": {
          "@type": "Organization",
          "name": "Discipline Rift"
        },
        "educationalLevel": "Youth",
        "sport": "Pickleball"
      }
    ]
  }

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Preconnect to external resources for faster loading */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://vercel.live" />
        <link rel="dns-prefetch" href="https://vercel.live" />
      </head>
      <body
        className="antialiased"
      >
        {/* JSON-LD Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }}
        />
        
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
