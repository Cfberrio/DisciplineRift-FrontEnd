"use client"
import { CheckCircle } from "lucide-react"
import AnimatedSection from "@/components/animated-section"
import StaggeredChildren from "@/components/staggered-children"

export default function ExperienceSection() {
  const experiences = [
    {
      title: "School-Based",
      description: "Everything needed to play: equipment, coaches, and structure; delivered right to campus.",
      icon: CheckCircle,
    },
    {
      title: "Developmental First",
      description: "Skills and confidence grow step by step, with focus on progress, not pressure.",
      icon: CheckCircle,
    },
    {
      title: "Values Through Sports",
      description: "Using sports as a way to learn teamwork, discipline, values, and life lessons that last.",
      icon: CheckCircle,
    },
    {
      title: "DR Team: Coaches",
      description: "Coaches bring energy, intention, and passion, turning practices into lasting experiences.",
      icon: CheckCircle,
    },
    {
      title: "Supportive Environment",
      description: "A safe, welcoming space where players can grow, take risks, and feel seen.",
      icon: CheckCircle,
    },
    {
      title: "Competition Opportunities",
      description: "Test your skills in organized competitions and tournaments throughout the year",
      icon: CheckCircle,
    },
  ]

  return (
    <section
      className="py-20 bg-cover bg-center relative overflow-hidden"
      id="experience"
      style={{ backgroundImage: "url('/dr-experience-background.png')" }}
    >
      {/* Decorative elements - can be removed or adjusted if the new background is sufficient */}
      {/* <div className="absolute inset-0 bg-pattern opacity-10 z-0"></div> */}
      {/* <div className="absolute top-1/4 right-1/4 w-64 h-64 bg-blue-400 rounded-full filter blur-3xl opacity-10"></div> */}
      {/* <div className="absolute bottom-1/4 left-1/4 w-48 h-48 bg-yellow-400 rounded-full filter blur-3xl opacity-10"></div> */}

      <div className="container px-4 relative z-10">
        <AnimatedSection animation="fade-down" className="text-center">
          <h2 className="text-xl xs:text-2xl sm:text-3xl md:text-4xl lg:text-5xl ethnocentric-text-blue mb-3 xs:mb-4 sm:mb-6 relative px-4 xs:px-0">
            <span className="relative z-10">DR IS FOR STUDENTS</span>
            {/* Optional: keep brush stroke if it fits the new design */}
            {/* <div className="absolute inset-0 bg-brush-stroke bg-no-repeat bg-center bg-contain opacity-20"></div> */}
          </h2>
          <p className="text-sm xs:text-base sm:text-lg md:text-xl text-gray-700 max-w-3xl mx-auto mb-6 xs:mb-8 sm:mb-12 md:mb-16 px-4 sm:px-0">
            What makes training with Discipline Rift different from anywhere else
          </p>
        </AnimatedSection>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 xs:gap-6 sm:gap-8 md:gap-12 items-center">
          <AnimatedSection animation="fade-right" className="order-2 md:order-1">
            <StaggeredChildren className="grid grid-cols-1 gap-6" staggerAmount={150}>
              {experiences.map((item, index) => (
                <div
                  key={index}
                  className="flex items-start bg-gradient-to-r from-blue-50/80 to-blue-100/80 backdrop-blur-sm p-5 rounded-lg shadow-md border-l-4 border-blue-400 transform hover:scale-105 transition-transform"
                >
                  <div className="bg-blue-500 rounded-full p-2 mr-4 flex-shrink-0">
                    <item.icon className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-lg mb-1">{item.title}</h3>
                    <p className="text-gray-700">{item.description}</p>
                  </div>
                </div>
              ))}
            </StaggeredChildren>
          </AnimatedSection>

          {/* The image part can be removed or adjusted as the background now contains an image */}
          <AnimatedSection animation="fade-left" className="order-1 md:order-2 flex justify-center items-center">
            {/* This div can be used for additional content or removed if the background image is sufficient */}
            <div className="w-full max-w-md p-8 bg-white/30 backdrop-blur-md rounded-lg shadow-xl">
              <h3 className="text-2xl ethnocentric-title-blue mb-4 text-center">Our Approach</h3>
              <p className="text-gray-800 text-center">
                We focus on holistic development, combining cutting-edge training techniques with mentorship to build
                not just skilled players, but also strong individuals.
              </p>
            </div>
          </AnimatedSection>
        </div>
      </div>
    </section>
  )
}
