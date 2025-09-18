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
        <AnimatedSection animation="fade-down" className="text-center mb-12 md:mb-16">
          <img 
            src="/DRISFORSTUDENTS.png" 
            alt="DR IS FOR STUDENTS" 
            className="mx-auto max-w-full h-auto"
            style={{ maxHeight: '200px' }}
          />
        </AnimatedSection>

        
        

        <div className="flex justify-center">
          <AnimatedSection animation="fade-up" className="max-w-4xl">
            <StaggeredChildren className="grid grid-cols-1 md:grid-cols-2 gap-6" staggerAmount={150}>
              {experiences.map((item, index) => {
                const isLastItem = index === experiences.length - 1;
                return (
                  <div
                    key={index}
                    className={`flex items-start backdrop-blur-sm p-5 rounded-3xl shadow-md border-l-4 border-blue-400 transform hover:scale-105 transition-transform ${
                      isLastItem ? 'md:col-span-2 md:flex md:justify-center' : ''
                    }`}
                    style={{ 
                      backgroundColor: '#E6F1FF',
                      ...(isLastItem && { maxWidth: '400px', margin: '0 auto' })
                    }}
                  >
                    <div className="bg-blue-500 rounded-full p-2 mr-4 flex-shrink-0">
                      <item.icon className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg mb-1" style={{ color: '#0085B7' }}>{item.title}</h3>
                      <p style={{ color: '#006186' }}>{item.description}</p>
                    </div>
                  </div>
                );
              })}
            </StaggeredChildren>
          </AnimatedSection>
        </div>
      </div>
    </section>
  )
}
