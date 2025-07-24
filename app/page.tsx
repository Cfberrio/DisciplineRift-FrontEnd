"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import ScrollProgress from "@/components/scroll-progress"
import Header from "@/components/header"
import PassionInspiredHero from "@/components/passion-inspired-hero"
import ExperienceSection from "@/components/experience-section"
import ProgramShowcase from "@/components/program-showcase"
import ClubSection from "@/components/club-section"
import FaqSection from "@/components/faq-section"
import ContactSection from "@/components/contact-section"
import RegisterSection from "@/components/register-section"
import EmailSignupManager from "@/components/email-signup-manager"
import { Button } from "@/components/ui/button"
import AnimatedSection from "@/components/animated-section"
import { CheckCircle, X } from "lucide-react"

export default function Home() {
  const searchParams = useSearchParams()
  const [showSuccessMessage, setShowSuccessMessage] = useState(false)

  useEffect(() => {
    const enrollment = searchParams.get("enrollment")
    if (enrollment === "success") {
      setShowSuccessMessage(true)
    }
  }, [searchParams])

  const handleCloseSuccessMessage = () => {
    setShowSuccessMessage(false)
    // Clean URL by removing query parameters
    window.history.replaceState({}, document.title, "/")
  }
  return (
    <div className="min-h-screen">
      <ScrollProgress />
      <Header />
      
      {/* Success Message Overlay */}
      {showSuccessMessage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-8 relative">
            <button
              onClick={handleCloseSuccessMessage}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
            
            <div className="text-center">
              <div className="bg-green-100 rounded-full p-4 w-20 h-20 mx-auto mb-6">
                <CheckCircle className="h-12 w-12 text-green-600 mx-auto" />
              </div>
              
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                🎉 Congratulations!
              </h2>
              
              <p className="text-xl text-gray-700 mb-2">
                You are now enrolled!
              </p>
              
              <p className="text-gray-600 mb-6">
                Welcome to Discipline Rift! You'll receive a confirmation email shortly with all the details about your enrollment.
              </p>
              
              <div className="bg-blue-50 p-4 rounded-lg mb-6">
                <h4 className="font-semibold text-blue-900 mb-2">What's Next?</h4>
                <ul className="text-sm text-blue-800 text-left space-y-1">
                  <li>• Check your email for confirmation details</li>
                  <li>• Your coach will contact you soon</li>
                  <li>• Access your dashboard for updates</li>
                  <li>• Get ready for an amazing experience!</li>
                </ul>
              </div>
              
              <Button 
                onClick={handleCloseSuccessMessage}
                className="w-full bg-dr-blue hover:bg-blue-700"
              >
                Continue Exploring
              </Button>
            </div>
          </div>
        </div>
      )}
      <main className="flex flex-col bg-pattern">
        {/* Passion-inspired Hero Section (no id needed for nav) */}
        <PassionInspiredHero />

        {/* About Us Section with id="about" */}
        <section
          id="about"
          className="py-20 bg-cover bg-center"
          style={{ backgroundImage: "url('/about-us-background.png')" }}
        >
          <div className="container px-4">
            <div className="flex justify-end">
              <div className="md:w-1/2 lg:w-2/5">
                <AnimatedSection animation="fade-left" delay={200}>
                  <h2 className="text-4xl md:text-5xl ethnocentric-text-blue mb-6">OUR MISSION</h2>
                </AnimatedSection>
                <AnimatedSection animation="fade-left" delay={400}>
                  <p className="mission-text-large text-gray-800 mb-6">
                    We're dedicated to developing athletic talent and leadership skills in young players across
                    volleyball, tennis, and pickleball. Our programs combine technical training, competitive play, and
                    character development to create well-rounded athletes and leaders.
                  </p>
                </AnimatedSection>
                <AnimatedSection animation="fade-left" delay={600}>
                  <p className="mission-text-large text-gray-800 mb-8">
                    Founded by former collegiate and professional players, our organization brings world-class
                    instruction to athletes of all ages and skill levels, helping to build sustainable programs that
                    empower students both on and off the court.
                  </p>
                </AnimatedSection>
                <AnimatedSection animation="fade-up" delay={800}>
                  <Button
                    variant="outline"
                    className="border-dr-blue text-dr-blue hover:bg-blue-50 rounded-full px-6 bg-transparent"
                  >
                    Our Story
                  </Button>
                </AnimatedSection>
              </div>
            </div>
          </div>
        </section>

        {/* Programs Section - ProgramShowcase component has id="programs" internally */}
        <div id="programs">
          <ProgramShowcase />
        </div>

        {/* DR Experience Section - ExperienceSection component has id="experience" internally */}
        <div id="experience">
          <ExperienceSection />
        </div>

        {/* Club Section - ClubSection component has id="club" internally */}
        <div id="club">
          <ClubSection />
        </div>

        {/* FAQ Section - FaqSection component has id="faq" internally */}
        <div id="faq">
          <FaqSection />
        </div>

        {/* Contact Section - ContactSection component has id="contact" internally */}
        <div id="contact">
          <ContactSection />
        </div>

        {/* Registration Section - RegisterSection component has id="register" internally */}
        <div id="register">
          <RegisterSection />
        </div>
      </main>
      <EmailSignupManager />
    </div>
  )
}
