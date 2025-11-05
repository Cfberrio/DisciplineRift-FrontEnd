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

function ScrollToContact() {
  useEffect(() => {
    setTimeout(() => {
      const element = document.getElementById("contact")
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

export default function ContactPage() {
  const siteUrl = 'https://www.disciplinerift.com'
  const pageUrl = `${siteUrl}/contact`
  
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
        "name": "Contact",
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
        <ScrollToContact />
        
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
        
        <EmailSignupManager />
      </div>
    </>
  )
}
