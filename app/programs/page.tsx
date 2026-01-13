"use client"

import { Suspense, useEffect } from "react"
import { usePathname } from "next/navigation"
import Script from "next/script"
import ScrollProgress from "@/components/scroll-progress"
import Header from "@/components/header"
import PassionInspiredHero from "@/components/passion-inspired-hero"
import ExperienceSection from "@/components/experience-section"
import ProgramShowcase from "@/components/program-showcase"
import ClubSection from "@/components/club-section"
import FaqSection from "@/components/faq-section"
import ContactSection from "@/components/contact-section"
import JoinTeamSection from "@/components/join-team-section"
import RegisterSection from "@/components/register-section"
import EmailSignupManager from "@/components/email-signup-manager"
import SuccessMessageHandler from "@/components/success-message-handler"

function SuccessMessageSuspense() {
  return (
    <Suspense fallback={null}>
      <SuccessMessageHandler />
    </Suspense>
  )
}

function ScrollToPrograms() {
  useEffect(() => {
    setTimeout(() => {
      const element = document.getElementById("programs")
      if (element) {
        const headerHeight = 80
        const elementPosition = element.getBoundingClientRect().top + window.pageYOffset
        const offsetPosition = elementPosition - headerHeight
        window.scrollTo({
          top: offsetPosition,
          behavior: "smooth",
        })
      }
    }, 100)
  }, [])
  return null
}

export default function ProgramsPage() {
  const siteUrl = 'https://www.disciplinerift.com'
  const pageUrl = `${siteUrl}/programs`
  
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": siteUrl
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "Programs",
        "item": pageUrl
      }
    ]
  }

  return (
    <>
      {/* JSON-LD Breadcrumbs */}
      <Script
        id="breadcrumb-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      <div className="min-h-screen">
        <ScrollProgress />
        <Header />
        
        <SuccessMessageSuspense />
        <ScrollToPrograms />
        
        <main className="flex flex-col bg-pattern gap-0">
          <PassionInspiredHero />

          <div id="programs">
            <ProgramShowcase />
          </div>

          <div id="experience">
            <ExperienceSection />
          </div>

          <div id="club">
            <ClubSection />
          </div>

          <div id="faq">
            <FaqSection />
          </div>

          <div id="contact">
            <ContactSection />
          </div>

          <div id="join-team">
            <JoinTeamSection />
          </div>

          <div id="register">
            <RegisterSection />
          </div>
        </main>
        
        {/* Footer */}
        <footer className="bg-gray-900 text-white py-6">
          <div className="container mx-auto px-4">
            <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mb-3">
              <a href="/privacy-policy" className="text-sm hover:text-blue-400 transition-colors" target="_blank" rel="noopener noreferrer">
                Privacy Policy
              </a>
              <span className="hidden sm:inline text-gray-500">|</span>
              <a href="/terms-of-use" className="text-sm hover:text-blue-400 transition-colors" target="_blank" rel="noopener noreferrer">
                Terms of Use
              </a>
            </div>
            <p className="text-center text-sm text-gray-400">
              Copyright © 2025 Discipline Rift (Torres Rivero LLC). All rights reserved.
            </p>
          </div>
        </footer>
        
        <EmailSignupManager />
      </div>
    </>
  )
}
