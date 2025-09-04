"use client"
import Link from "next/link"
import { ArrowRight, Star, User, Trophy, Shield, Target } from "lucide-react"
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
        <AnimatedSection animation="fade-down" className="text-center">
          <h2 className="text-xl xs:text-2xl sm:text-3xl md:text-4xl lg:text-5xl wild-youth-text-white mb-3 xs:mb-4 sm:mb-6 relative px-4 xs:px-0">
            <span className="text-xl xs:text-2xl sm:text-3xl md:text-4xl lg:text-5xl wild-youth-text-white xs:mb-4 sm:mb-6 px-4 xs:px-0">OUR CLUB</span>
            {/* Optional: Brush stroke if it fits the new design */}
            {/* <div className="absolute inset-0 bg-brush-stroke bg-no-repeat bg-center bg-contain opacity-20"></div> */}
          </h2>
          <div className="flex justify-center mb-6 xs:mb-8 sm:mb-10">
            <div className="w-16 xs:w-20 h-1 rounded-full bg-white"></div>
          </div>
        </AnimatedSection>

        {/* Girls Club Text */}
        <AnimatedSection animation="fade-down" className="mb-8 xs:mb-10 sm:mb-12">
          <h3 className="text-lg xs:text-xl sm:text-2xl md:text-3xl ethnocentric-title-white mb-4 xs:mb-6 text-left max-w-4xl mx-auto px-4">GIRLS CLUB</h3>
          <p className="text-sm xs:text-base sm:text-lg text-white max-w-4xl mx-auto px-4 text-left">
            Is a fun and challenging program for young athletes who want to improve their skills and play as part of
            a team. With two practices each week, our players learn advanced techniques and prepare for local and regional
            tournaments—all in a positive and supportive environment where they can grow, compete, and make new friends.
          </p>
        </AnimatedSection>

        {/* Volleyball Club */}
        <AnimatedSection animation="fade-up" className="mb-8 xs:mb-10 sm:mb-12">
          <div className="bg-white/20 backdrop-blur-md p-4 xs:p-6 sm:p-8 rounded-lg shadow-xl border border-white/30 max-w-4xl mx-auto">
            <h3 className="text-lg xs:text-xl sm:text-2xl md:text-3xl ethnocentric-title-white mb-4 xs:mb-6 text-left">VOLLEYBALL CLUB</h3>
            <p className="text-sm xs:text-base sm:text-lg text-white mb-4 xs:mb-6 text-left">
              Starting players are developed into high-performance athletes through advanced coaching, values, and a strong club family to build a lasting passion for the game.
            </p>
            <p className="text-sm xs:text-base sm:text-lg text-white mb-6 xs:mb-8 text-left">
              Whether you're aiming for competitive play or looking to develop your skills in a friendly setting, we have a place for you.
            </p>
            <div className="flex items-center justify-start space-x-2 xs:space-x-3">
              <Star className="h-6 xs:h-8 w-6 xs:w-8 text-white" />
              <span className="text-sm xs:text-base sm:text-lg md:text-xl text-white font-semibold">FIND THE RIGHT PROGRAM FOR YOUR CHILD</span>
            </div>
          </div>
        </AnimatedSection>

        {/* Three Components in a Row */}
        <StaggeredChildren
          className="grid grid-cols-1 md:grid-cols-3 gap-4 xs:gap-6 mb-8 xs:mb-10 px-4"
          staggerAmount={150}
          animation="fade-up"
        >
          {[
            {
              icon: Trophy,
              title: "Advanced skills training",
              description: "",
            },
            {
              icon: User,
              title: "Two practices each week",
              description: "",
            },
            {
              icon: Shield,
              title: "Participation in local and regional tournaments",
              description: "",
            },
          ].map((item, index) => (
            <div
              key={index}
              className="bg-white/10 p-4 xs:p-6 rounded-lg backdrop-blur-sm border border-white/20 transform hover:scale-105 transition-transform text-left"
            >
              <item.icon className="h-8 xs:h-10 w-8 xs:w-10 mb-3 xs:mb-4 text-white" />
              <h4 className="font-bold mb-2 text-white text-sm xs:text-base">{item.title}</h4>
              <p className="text-xs xs:text-sm text-white/80">{item.description}</p>
            </div>
          ))}
        </StaggeredChildren>

        {/* Call to Action Button */}
        <AnimatedSection animation="fade-up" className="text-center" delay={800}>
          <Button className="bg-white hover:bg-gray-100 rounded-full px-2 xs:px-4 sm:px-8 py-1 xs:py-2 sm:py-3 shadow-lg transform transition-transform hover:scale-105">
            <Link
              href="#register"
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
