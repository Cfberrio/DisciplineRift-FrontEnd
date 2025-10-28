import type { Metadata } from "next"
import ParentDashboard from "@/components/parent-dashboard"

export const metadata: Metadata = {
  title: "Parent Dashboard",
  description: "Manage your child's sports program enrollment and track their progress.",
  robots: {
    index: false,
    follow: false,
  },
}

export default function DashboardPage() {
  return <ParentDashboard />
}
