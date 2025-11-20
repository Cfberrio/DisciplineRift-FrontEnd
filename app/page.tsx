"use client"

import { Suspense, useEffect } from "react"
import { usePathname } from "next/navigation"
import Link from "next/link"
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

function ScrollToSection() {
  const pathname = usePathname()

  useEffect(() => {
    // Mapeo de rutas a IDs de secciones
    const routeToSectionMap: { [key: string]: string } = {
      '/programs': 'programs',
      '/drexperience': 'experience',
      '/club': 'club',
      '/faq': 'faq',
      '/contact': 'contact',
      '/join-team': 'join-team',
      '/register': 'register',
    }

    const sectionId = routeToSectionMap[pathname]
    
    if (sectionId) {
      // Esperar a que la página cargue completamente
      const scrollToSection = () => {
        const element = document.getElementById(sectionId)
        if (element) {
          const elementPosition = element.getBoundingClientRect().top + window.pageYOffset
          
          if (sectionId === 'register') {
            // Para la sección de register, calcular offset dinámicamente según el tamaño de pantalla
            // En pantallas grandes (>= 1440px como MacBook Air/Pro), usar un offset mayor
            const viewportHeight = window.innerHeight
            const screenWidth = window.innerWidth
            
            let dynamicOffset = 0
            
            // MacBook Air 13" y superiores (típicamente 1440px+ de ancho)
            if (screenWidth >= 1440) {
              // Calcular offset basado en la altura de la ventana
              // Para asegurar que solo se vea la sección de register
              dynamicOffset = Math.min(viewportHeight * 0.15, 150)
            } else if (screenWidth >= 1024) {
              // Pantallas medianas (tablets landscape, laptops pequeños)
              dynamicOffset = Math.min(viewportHeight * 0.1, 100)
            }
            
            const offsetPosition = elementPosition - dynamicOffset

            window.scrollTo({
              top: offsetPosition,
              behavior: "smooth",
            })
          } else {
            // Para otras secciones, usar el offset del header
            const headerHeight = 80
            const offsetPosition = elementPosition - headerHeight

            window.scrollTo({
              top: offsetPosition,
              behavior: "smooth",
            })
          }
        } else {
          // Si el elemento no existe aún, intentar de nuevo
          setTimeout(scrollToSection, 100)
        }
      }

      // Ejecutar después de un pequeño delay para asegurar que el DOM esté listo
      setTimeout(scrollToSection, 100)
    } else if (pathname === '/') {
      // Si estamos en la ruta raíz, hacer scroll al inicio
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      })
    }
  }, [pathname])

  return null
}

export default function Home() {
  return (
    <div className="min-h-screen">
      <ScrollProgress />
      <Header />
      
      {/* Success Message Handler with Suspense */}
      <SuccessMessageSuspense />
      
      {/* Scroll to section handler */}
      <ScrollToSection />
      
      {/* SEO: H1 semántico invisible para buscadores */}
      <h1 className="sr-only">
        Discipline Rift - Elite Youth Sports Development Programs in Volleyball, Tennis and Pickleball
      </h1>
      
      <main className="flex flex-col bg-pattern gap-0">
        {/* Passion-inspired Hero Section (no id needed for nav) */}
        <PassionInspiredHero />

        {/* About Us Section with id="about" */}
        <section
          id="about"
          className="py-4 xs:py-6 sm:py-8 md:py-12 lg:py-16 bg-cover bg-center lg:min-h-screen about-container-mobile -mt-16 xs:-mt-20 sm:-mt-24 md:mt-0"
          style={{ backgroundImage: "url('/about-us-background.png')" }}
        >
          <div className="container px-4 relative z-10">
            {/* Mobile Layout */}
            <div className="flex flex-col md:hidden">
              {/* Title ABOUTUS at top for mobile */}
              <AnimatedSection animation="fade-up" delay={200}>
                <div className="mb-6 text-center">
                  <img
                    src="/01_WHAT_IS_DR.png"
                    alt="What is Discipline Rift - Youth sports development programs header"
                    className="w-auto h-12 xs:h-14 sm:h-16 object-contain mx-auto"
                  />
                </div>
              </AnimatedSection>

              {/* Text content in center for mobile */}
              <div className="mb-8 w-full flex flex-col items-center justify-center">
                <div className="w-full max-w-3xl">
                  <AnimatedSection animation="fade-up" delay={400}>
                    <div className="mb-4 xs:mb-6 px-4 xs:px-0 text-sm xs:text-base sm:text-lg about-text-mobile leading-relaxed" style={{ textAlign: 'center', width: '100%' }}>
                      Discipline Rift introduces sports to players in a <strong>developmental approach</strong> by 
                      teaching the discipline of a sport and the value of discipline lived in 
                      a <strong>lifestyle involved in sports</strong>.
                    </div>
                  </AnimatedSection>

                  <AnimatedSection animation="fade-up" delay={600}>
                    <div className="mb-6 xs:mb-8 px-4 xs:px-0 text-sm xs:text-base sm:text-lg about-text-mobile leading-relaxed" style={{ textAlign: 'center', width: '100%' }}>
                      By teaching the sport, we <strong>create the conditions</strong> for something <strong>powerful</strong> to
                      happen: the breakthrough. 
                      The Rift. That moment when a player connects with the 
                      sport and <strong>discovers their love</strong> and <strong>passion</strong> for it. 
                    </div>
                  </AnimatedSection>

                  <AnimatedSection animation="fade-up" delay={800}>
                    <div className="mb-6 xs:mb-8 px-4 xs:px-0 text-sm xs:text-base sm:text-lg about-text-mobile leading-relaxed" style={{ textAlign: 'center', width: '100%' }}>
                      Our programs provide <strong>all the equipment</strong> and coaches <strong>needed to support</strong> this journey and build a strong, lasting
                      foundation for a <strong>lifestyle in sports</strong>. 
                    </div>
                  </AnimatedSection>
                </div>
              </div>


              {/* Image at bottom for mobile */}
              <AnimatedSection animation="fade-up" delay={1000}>
                <div className="w-full">
                  <img
                    src="/Imagen-about-us.png"
                    alt="Young athletes training in youth sports program - Discipline Rift sports development"
                    className="w-full h-auto rounded-lg shadow-lg object-cover"
                  />
                </div>
              </AnimatedSection>
            </div>

            {/* Desktop Layout */}
            <div className="hidden md:flex flex-row items-center gap-8 md:gap-12">

              
              {/* Image on the left */}
              <div className="w-full md:w-1/2 lg:w-3/5">
                <AnimatedSection animation="fade-right" delay={200}>
                  <div className="relative md:-ml-12 lg:-ml-16">
                    <img
                      src="/Imagen-about-us.png"
                      alt="Young athletes training in youth sports program - Discipline Rift sports development"
                      className="w-full h-auto rounded-lg shadow-lg object-cover"
                    />
                  </div>
                </AnimatedSection>
              </div>

              {/* Text content on the right */}
              <div className="w-full md:w-1/2 lg:w-2/5 about-content-mobile md:ml-6 lg:ml-12">
                <AnimatedSection animation="fade-left" delay={200}>
                  <div className="mb-4 px-4 xs:px-0 about-title-mobile">
                    <img
                      src="/01_WHAT_IS_DR.png"
                      alt="What is Discipline Rift - Youth sports development programs header"
                      className="w-auto h-12 xs:h-14 sm:h-16 md:h-18 lg:h-20 object-contain"
                    />
                  </div>
                </AnimatedSection>
                <AnimatedSection animation="fade-left" delay={400}>
                  <p className="mission-text-large text-gray-800 mb-4 xs:mb-6 px-4 xs:px-0 text-sm xs:text-base sm:text-lg md:text-xl about-text-mobile text-left">
                  Discipline Rift introduces sports to players in a <strong>developmental approach</strong> by 
                  teaching the discipline of a sport and the value of discipline lived in 
                  a <strong>lifestyle involved in sports</strong>.
                  </p>
                </AnimatedSection>
                <AnimatedSection animation="fade-left" delay={600}>
                  <p className="mission-text-large text-gray-800 mb-6 xs:mb-8 px-4 xs:px-0 text-sm xs:text-base sm:text-lg md:text-xl about-text-mobile text-left">
                  By teaching the sport, we <strong>create the conditions</strong> for something <strong>powerful</strong> to
                   happen: the breakthrough. 
                   The Rift. That moment when a player connects with the 
                   sport and <strong>discovers their love</strong> and <strong>passion</strong> for it. 
                   
                  </p>
                </AnimatedSection>
                <AnimatedSection animation="fade-left" delay={600}>
                  <p className="mission-text-large text-gray-800 mb-6 xs:mb-8 px-4 xs:px-0 text-sm xs:text-base sm:text-lg md:text-xl about-text-mobile text-left">
      
                   Our programs provide <strong>all the equipment</strong> and coaches <strong>needed to support</strong> this journey and build a strong, lasting
                  foundation for a <strong>lifestyle in sports</strong>. 
                  </p>
                </AnimatedSection>
              </div>
            </div>
          </div>
        </section>

        {/* Programs Section - ProgramShowcase component has id="programs" internally */}
        <div>
          <ProgramShowcase />
        </div>

        {/* DR Experience Section - ExperienceSection component has id="experience" internally */}
        <div>
          <ExperienceSection />
        </div>

        {/* Club Section - ClubSection component has id="club" internally */}
        <div>
          <ClubSection />
        </div>

        {/* FAQ Section - FaqSection component has id="faq" internally */}
        <div>
          <FaqSection />
        </div>

        {/* Contact Section - ContactSection component has id="contact" internally */}
        <div>
          <ContactSection />
        </div>

        {/* Join Team Section - JoinTeamSection component has id="join-team" internally */}
        <div>
          <JoinTeamSection />
        </div>

        {/* Registration Section - RegisterSection component has id="register" internally */}
        <div>
          <RegisterSection />
        </div>
      </main>
      <EmailSignupManager />
    </div>
  )
}
