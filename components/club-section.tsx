"use client"
import Link from "next/link"
import { ArrowRight, Star, Users, Trophy, ShieldCheck, Target } from "lucide-react"
import { Button } from "@/components/ui/button"
import AnimatedSection from "@/components/animated-section"
import StaggeredChildren from "@/components/staggered-children"

export default function ClubSection() {
  return (
    <section
      className="py-20 relative overflow-hidden bg-cover bg-center"
      id="club"
      style={{ backgroundImage: "url('/our-club-background.png')" }}
    >
      {/* Optional: Subtle overlay if needed for text readability, can be adjusted */}
      <div className="absolute inset-0 bg-black/10 z-0"></div>

      <div className="container px-4 relative z-10">
        <AnimatedSection animation="fade-down" className="text-center">
          <h2 className="text-4xl md:text-5xl wild-youth-text-white mb-6 relative">
            <span className="relative z-10">OUR CLUB</span>
            {/* Optional: Brush stroke if it fits the new design */}
            {/* <div className="absolute inset-0 bg-brush-stroke bg-no-repeat bg-center bg-contain opacity-20"></div> */}
          </h2>
          <div className="flex justify-center mb-10">
            <div className="w-20 h-1 rounded-full bg-white"></div>
          </div>
        </AnimatedSection>

        <div className="flex flex-col md:flex-row items-center gap-12">
          {/* Content Area - The image of the girl is now part of the background */}
          {/* We can use this space for more text or a call to action related to the club */}
          <AnimatedSection animation="fade-right" className="md:w-1/2">
            <div className="bg-white/20 backdrop-blur-md p-8 rounded-lg shadow-xl border border-white/30">
              <h3 className="text-3xl font-bold mb-4 text-white">Join the Discipline Rift Family!</h3>
              <p className="text-lg text-white mb-6">
                Our club is more than just a team; it's a community dedicated to growth, excellence, and fun. We provide
                a supportive environment where young athletes can thrive.
              </p>
              <p className="text-lg text-white mb-8">
                Whether you're aiming for competitive play or looking to develop your skills in a friendly setting, we
                have a place for you.
              </p>
              <div className="flex items-center space-x-3 mb-6">
                <Star className="h-8 w-8 text-white" />
                <span className="text-xl text-white font-semibold">Become a Champion</span>
              </div>
              <Button className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-full px-8 shadow-lg transform transition-transform hover:scale-105">
                <Link href="#register" className="flex items-center">
                  Explore Club Options <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
          </AnimatedSection>

          <div className="md:w-1/2 text-white">
            <AnimatedSection animation="fade-left" delay={200}>
              <h3 className="text-3xl font-bold mb-4 text-white">Elite Training & Competition</h3>
            </AnimatedSection>

            <AnimatedSection animation="fade-left" delay={400}>
              <p className="text-lg mb-6">
                Our club offers year-round training and competitive opportunities for dedicated young players looking to
                take their game to the next level. With teams for various age groups and skill levels, we provide a
                pathway for continuous development.
              </p>
            </AnimatedSection>

            <AnimatedSection animation="fade-left" delay={600}>
              <p className="text-lg mb-8">
                Club members receive professional coaching, participate in regional and national tournaments, and gain
                exposure to college recruiters. Our comprehensive approach focuses on technical skills, tactical
                understanding, physical conditioning, and mental preparation.
              </p>
            </AnimatedSection>

            <StaggeredChildren
              className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8"
              staggerAmount={150}
              animation="fade-up"
            >
              {[
                {
                  icon: Trophy,
                  title: "Travel Teams",
                  description: "Compete at the highest level in regional and national tournaments",
                },
                {
                  icon: Users,
                  title: "Local Teams",
                  description: "Develop skills while maintaining a balanced schedule",
                },
                {
                  icon: Target,
                  title: "College Prep",
                  description: "Specialized training and recruitment support for college-bound athletes",
                },
                {
                  icon: ShieldCheck,
                  title: "Youth Development",
                  description: "Foundation building for younger players ages 10-14",
                },
              ].map((item, index) => (
                <div
                  key={index}
                  className="bg-white/10 p-4 rounded-lg backdrop-blur-sm border border-white/20 transform hover:scale-105 transition-transform flex items-start space-x-3"
                >
                  <item.icon className="h-8 w-8 mt-1 flex-shrink-0 text-white" />
                  <div>
                    <h4 className="font-bold mb-1 text-white">{item.title}</h4>
                    <p className="text-sm">{item.description}</p>
                  </div>
                </div>
              ))}
            </StaggeredChildren>

            <AnimatedSection animation="fade-up" delay={800}>
              <Button className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-full px-8 shadow-lg transform transition-transform hover:scale-105">
                <Link href="#register" className="flex items-center">
                  Join Our Club <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </AnimatedSection>
          </div>
        </div>
      </div>
    </section>
  )
}
