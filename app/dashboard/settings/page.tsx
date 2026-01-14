"use client"

import { Settings } from "lucide-react"

export default function SettingsPage() {
  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="mt-2 text-gray-600">Manage your account settings and preferences.</p>
      </div>

      <div className="bg-white rounded-lg shadow-md border border-gray-200 p-12 text-center">
        <Settings className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Coming Soon</h2>
        <p className="text-gray-600">
          Account settings and preferences will be available in Phase 2.
        </p>
      </div>
    </div>
  )
}
