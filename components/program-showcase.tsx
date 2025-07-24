"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import Image from "next/image"
import { ChevronLeft, ChevronRight } from "lucide-react"
import AnimatedSection from "@/components/animated-section"

interface ProgramCard {
  title: string
  image: string
  alt: string
  description: string
  sport: string
}

export default function ProgramShowcase() {
  // Update the programs array with the detailed information from the diagram
  const programs: ProgramCard[] = [
    {
      title: "VOLLEYBALL",
      image: "/high-school-volleyball-training.png",
      alt: "Volleyball training session",
      description:
        "Introduction and skill development in serving, passing, setting, hitting, blocking, and defensive strategies. Focusing on discipline, teamwork, and sports etiquette. Cultivating passion and growth in volleyball through structured practice and competitive experiences.",
      sport: "volleyball",
    },
    {
      title: "TENNIS",
      image: "/high-school-volleyball-camp.png", // Would be replaced with tennis image
      alt: "Tennis training session",
      description:
        "Fundamental skills including serving, forehand, backhand, volleying, and court movement. Encouraging discipline, teamwork, and sports etiquette. Development through structured drills, interactive games, and competitions fostering team spirit.",
      sport: "tennis",
    },
    {
      title: "PICKLEBALL",
      image: "/volleyball-coach-training.png", // Would be replaced with pickleball image
      alt: "Pickleball training session",
      description:
        "Developing foundational pickleball skills: serving, dinking, volleying, strategic shot placement, and footwork. Emphasizing values like discipline, teamwork, and sports etiquette. Offering engaging sessions that encourage competitive spirit and passion for the sport.",
      sport: "pickleball",
    },
  ]

  const [currentIndex, setCurrentIndex] = useState(0)
  const maxIndex = programs.length - 1
  const touchStartX = useRef(0)
  const touchEndX = useRef(0)

  const nextSlide = () => {
    setCurrentIndex(currentIndex === maxIndex ? 0 : currentIndex + 1)
  }

  const prevSlide = () => {
    setCurrentIndex(currentIndex === 0 ? maxIndex : currentIndex - 1)
  }

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX
  }

  const handleTouchEnd = () => {
    if (touchStartX.current - touchEndX.current > 50) {
      nextSlide()
    } else if (touchEndX.current - touchStartX.current > 50) {
      prevSlide()
    }
  }

  useEffect(() => {
    const interval = setInterval(() => {
      nextSlide()
    }, 5000)
    return () => clearInterval(interval)
  }, [currentIndex])

  // Calculate previous and next indices
  const prevIndex = currentIndex === 0 ? maxIndex : currentIndex - 1
  const nextIndex = currentIndex === maxIndex ? 0 : currentIndex + 1

  return (
    <section
      className="py-20 relative overflow-hidden bg-cover bg-center"
      id="programs"
      style={{ backgroundImage: "url('/programs-background.png')" }}
    >
      {/* Decorative elements - can be adjusted or removed if background is sufficient */}
      <div className="absolute top-10 left-10 w-32 h-32 bg-yellow-400/30 rounded-full filter blur-3xl opacity-20"></div>
      <div className="absolute bottom-10 right-10 w-40 h-40 bg-orange-400/30 rounded-full filter blur-3xl opacity-20"></div>

      <div className="container relative z-10 px-4">
        {/* Update the title section to match the reference */}
        <AnimatedSection animation="fade-down" className="text-center mb-12">
          <h2 className="text-5xl md:text-7xl wild-youth-text-white mb-4 relative">
            <span className="relative z-10">PROGRAMS</span>
            <div className="absolute inset-0 bg-brush-stroke bg-no-repeat bg-center bg-contain opacity-20"></div>
          </h2>
          <p className="text-xl text-white/90 max-w-3xl mx-auto">
            Elite sports programs designed to develop champions on and off the court
          </p>
          <p className="text-md text-white/70 mt-2">(Reference Camp Experience from Passion website)</p>
        </AnimatedSection>

        <div
          className="relative max-w-6xl mx-auto"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <div className="flex justify-between items-center">
            {/* Left arrow */}
            <button
              onClick={prevSlide}
              className="absolute left-0 z-20 bg-blue-500 hover:bg-blue-600 text-white rounded-full p-2 transform -translate-y-1/2 top-1/2 shadow-lg"
              aria-label="Previous program"
            >
              <ChevronLeft size={30} />
            </button>

            {/* Cards container */}
            <div className="flex justify-center items-center w-full">
              {/* Previous card (smaller) */}
              <div className="hidden md:block w-1/4 transform scale-75 opacity-70 transition-all duration-500 mr-4">
                <div className="relative rounded-lg overflow-hidden border-4 border-white/50 shadow-xl">
                  <div className="aspect-[3/4] relative">
                    <Image
                      src={programs[prevIndex].image || "/placeholder.svg"}
                      alt={programs[prevIndex].alt}
                      fill
                      className="object-cover"
                    />
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                      <h3 className="text-3xl wild-youth-text-white text-center">{programs[prevIndex].title}</h3>
                    </div>
                  </div>
                </div>
              </div>

              {/* Current card (larger) */}
              <div className="w-full md:w-2/4 transition-all duration-500 z-10">
                <div className="relative rounded-lg overflow-hidden border-4 border-white shadow-xl transform rotate-1">
                  <div className="aspect-[3/4] relative">
                    <Image
                      src={programs[currentIndex].image || "/placeholder.svg"}
                      alt={programs[currentIndex].alt}
                      fill
                      className="object-cover"
                      priority
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30"></div>
                    <div className="absolute bottom-0 left-0 right-0 p-6">
                      <h3 className="text-4xl md:text-5xl wild-youth-text-white text-center mb-2">
                        {programs[currentIndex].title}
                      </h3>
                    </div>

                    {/* Decorative elements */}
                    <div className="absolute top-4 right-4 text-black font-bold py-2 px-4 rounded-lg transform -rotate-6 shadow-md bg-white">
                      <span className="text-sm">KIDS & TEENS</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Next card (smaller) */}
              <div className="hidden md:block w-1/4 transform scale-75 opacity-70 transition-all duration-500 ml-4">
                <div className="relative rounded-lg overflow-hidden border-4 border-white/50 shadow-xl">
                  <div className="aspect-[3/4] relative">
                    <Image
                      src={programs[nextIndex].image || "/placeholder.svg"}
                      alt={programs[nextIndex].alt}
                      fill
                      className="object-cover"
                    />
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                      <h3 className="text-3xl wild-youth-text-white text-center">{programs[nextIndex].title}</h3>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right arrow */}
            <button
              onClick={nextSlide}
              className="absolute right-0 z-20 bg-blue-500 hover:bg-blue-600 text-white rounded-full p-2 transform -translate-y-1/2 top-1/2 shadow-lg"
              aria-label="Next program"
            >
              <ChevronRight size={30} />
            </button>
          </div>

          {/* Dots indicator */}
          <div className="flex justify-center mt-6 space-x-2">
            {programs.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-3 h-3 rounded-full ${index === currentIndex ? "bg-yellow-400" : "bg-white/50"}`}
                aria-label={`Go to program ${index + 1}`}
              />
            ))}
          </div>

          {/* Description */}
          <div className="text-center mt-8 text-white/90">
            <h4 className="text-2xl font-bold text-white mb-4">EXCELLENCE IN EVERY ASPECT</h4>
            <p className="max-w-3xl mx-auto whitespace-pre-line">{programs[currentIndex].description}</p>
          </div>
        </div>
      </div>
    </section>
  )
}
