"use client"

import { useSearchParams, useRouter } from "next/navigation"
import { AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function AuthErrorPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const message = searchParams.get("message") || "An authentication error occurred"

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center max-w-md mx-auto p-6">
        <div className="bg-red-100 rounded-full p-3 w-16 h-16 mx-auto mb-4">
          <AlertCircle className="w-10 h-10 text-red-600" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Authentication Error</h1>
        <p className="text-gray-600 mb-6">{message}</p>
        <div className="space-y-3">
          <Button onClick={() => router.push("/#register")} className="w-full bg-blue-600 hover:bg-blue-700">
            Try Registration Again
          </Button>
          <Button onClick={() => router.push("/")} variant="outline" className="w-full">
            Return Home
          </Button>
        </div>
      </div>
    </div>
  )
}
