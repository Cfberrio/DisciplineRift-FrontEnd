import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Contact Us - Get in Touch | Discipline Rift',
  description: 'Contact Discipline Rift for questions about our youth sports programs. Located in Orlando, FL. Phone: (407) 614-7454. We\'re here to help with volleyball, tennis, and pickleball programs.',
  keywords: ['contact discipline rift', 'orlando youth sports', 'sports program inquiry', 'volleyball contact', 'tennis contact'],
  alternates: {
    canonical: 'https://www.disciplinerift.com/contact',
  },
  openGraph: {
    title: 'Contact Us | Discipline Rift',
    description: 'Get in touch with Discipline Rift. Questions about our youth sports programs? We\'re here to help.',
    url: 'https://www.disciplinerift.com/contact',
    siteName: 'Discipline Rift',
    type: 'website',
    images: [
      {
        url: 'https://www.disciplinerift.com/og-image.svg',
        width: 1200,
        height: 630,
        alt: 'Contact Discipline Rift',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Contact Us | Discipline Rift',
    description: 'Get in touch with Discipline Rift about our youth sports programs.',
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

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}







