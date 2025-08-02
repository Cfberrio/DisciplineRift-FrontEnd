import { Suspense } from "react"
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
import AnimatedSection from "@/components/animated-section"
import SuccessMessageHandler from "@/components/success-message-handler"
import { Button } from "@/components/ui/button"

function SuccessMessageSuspense() {
  return (
    <Suspense fallback={null}>
      <SuccessMessageHandler />
    </Suspense>
  )
}

export default function Home() {
  return (
    <div className="min-h-screen">
      <ScrollProgress />
      <Header />
      
      {/* Success Message Handler with Suspense */}
      <SuccessMessageSuspense />
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
                  <h2 className="text-3xl sm:text-4xl md:text-5xl ethnocentric-text-blue mb-4 sm:mb-6">ABOUT US</h2>
                </AnimatedSection>
                <AnimatedSection animation="fade-left" delay={400}>
                  <p className="mission-text-large text-gray-800 mb-6">
                  Discipline Rift introduces sports to players in a developmental approach by 
                  teaching the discipline of a sport and the value of discipline lived in 
                  a lifestyle involved in sports.

                  </p>
                </AnimatedSection>
                <AnimatedSection animation="fade-left" delay={600}>
                  <p className="mission-text-large text-gray-800 mb-8">
                  By teaching the sport, we create the conditions for something powerful to
                   happen: the breakthrough. 
                   The Rift. That moment when a player connects with the 
                   sport and discovers their love and passion for it. 
                   Our programs provide all the equipment and coaches needed to support this journey and build a strong, lasting
                  foundation for a 
                   lifestyle in sports. 

                  </p>
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
