"use client"

import { useState } from "react"
import { Loader2, CheckCircle, AlertCircle, Users, Target, Calendar, Video, Award, MessageCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import AnimatedSection from "@/components/animated-section"

interface PartnerResourcesLandingProps {
  whatsappLink: string
  groupType: "2-3" | "4-5"
}

export default function PartnerResourcesLanding({ whatsappLink, groupType }: PartnerResourcesLandingProps) {
  const [formData, setFormData] = useState({
    parentName: "",
    playerName: "",
    email: "",
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState("")

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    if (submitError) setSubmitError("")
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (isSubmitting) return
    
    setIsSubmitting(true)
    setSubmitError("")

    try {
      // Validate required fields
      if (!formData.parentName.trim() || formData.parentName.trim().length < 2) {
        throw new Error("Parent name must be at least 2 characters long")
      }
      
      if (!formData.playerName.trim() || formData.playerName.trim().length < 2) {
        throw new Error("Player name must be at least 2 characters long")
      }

      if (!formData.email.trim() || !formData.email.includes("@")) {
        throw new Error("Please provide a valid email address")
      }

      console.log("Creating checkout session for Partner Program:", formData)
      
      const response = await fetch("/api/partner-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          parentName: formData.parentName.trim(),
          playerName: formData.playerName.trim(),
          email: formData.email.trim(),
          groupType,
          whatsappLink,
        }),
      })
      
      const result = await response.json()
      
      if (!response.ok) {
        throw new Error(result.error || "Failed to create checkout session")
      }
      
      // Redirect to Stripe Checkout
      if (result.url) {
        console.log("Redirecting to Stripe Checkout:", result.url)
        window.location.href = result.url
      } else {
        throw new Error("No checkout URL provided")
      }
      
    } catch (error) {
      console.error("Checkout error:", error)
      setSubmitError(
        error instanceof Error 
          ? error.message 
          : "An error occurred while processing your request. Please try again."
      )
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      {/* Header Section */}
      <section className="py-12 sm:py-16 md:py-20 bg-gradient-to-r from-[#0085B7] to-[#005a7d] text-white">
        <div className="container px-4">
          <AnimatedSection animation="fade-down" className="text-center">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-4 tracking-tight">
              Partner Program
            </h1>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-semibold text-white/90">
              LiveFootball Partners
            </h2>
          </AnimatedSection>
        </div>
      </section>

      {/* Intro Section */}
      <section className="py-12 sm:py-16 md:py-20">
        <div className="container px-4">
          <AnimatedSection animation="fade-up" className="max-w-4xl mx-auto">
            <div className="bg-white rounded-xl shadow-lg p-6 sm:p-8 md:p-10 border-l-4 border-[#0085B7]">
              <p className="text-lg sm:text-xl text-gray-700 leading-relaxed">
                <strong className="text-[#0085B7]">LiveFootball Partners</strong> are the parents of our Flag Football players. 
                These partners help us <strong>develop players who improve their skills</strong> and <strong>build players who love the sport</strong>. 
                Discipline Rift works with parents, not just with athletes.
              </p>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* Main Title */}
      <section className="py-8 bg-gray-100">
        <div className="container px-4">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-center text-gray-900">
            Flag Football – Partner Resources
          </h2>
        </div>
      </section>

      {/* What Partners Receive */}
      <section className="py-12 sm:py-16 md:py-20">
        <div className="container px-4">
          <AnimatedSection animation="fade-up" className="max-w-5xl mx-auto">
            <h3 className="text-2xl sm:text-3xl font-bold text-center mb-10 text-gray-900">
              What Partners Receive
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {/* Card 1 */}
              <div className="bg-white rounded-lg shadow-md p-6 border-t-4 border-[#0085B7]">
                <div className="flex items-start">
                  <Target className="h-8 w-8 text-[#0085B7] mr-4 flex-shrink-0 mt-1" />
                  <div>
                    <h4 className="text-xl font-semibold mb-3 text-gray-900">Tailored Drills, Games & Activities</h4>
                    <p className="text-gray-700 leading-relaxed">
                      Practice at home with your child using weekly structured resources built as a supplement to Discipline Rift practices.
                    </p>
                    <ul className="mt-3 space-y-1 text-gray-600">
                      <li>• 3 activities per week</li>
                      <li>• 3 games per week</li>
                      <li>• 3 drills per week</li>
                    </ul>
                    <p className="mt-3 text-sm text-gray-600 italic">
                      Choose which ones to do based on time and player needs.
                    </p>
                  </div>
                </div>
              </div>

              {/* Card 2 */}
              <div className="bg-white rounded-lg shadow-md p-6 border-t-4 border-[#0085B7]">
                <div className="flex items-start">
                  <Video className="h-8 w-8 text-[#0085B7] mr-4 flex-shrink-0 mt-1" />
                  <div>
                    <h4 className="text-xl font-semibold mb-3 text-gray-900">Supplemental Videos</h4>
                    <p className="text-gray-700 leading-relaxed">
                      Created by Discipline Rift and supported by associate programs. These associates help fund the program so we can provide resources consistently.
                    </p>
                  </div>
                </div>
              </div>

              {/* Card 3 */}
              <div className="bg-white rounded-lg shadow-md p-6 border-t-4 border-[#0085B7]">
                <div className="flex items-start">
                  <Award className="h-8 w-8 text-[#0085B7] mr-4 flex-shrink-0 mt-1" />
                  <div>
                    <h4 className="text-xl font-semibold mb-3 text-gray-900">Equipment Guidance</h4>
                    <p className="text-gray-700 leading-relaxed">
                      Links to recommended materials (optional). Links focus on <strong>affordable, best-value options</strong> so parents don't need to research.
                    </p>
                  </div>
                </div>
              </div>

              {/* Card 4 */}
              <div className="bg-white rounded-lg shadow-md p-6 border-t-4 border-[#0085B7]">
                <div className="flex items-start">
                  <MessageCircle className="h-8 w-8 text-[#0085B7] mr-4 flex-shrink-0 mt-1" />
                  <div>
                    <h4 className="text-xl font-semibold mb-3 text-gray-900">Coach Engagement</h4>
                    <p className="text-gray-700 leading-relaxed">
                      Coaches will follow up via <strong>WhatsApp groups</strong> and <strong>in-person at practices</strong>.
                    </p>
                    <p className="mt-3 text-gray-700">
                      Feedback is:
                    </p>
                    <ul className="mt-2 space-y-1 text-gray-600">
                      <li>• Specific to the player</li>
                      <li>• Based on what coaches see during practice</li>
                      <li>• Focused on what parents can do at home to help their child improve</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* Commitment Requirements */}
      <section className="py-12 sm:py-16 md:py-20 bg-gray-50">
        <div className="container px-4">
          <AnimatedSection animation="fade-up" className="max-w-4xl mx-auto">
            <h3 className="text-2xl sm:text-3xl font-bold text-center mb-10 text-gray-900">
              Commitment Requirements
            </h3>
            
            <div className="bg-white rounded-xl shadow-lg p-6 sm:p-8 md:p-10 space-y-6">
              {/* Practice Commitment */}
              <div className="border-l-4 border-[#0085B7] pl-6">
                <div className="flex items-center mb-3">
                  <Calendar className="h-6 w-6 text-[#0085B7] mr-3" />
                  <h4 className="text-xl font-semibold text-gray-900">Practice Commitment</h4>
                </div>
                <p className="text-gray-700 leading-relaxed">
                  <strong>Minimum 2 at-home practices per week.</strong> Parents may practice 2 or more times per week using the provided drills, games, and activities.
                </p>
              </div>

              {/* Proof of Practice */}
              <div className="border-l-4 border-[#0085B7] pl-6">
                <div className="flex items-center mb-3">
                  <CheckCircle className="h-6 w-6 text-[#0085B7] mr-3" />
                  <h4 className="text-xl font-semibold text-gray-900">Proof of Practice (Flexible Options)</h4>
                </div>
                <p className="text-gray-700 leading-relaxed mb-3">
                  Every time parents practice, they must submit proof using <strong>one of the two options</strong>:
                </p>
                <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                  <div>
                    <p className="font-semibold text-gray-900 mb-1">Option 1:</p>
                    <p className="text-gray-700">Upload a picture of the child completing the activity</p>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 mb-1">Option 2:</p>
                    <p className="text-gray-700">Complete a short questionnaire describing:</p>
                    <ul className="mt-2 ml-4 space-y-1 text-gray-600">
                      <li>• How the drill went</li>
                      <li>• Player performance</li>
                      <li>• Strengths and areas for improvement</li>
                      <li>• Honest, constructive feedback about their own child</li>
                    </ul>
                  </div>
                </div>
                <p className="mt-3 text-sm text-gray-600 italic">
                  Parents may choose either option each time.
                </p>
              </div>

              {/* Refund Logic */}
              <div className="border-l-4 border-yellow-500 pl-6 bg-yellow-50 p-4 rounded-r-lg">
                <div className="flex items-center mb-3">
                  <Users className="h-6 w-6 text-yellow-600 mr-3" />
                  <h4 className="text-xl font-semibold text-gray-900">Refund Eligibility</h4>
                </div>
                <p className="text-gray-700 leading-relaxed">
                  Refund eligibility depends on <strong>meeting minimum practice commitment</strong> and <strong>submitting proof consistently</strong>. 
                  This program is built on accountability and partnership.
                </p>
              </div>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* Registration Form */}
      <section className="py-12 sm:py-16 md:py-20 bg-gradient-to-b from-gray-50 to-white">
        <div className="container px-4">
          <AnimatedSection animation="fade-up" className="max-w-2xl mx-auto">
            <div className="bg-white rounded-xl shadow-2xl p-6 sm:p-8 md:p-10 border-t-4 border-[#0085B7]">
              <h3 className="text-2xl sm:text-3xl font-bold text-center mb-2 text-gray-900">
                Join the Partner Program
              </h3>
              <p className="text-center text-gray-600 mb-8">
                Investment: <span className="text-2xl font-bold text-[#0085B7]">$50</span>
              </p>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Parent Name */}
                <div>
                  <label htmlFor="parentName" className="block text-gray-700 font-medium mb-2">
                    Parent Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="parentName"
                    name="parentName"
                    value={formData.parentName}
                    onChange={handleChange}
                    required
                    className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0085B7] focus:border-[#0085B7] text-gray-900 bg-white"
                    placeholder="Enter your full name"
                  />
                </div>

                {/* Player Name */}
                <div>
                  <label htmlFor="playerName" className="block text-gray-700 font-medium mb-2">
                    Player Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="playerName"
                    name="playerName"
                    value={formData.playerName}
                    onChange={handleChange}
                    required
                    className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0085B7] focus:border-[#0085B7] text-gray-900 bg-white"
                    placeholder="Enter player's full name"
                  />
                </div>

                {/* Email */}
                <div>
                  <label htmlFor="email" className="block text-gray-700 font-medium mb-2">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0085B7] focus:border-[#0085B7] text-gray-900 bg-white"
                    placeholder="your.email@example.com"
                  />
                  <p className="mt-2 text-sm text-gray-500">
                    You'll receive your WhatsApp group link via email after payment
                  </p>
                </div>

                {/* Error Message */}
                {submitError && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-start">
                    <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
                    <span className="text-sm">{submitError}</span>
                  </div>
                )}

                {/* Submit Button */}
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full text-white rounded-lg py-4 shadow-lg transition-all duration-200 text-lg font-bold hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ backgroundColor: '#0085B7' }}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      Pay Now - $50
                    </>
                  )}
                </Button>

                <p className="text-center text-sm text-gray-500 mt-4">
                  Secure payment powered by Stripe
                </p>
              </form>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* Footer Note */}
      <section className="py-8 bg-gray-900 text-white">
        <div className="container px-4 text-center">
          <p className="text-sm text-gray-400">
            © {new Date().getFullYear()} Discipline Rift (Torres Rivero LLC). All rights reserved.
          </p>
        </div>
      </section>
    </div>
  )
}
