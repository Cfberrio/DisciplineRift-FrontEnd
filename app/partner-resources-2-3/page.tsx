import PartnerResourcesLanding from '@/components/partner-resources-landing'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Flag Football Partner Resources (2-3) | Discipline Rift',
  description: 'Join the Discipline Rift Flag Football Partner Program. Get weekly drills, games, and activities to practice at home with your child.',
  keywords: ['flag football', 'parent resources', 'youth sports', 'discipline rift', 'football drills', 'sports training'],
  openGraph: {
    title: 'Flag Football Partner Program | Discipline Rift',
    description: 'Partner with us to develop your child\'s flag football skills through structured at-home practice resources.',
    type: 'website',
  },
}

export default function PartnerResources23Page() {
  return (
    <PartnerResourcesLanding
      whatsappLink="https://chat.whatsapp.com/L9sP25r5bQZ8C1WoTPC6fT"
      groupType="2-3"
    />
  )
}
