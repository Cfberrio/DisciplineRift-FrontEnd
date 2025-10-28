"use client"
import Link from "next/link"
import { ArrowRight, CheckCircle, User, Calendar, MapPin } from "lucide-react"
import { Button } from "@/components/ui/button"
import AnimatedSection from "@/components/animated-section"
import StaggeredChildren from "@/components/staggered-children"

export default function ClubSection() {
  return (
    <section
      className="py-8 xs:py-12 sm:py-16 md:py-20 relative overflow-hidden bg-cover bg-center min-h-screen"
      id="club"
      style={{ backgroundImage: "url('/our-club-background.png')" }}
    >
      {/* Optional: Subtle overlay if needed for text readability, can be adjusted */}
      <div className="absolute inset-0 bg-black/10 z-0"></div>

      <div className="container px-4 relative z-10">
        <AnimatedSection animation="fade-down" className="text-center mb-6 xs:mb-8 sm:mb-10">
          <img 
            src="/04_OUR_VOLLEYBALL_CLUB.png" 
            alt="Our Volleyball Club" 
            className="mx-auto max-w-full h-auto"
            style={{ maxHeight: '200px' }}
          />
        </AnimatedSection>

        <AnimatedSection animation="fade-up" className="text-center mb-8 xs:mb-10 sm:mb-12">
          <p className="text-sm xs:text-base sm:text-lg text-white max-w-4xl mx-auto px-4">
            Starting players are developed into high-performance athletes through advanced coaching, values, and a strong club family to build a lasting passion for the game.
          </p>
        </AnimatedSection>

        <AnimatedSection animation="fade-up" className="text-center mb-8 xs:mb-10 sm:mb-12">
          <div className="flex items-center justify-center space-x-2 xs:space-x-3 max-w-4xl mx-auto px-4">
            <span className="text-xl xs:text-2xl sm:text-3xl text-white flex-shrink-0" style={{ filter: 'brightness(0) invert(1)' }}>⭐</span>
            <h3 className="text-sm xs:text-base sm:text-xl md:text-2xl lg:text-3xl ethnocentric-title-white text-center leading-tight">
              FIND THE RIGHT CLUB FOR YOUR CHILD
            </h3>
          </div>
        </AnimatedSection>


        {/* Volleyball Club Cards */}
        <AnimatedSection animation="fade-up" className="mb-8 xs:mb-10 sm:mb-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-6xl mx-auto px-4">
            {/* Left Card */}
            <div className="bg-white/20 backdrop-blur-md p-4 xs:p-6 sm:p-8 rounded-lg shadow-xl border border-white/30">
              <h3 className="text-lg xs:text-xl sm:text-2xl md:text-3xl ethnocentric-title-white mb-6 text-center">CLUB</h3>
              
              <div className="space-y-4">
                {/* Advanced skills training */}
                <div className="flex items-center space-x-3">
                  <img 
                    src="/04_SKILLS_CLUB_OURVCLUB.png" 
                    alt="Skills Icon" 
                    className="w-6 h-6 xs:w-8 xs:h-8 flex-shrink-0"
                  />
                  <span className="text-sm xs:text-base sm:text-lg text-white">Advanced skills training</span>
                </div>
                
                {/* Two practices each week */}
                <div className="flex items-center space-x-3">
                  <img 
                    src="/04_PRACTICE_CLUB_OURVCLUB.png" 
                    alt="Practice Icon" 
                    className="w-6 h-6 xs:w-8 xs:h-8 flex-shrink-0"
                  />
                  <span className="text-sm xs:text-base sm:text-lg text-white">Two practices each week</span>
                </div>
                
                {/* Participation in tournaments */}
                <div className="flex items-center space-x-3">
                  <img 
                    src="/04_PARTICIPATION_ICON_CLUB_OURVCLOUB.png" 
                    alt="Participation Icon" 
                    className="w-6 h-6 xs:w-8 xs:h-8 flex-shrink-0"
                  />
                  <span className="text-sm xs:text-base sm:text-lg text-white">Participation in local and regional tournaments</span>
                </div>
              </div>
            </div>

            {/* Right Card */}
            <div className="bg-white/20 backdrop-blur-md p-4 xs:p-6 sm:p-8 rounded-lg shadow-xl border border-white/30">
              <h3 className="text-lg xs:text-xl sm:text-2xl md:text-3xl ethnocentric-title-white mb-6 text-center">MINI CLUB</h3>
              
              <div className="space-y-4">
                {/* Advanced skills training */}
                <div className="flex items-center space-x-3">
                  <img 
                    src="/04_SKILLS_CLUB_OURVCLUB.png" 
                    alt="Skills Icon" 
                    className="w-6 h-6 xs:w-8 xs:h-8 flex-shrink-0"
                  />
                  <span className="text-sm xs:text-base sm:text-lg text-white">Focus on fundamentals once per week</span>
                </div>
                
                {/* Two practices each week */}
                <div className="flex items-center space-x-3">
                  <img 
                    src="/04_PRACTICE_CLUB_OURVCLUB.png" 
                    alt="Practice Icon" 
                    className="w-6 h-6 xs:w-8 xs:h-8 flex-shrink-0"
                  />
                  <span className="text-sm xs:text-base sm:text-lg text-white">Practice and preparation for tournaments</span>
                </div>
                
                {/* Participation in tournaments */}
                <div className="flex items-center space-x-3">
                  <img 
                    src="/04_PARTICIPATION_ICON_CLUB_OURVCLOUB.png" 
                    alt="Participation Icon" 
                    className="w-6 h-6 xs:w-8 xs:h-8 flex-shrink-0"
                  />
                  <span className="text-sm xs:text-base sm:text-lg text-white">Friendly matches and beginner-level competitions</span>
                </div>
              </div>
            </div>
          </div>
        </AnimatedSection>

        

        {/* Call to Action Button */}
        <AnimatedSection animation="fade-up" className="text-center" delay={800}>
          <Button className="bg-white hover:bg-gray-100 rounded-full px-2 xs:px-4 sm:px-8 py-1 xs:py-2 sm:py-3 shadow-lg transform transition-transform hover:scale-105">
            <Link
              href="/register"
              className="flex items-center justify-center ethnocentric-title-blue not-italic
                        text-base sm:text-base        /* ↑ móvil más grande; desktop igual */
                        leading-tight whitespace-normal text-center px-3"
              style={{ color: '#0085B7' }}
            >
              JOIN US FOR ONE PRACTICE OR TRYOUTS
            </Link>
          </Button>
        </AnimatedSection>

      </div>
    </section>
  )
}
