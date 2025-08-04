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
      title: "",
      image: "/high-school-volleyball-training.png",
      alt: "Volleyball training session",
      description:
        "Players learn core skills including serving, passing, setting, and hitting. We focus on movement, communication, and teamwork through structured drills and game play.",
      sport: "volleyball",
    },
    {
      title: "",
      image: "/high-school-volleyball-camp.png", // Would be replaced with tennis image
      alt: "Tennis training session",
      description:
        "Players develop footwork and strokes, including forehand, backhand, serves, and volleys. We focus on motor coordination and technique through structured drills and game-based learning.",
      sport: "tennis",
    },
    {
      title: "",
      image: "/volleyball-coach-training.png", // Would be replaced with pickleball image
      alt: "Pickleball training session",
      description:
        "Players develop footwork and shot techniques, including dinks, drives, serves, and volleys. Focusing on motor coordination and placement through structured drills and games.",
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
      className="py-8 xs:py-12 sm:py-16 md:py-0 relative overflow-hidden bg-center"
      id="programs"
      style={{ 
        backgroundImage: "url('/programs-background.png')", 
        backgroundPosition: "center 25%",
        backgroundSize: "100% auto",
        backgroundRepeat: "no-repeat",
        minHeight: "100vh"
      }}
    >
      {/* Decorative elements - can be adjusted or removed if background is sufficient */}
      <div className="absolute top-10 left-10 w-32 h-32 bg-yellow-400/30 rounded-full filter blur-3xl opacity-20"></div>
      <div className="absolute bottom-10 right-10 w-40 h-40 bg-orange-400/30 rounded-full filter blur-3xl opacity-20"></div>

      <div className="container relative z-10 px-4 pt-20 xs:pt-24 sm:pt-28 md:pt-40">
        {/* Update the title section to match the reference */}
        <AnimatedSection animation="fade-down" className="text-center mb-8 xs:mb-10 sm:mb-12">
          <h2 className="text-xl xs:text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-7xl wild-youth-text-white mb-3 sm:mb-4 relative px-4 xs:px-0">
            <span className="relative z-10"></span>
            <div className="absolute inset-0 bg-brush-stroke bg-no-repeat bg-center bg-contain opacity-20"></div>
          </h2>
        </AnimatedSection>

        <div
          className="relative max-w-6xl mx-auto px-2 xs:px-4"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <div className="flex justify-between items-center">
            {/* Left arrow */}
            <button
              onClick={prevSlide}
              className="absolute left-0 z-20 bg-blue-500 hover:bg-blue-600 text-white rounded-full p-1 xs:p-2 transform -translate-y-1/2 top-1/2 shadow-lg"
              aria-label="Previous program"
            >
              <ChevronLeft size={24} className="xs:w-6 xs:h-6 md:w-8 md:h-8" />
            </button>

            {/* Cards container */}
            <div className="flex justify-center items-center w-full max-w-3xl mx-auto px-4 xs:px-6 sm:px-8">
              {/* Previous card (smaller) */}
              <div className="hidden md:block w-1/5 transform scale-75 opacity-70 transition-all duration-500 mr-4">
                <div className="relative rounded-lg overflow-hidden">
                  <div className="aspect-[4/5] relative">
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
              <div className="w-full md:w-2/5 transition-all duration-500 z-10">
                <div className="relative rounded-lg overflow-hidden transform rotate-1">
                  <div className="aspect-[4/5] relative">
                    <Image
                      src={programs[currentIndex].image || "/placeholder.svg"}
                      alt={programs[currentIndex].alt}
                      fill
                      className="object-cover"
                      priority
                    />
                    <div className="absolute bottom-0 left-0 right-0 p-3 xs:p-4 sm:p-6">
                      <h3 className="text-lg xs:text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl wild-youth-text-white text-center mb-1 xs:mb-2">
                        {programs[currentIndex].title}
                      </h3>
                    </div>

                    {/* Decorative elements */}
                  </div>
                </div>
              </div>

              {/* Next card (smaller) */}
              <div className="hidden md:block w-1/5 transform scale-75 opacity-70 transition-all duration-500 ml-4">
                <div className="relative rounded-lg overflow-hidden">
                  <div className="aspect-[4/5] relative">
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
              className="absolute right-0 z-20 bg-blue-500 hover:bg-blue-600 text-white rounded-full p-1 xs:p-2 transform -translate-y-1/2 top-1/2 shadow-lg"
              aria-label="Next program"
            >
              <ChevronRight size={24} className="xs:w-6 xs:h-6 md:w-8 md:h-8" />
            </button>
          </div>

          {/* Dots indicator */}
          <div className="flex justify-center mt-4 xs:mt-6 space-x-2">
            {programs.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-2 xs:w-3 h-2 xs:h-3 rounded-full ${index === currentIndex ? "bg-yellow-400" : "bg-white/50"}`}
                aria-label={`Go to program ${index + 1}`}
              />
            ))}
          </div>

          {/* Description */}
          <div className="text-center mt-6 xs:mt-8 text-white/90 px-4 xs:px-6 sm:px-8">
            <h4 className="text-lg xs:text-xl sm:text-2xl ethnocentric-title-white mb-2 xs:mb-3 sm:mb-4">EXCELLENCE IN EVERY ASPECT</h4>
            <p className="max-w-3xl mx-auto whitespace-pre-line text-sm xs:text-base sm:text-lg">{programs[currentIndex].description}</p>
          </div>
        </div>
      </div>
    </section>
  )
}
