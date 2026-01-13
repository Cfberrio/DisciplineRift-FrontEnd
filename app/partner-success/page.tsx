"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { CheckCircle, Mail, MessageCircle, Home, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import AnimatedSection from "@/components/animated-section"

export default function PartnerSuccessPage() {
  const searchParams = useSearchParams()
  const sessionId = searchParams.get("session_id")
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Simulate a brief loading state for better UX
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 text-[#0085B7] animate-spin mx-auto mb-4" />
          <p className="text-gray-600 text-lg">Processing your payment...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      {/* Success Header */}
      <section className="py-12 sm:py-16 md:py-20 bg-gradient-to-r from-[#0085B7] to-[#005a7d] text-white">
        <div className="container px-4">
          <AnimatedSection animation="fade-down" className="text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-white rounded-full mb-6">
              <CheckCircle className="h-12 w-12 text-green-500" />
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-4 tracking-tight">
              Payment Confirmed!
            </h1>
            <p className="text-xl sm:text-2xl text-white/90 max-w-2xl mx-auto">
              Welcome to the Flag Football Partner Program
            </p>
          </AnimatedSection>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-12 sm:py-16 md:py-20">
        <div className="container px-4">
          <div className="max-w-3xl mx-auto">
            
            {/* Success Message */}
            <AnimatedSection animation="fade-up" className="mb-8">
              <div className="bg-white rounded-xl shadow-lg p-6 sm:p-8 md:p-10 border-t-4 border-green-500">
                <div className="text-center mb-8">
                  <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
                    🎉 You're All Set!
                  </h2>
                  <p className="text-lg text-gray-700 leading-relaxed">
                    Your payment has been successfully processed. We're excited to partner with you 
                    in developing your child's flag football skills!
                  </p>
                </div>

                {/* Next Steps */}
                <div className="space-y-6">
                  <div className="bg-blue-50 rounded-lg p-6 border-l-4 border-[#0085B7]">
                    <div className="flex items-start">
                      <Mail className="h-6 w-6 text-[#0085B7] mr-4 flex-shrink-0 mt-1" />
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">
                          Check Your Email
                        </h3>
                        <p className="text-gray-700 leading-relaxed">
                          We've sent a confirmation email with your <strong>WhatsApp group link</strong> and 
                          all the program details. Please check your inbox (and spam folder, just in case!).
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-green-50 rounded-lg p-6 border-l-4 border-green-500">
                    <div className="flex items-start">
                      <MessageCircle className="h-6 w-6 text-green-600 mr-4 flex-shrink-0 mt-1" />
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">
                          Join Your WhatsApp Group
                        </h3>
                        <p className="text-gray-700 leading-relaxed">
                          Click the WhatsApp link in your email to join your exclusive partner group. 
                          This is where you'll receive weekly drills, games, videos, and direct coach feedback.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-yellow-50 rounded-lg p-6 border-l-4 border-yellow-500">
                    <div className="flex items-start">
                      <CheckCircle className="h-6 w-6 text-yellow-600 mr-4 flex-shrink-0 mt-1" />
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">
                          Start Practicing
                        </h3>
                        <p className="text-gray-700 leading-relaxed">
                          Once you join the group, you'll immediately have access to practice resources. 
                          Remember: <strong>minimum 2 at-home practices per week</strong> with proof of practice submission.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Important Reminder */}
                <div className="mt-8 p-6 bg-gray-100 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-2 text-center">
                    📌 Important Reminder
                  </h4>
                  <p className="text-gray-700 text-center">
                    If you don't see the email within a few minutes, please check your spam or junk folder. 
                    If you still can't find it, contact us at{" "}
                    <a 
                      href="mailto:info@disciplinerift.com" 
                      className="text-[#0085B7] font-semibold hover:underline"
                    >
                      info@disciplinerift.com
                    </a>
                  </p>
                </div>

                {/* Session ID (for reference) */}
                {sessionId && (
                  <div className="mt-6 text-center">
                    <p className="text-sm text-gray-500">
                      Transaction ID: <span className="font-mono">{sessionId}</span>
                    </p>
                  </div>
                )}
              </div>
            </AnimatedSection>

            {/* Call to Action */}
            <AnimatedSection animation="fade-up" className="text-center">
              <Link href="/">
                <Button 
                  className="text-white rounded-lg py-6 px-8 shadow-lg transition-all duration-200 text-lg font-bold hover:shadow-xl"
                  style={{ backgroundColor: '#0085B7' }}
                >
                  <Home className="mr-2 h-5 w-5" />
                  Return to Home
                </Button>
              </Link>
            </AnimatedSection>

            {/* Motivational Message */}
            <AnimatedSection animation="fade-up" className="mt-12">
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900 mb-2">
                  Let's Build Champions Together! 🏆
                </p>
                <p className="text-lg text-gray-600">
                  We're here to support you every step of the way.
                </p>
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* Footer */}
      <section className="py-8 bg-gray-900 text-white">
        <div className="container px-4 text-center">
          <p className="text-sm text-gray-400">
            © {new Date().getFullYear()} Discipline Rift (Torres Rivero LLC). All rights reserved.
          </p>
          <div className="mt-2">
            <Link href="/privacy-policy" className="text-gray-400 hover:text-white text-sm mx-2">
              Privacy Policy
            </Link>
            <span className="text-gray-600">|</span>
            <Link href="/terms-of-use" className="text-gray-400 hover:text-white text-sm mx-2">
              Terms of Use
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
