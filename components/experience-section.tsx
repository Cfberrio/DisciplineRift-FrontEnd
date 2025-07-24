"use client"
import { CheckCircle } from "lucide-react"
import AnimatedSection from "@/components/animated-section"
import StaggeredChildren from "@/components/staggered-children"

export default function ExperienceSection() {
  const experiences = [
    {
      title: "Professional Coaching",
      description: "Learn from former collegiate and professional athletes with years of coaching experience",
      icon: CheckCircle,
    },
    {
      title: "State-of-the-Art Facilities",
      description: "Train in modern facilities designed for optimal skill development and performance",
      icon: CheckCircle,
    },
    {
      title: "Personalized Training",
      description: "Receive individualized attention and custom training plans to meet your specific goals",
      icon: CheckCircle,
    },
    {
      title: "Video Analysis",
      description: "Improve faster with detailed video breakdown of your technique and gameplay",
      icon: CheckCircle,
    },
    {
      title: "Mental Performance",
      description: "Develop the mental toughness and focus needed to excel under pressure",
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
          <h2 className="text-4xl md:text-5xl wild-youth-text-blue mb-6 relative">
            <span className="relative z-10">THE DR EXPERIENCE</span>
            {/* Optional: keep brush stroke if it fits the new design */}
            {/* <div className="absolute inset-0 bg-brush-stroke bg-no-repeat bg-center bg-contain opacity-20"></div> */}
          </h2>
          <p className="text-xl text-gray-700 max-w-3xl mx-auto mb-16">
            What makes training with Discipline Rift different from anywhere else
          </p>
        </AnimatedSection>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
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
              <h3 className="text-2xl font-bold text-dr-blue mb-4 text-center">Our Approach</h3>
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
