"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { Mail, ArrowRight, Loader2, CheckCircle, Home } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Link from "next/link"

interface UserType {
  id: string
  firstName: string
  lastName: string
  email: string
  phone: string
}

export default function DashboardLogin() {
  const [email, setEmail] = useState("")
  const [otp, setOtp] = useState("")
  const [otpSent, setOtpSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [otpExpiresIn, setOtpExpiresIn] = useState("10 minutes")
  const [resendCooldown, setResendCooldown] = useState(0)
  const router = useRouter()

  // Check if already authenticated
  useEffect(() => {
    checkExistingSession()
  }, [])

  // Resend cooldown timer
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [resendCooldown])

  const checkExistingSession = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        console.log("✅ User already authenticated, redirecting to dashboard")
        router.push("/dashboard")
      }
    } catch (error) {
      console.error("Error checking session:", error)
    }
  }

  const handleSendOTP = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    
    if (!email.trim()) {
      setError("Please enter your email address")
      return
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address")
      return
    }

    setLoading(true)
    setError(null)

    try {
      console.log("🔄 Sending OTP to:", email)

      const response = await fetch("/api/auth/send-login-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "Failed to send login code")
      }

      console.log("✅ OTP sent successfully")
      setOtpSent(true)
      setOtpExpiresIn(data.expiresIn || "10 minutes")
      setResendCooldown(60) // 60 second cooldown

    } catch (err) {
      console.error("❌ Send OTP error:", err)
      setError(err instanceof Error ? err.message : "Failed to send login code. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!otp.trim()) {
      setError("Please enter the 6-digit code")
      return
    }

    if (!/^\d{6}$/.test(otp)) {
      setError("Code must be 6 digits")
      return
    }

    setLoading(true)
    setError(null)

    try {
      console.log("🔄 Verifying OTP for:", email)

      const response = await fetch("/api/auth/verify-login-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase(), otp: otp.trim() }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "Invalid login code")
      }

      if (!data.user || !data.session) {
        throw new Error("Authentication failed. Please try again.")
      }

      console.log("✅ User authenticated:", data.user.email)

      // Set Supabase session
      if (data.session) {
        try {
          await supabase.auth.setSession(data.session)
          console.log("✅ Session established")
        } catch (sessionError) {
          console.warn("⚠️ Error setting session:", sessionError)
        }
      }

      // Redirect to dashboard
      console.log("🔄 Redirecting to dashboard...")
      router.push("/dashboard")

    } catch (err) {
      console.error("❌ Verify OTP error:", err)
      const errorMessage = err instanceof Error ? err.message : "Invalid login code. Please try again."
      
      // Si el error indica que no hay estudiantes, mostrar mensaje específico con link
      if (errorMessage.includes("No students found")) {
        setError("You need to register a student first.")
      } else {
        setError(errorMessage)
      }
      
      setOtp("") // Clear OTP field on error
    } finally {
      setLoading(false)
    }
  }

  const handleResendCode = () => {
    setOtp("")
    setError(null)
    handleSendOTP()
  }

  return (
    <div className="w-full max-w-md mx-auto p-4">
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-8 text-center border-b border-gray-200" style={{ backgroundColor: '#0085B7' }}>
          <div className="mx-auto mb-4 bg-white p-3 rounded-full w-fit">
            <Mail className="h-8 w-8" style={{ color: '#0085B7' }} />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
            Parent Dashboard Login
          </h1>
          <p className="text-blue-100 text-sm sm:text-base">
            {otpSent ? "Enter the code sent to your email" : "Enter your email to receive a login code"}
          </p>
        </div>

        {/* Form */}
        <div className="px-6 py-8">
          {!otpSent ? (
            // Email Form
            <form onSubmit={handleSendOTP} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <Input
                  id="email"
                  type="email"
                  placeholder="parent@example.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value)
                    setError(null)
                  }}
                  disabled={loading}
                  className="w-full h-12 text-base"
                  autoFocus
                  required
                />
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <Button
                type="submit"
                disabled={loading}
                className="w-full h-12 text-base font-semibold text-white"
                style={{ backgroundColor: '#0085B7' }}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Sending Code...
                  </>
                ) : (
                  <>
                    Send Login Code
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </>
                )}
              </Button>
            </form>
          ) : (
            // OTP Verification Form
            <form onSubmit={handleVerifyOTP} className="space-y-6">
              <div>
                <label htmlFor="email-display" className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <div className="flex items-center justify-between bg-gray-50 border border-gray-300 rounded-lg px-4 py-3">
                  <span className="text-sm text-gray-900">{email}</span>
                  <button
                    type="button"
                    onClick={() => {
                      setOtpSent(false)
                      setOtp("")
                      setError(null)
                    }}
                    className="text-sm font-medium hover:underline"
                    style={{ color: '#0085B7' }}
                  >
                    Change
                  </button>
                </div>
              </div>

              <div>
                <label htmlFor="otp" className="block text-sm font-medium text-gray-700 mb-2">
                  6-Digit Code
                </label>
                <Input
                  id="otp"
                  type="text"
                  inputMode="numeric"
                  placeholder="000000"
                  value={otp}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '').slice(0, 6)
                    setOtp(value)
                    setError(null)
                  }}
                  disabled={loading}
                  className="w-full h-12 text-center text-2xl font-mono tracking-widest"
                  maxLength={6}
                  autoFocus
                  required
                />
                <p className="mt-2 text-xs text-gray-500 text-center">
                  Code expires in {otpExpiresIn}
                </p>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                  {error}
                  {error.includes("register a student first") && (
                    <div className="mt-2">
                      <Link
                        href="/register"
                        className="font-semibold hover:underline"
                        style={{ color: '#0085B7' }}
                      >
                        Go to Registration →
                      </Link>
                    </div>
                  )}
                </div>
              )}

              <Button
                type="submit"
                disabled={loading || otp.length !== 6}
                className="w-full h-12 text-base font-semibold text-white"
                style={{ backgroundColor: '#0085B7' }}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  <>
                    <CheckCircle className="mr-2 h-5 w-5" />
                    Verify & Login
                  </>
                )}
              </Button>

              {/* Resend Code */}
              <div className="text-center">
                {resendCooldown > 0 ? (
                  <p className="text-sm text-gray-500">
                    Resend code in {resendCooldown}s
                  </p>
                ) : (
                  <button
                    type="button"
                    onClick={handleResendCode}
                    disabled={loading}
                    className="text-sm font-medium hover:underline"
                    style={{ color: '#0085B7' }}
                  >
                    Didn't receive the code? Resend
                  </button>
                )}
              </div>
            </form>
          )}

          {/* Back to Home Link */}
          <div className="mt-8 pt-6 border-t border-gray-200 text-center">
            <Link
              href="/"
              className="inline-flex items-center text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
            >
              <Home className="mr-2 h-4 w-4" />
              Back to Home
            </Link>
          </div>
        </div>
      </div>

      {/* Help Text */}
      <div className="mt-6 text-center">
        <p className="text-sm text-gray-600">
          Need help?{" "}
          <Link href="/contact" className="font-medium hover:underline" style={{ color: '#0085B7' }}>
            Contact Support
          </Link>
        </p>
      </div>
    </div>
  )
}
