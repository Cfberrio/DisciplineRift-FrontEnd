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
