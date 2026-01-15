import DashboardLogin from '@/components/dashboard-login'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Dashboard Login | Discipline Rift',
  description: 'Login to your parent dashboard to manage your children\'s sports programs.',
  robots: {
    index: false,
    follow: false,
  },
}

export default function DashboardLoginPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <DashboardLogin />
    </div>
  )
}
