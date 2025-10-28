"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Head from "next/head"
import { supabase } from "@/lib/supabase"
import { CheckCircle, Loader2, ArrowRight } from "lucide-react"

export default function ConfirmedPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isLoading, setIsLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function handleConfirmation() {
      try {
        // Get the current session
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession()

        if (sessionError) {
          console.error("Session error:", sessionError)
          setError("Failed to get session")
          return
        }

        if (session?.user) {
          console.log("✅ User confirmed and logged in:", session.user.id)
          setUser(session.user)

          // Set a small delay to ensure everything is properly set up
          setTimeout(() => {
            const next = searchParams.get("next") || "/register"
            console.log("🔄 Redirecting to:", next)
            router.push(next)
          }, 2000)
        } else {
          setError("No active session found")
        }
      } catch (error) {
        console.error("Confirmation handling error:", error)
        setError("An unexpected error occurred")
      } finally {
        setIsLoading(false)
      }
    }

    handleConfirmation()
  }, [router, searchParams])

  if (isLoading) {
    return (
      <>
        <Head>
          <title>Confirming Email | Discipline Rift</title>
          <meta name="robots" content="noindex,nofollow" />
        </Head>
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <h1 className="text-xl font-semibold text-gray-900 mb-2">Confirming your email...</h1>
          <p className="text-gray-600">Please wait while we set up your account.</p>
        </div>
        </div>
      </>
    )
  }

  if (error) {
    return (
      <>
        <Head>
          <title>Confirmation Error | Discipline Rift</title>
          <meta name="robots" content="noindex,nofollow" />
        </Head>
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="bg-red-100 rounded-full p-3 w-16 h-16 mx-auto mb-4">
            <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h1 className="text-xl font-semibold text-gray-900 mb-2">Confirmation Failed</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <button 
            onClick={() => router.push("/")} 
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition"
          >
            Return Home
          </button>
        </div>
        </div>
      </>
    )
  }

  return (
    <>
      <Head>
        <title>Email Confirmed | Discipline Rift</title>
        <meta name="robots" content="noindex,nofollow" />
      </Head>
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center max-w-md mx-auto p-6">
        <div className="bg-green-100 rounded-full p-3 w-16 h-16 mx-auto mb-4">
          <CheckCircle className="w-10 h-10 text-green-600" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Email Confirmed!</h1>
        <p className="text-gray-600 mb-4">
          Welcome, {user?.email}! Your email has been confirmed and you're now logged in.
        </p>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-blue-800">
            <ArrowRight className="inline h-4 w-4 mr-1" />
            Redirecting you to continue your registration...
          </p>
        </div>
        <button 
          onClick={() => router.push("/register")} 
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition"
        >
          Continue Registration Now
        </button>
      </div>
      </div>
    </>
  )
}
