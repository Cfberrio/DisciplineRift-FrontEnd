import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Youth Sports Programs - Volleyball, Tennis & Pickleball | Discipline Rift',
  description: 'Explore Discipline Rift\'s elite youth sports programs. Professional volleyball, tennis, and pickleball training for young athletes. Expert coaching and proven development methods.',
  keywords: ['youth sports programs', 'volleyball training', 'tennis lessons', 'pickleball programs', 'youth athletics', 'sports development'],
  alternates: {
    canonical: 'https://www.disciplinerift.com/programs',
  },
  openGraph: {
    title: 'Youth Sports Programs | Discipline Rift',
    description: 'Explore our elite youth sports programs in Volleyball, Tennis, and Pickleball.',
    url: 'https://www.disciplinerift.com/programs',
    siteName: 'Discipline Rift',
    type: 'website',
    images: [
      {
        url: 'https://www.disciplinerift.com/og-image.svg',
        width: 1200,
        height: 630,
        alt: 'Discipline Rift Youth Sports Programs',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Youth Sports Programs | Discipline Rift',
    description: 'Elite youth sports programs in Volleyball, Tennis, and Pickleball.',
    images: ['https://www.disciplinerift.com/og-image.svg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
}

export default function ProgramsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}

