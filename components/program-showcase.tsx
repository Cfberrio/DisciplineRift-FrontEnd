"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import Image from "next/image"
import { ChevronLeft, ChevronRight } from "lucide-react"
import AnimatedSection from "@/components/animated-section"
import "../styles/hero-mobile.css"

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
      className="py-8 xs:py-12 sm:py-16 md:py-0 relative overflow-hidden bg-center programs-section-mobile xl:[background-position:center_30%] xl:[background-size:cover] 2xl:[background-position:center_25%] 2xl:[background-size:100%_auto]"
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

      {/* TÍTULO DEL BACKGROUND - SOLO MÓVIL */}
  

      {/* CONTAINER DEL CARRUSEL - AJUSTADO PARA MAC M1 14" */}
      <div className="container relative z-10 px-4 pt-[70vh] xs:pt-[75vh] sm:pt-[80vh] md:pt-40 xl:pt-[25vh] 2xl:pt-40 programs-container-mobile">
        
        {/* TÍTULO DESKTOP - MANTENER COMO ESTÁ */}
      

        <div
          className="relative max-w-6xl mx-auto px-2 xs:px-4 programs-carousel-mobile"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <div className="flex justify-between items-center relative">
            {/* Left arrow */}
            <button
              onClick={prevSlide}
              className="absolute left-0 xs:left-1 sm:left-2 z-20 bg-blue-500 hover:bg-blue-600 text-white rounded-full p-1.5 xs:p-2 sm:p-2.5 md:p-3 transform -translate-y-1/2 top-1/2 shadow-lg transition-all duration-200 programs-nav-mobile"
              aria-label="Previous program"
            >
              <ChevronLeft className="w-4 h-4 xs:w-5 xs:h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 lg:w-8 lg:h-8" />
            </button>

            {/* Cards container - reducido para mejor layout */}
            <div className="flex justify-center items-center w-full max-w-6xl xl:max-w-4xl 2xl:max-w-5xl mx-auto px-2 xs:px-4 sm:px-6 md:px-8">
              {/* Previous card (smaller) - más reducido */}
              <div className="hidden lg:block w-1/8 xl:w-1/6 transform scale-55 opacity-60 transition-all duration-500 mr-1 xl:mr-2 programs-card-side-mobile">
                <div className="relative rounded-lg overflow-hidden shadow-lg">
                  <div className="aspect-[3/4] sm:aspect-[3/4] relative">
                    <Image
                      src={programs[prevIndex].image || "/placeholder.svg"}
                      alt={programs[prevIndex].alt}
                      fill
                      className="object-cover object-center"
                      sizes="(max-width: 768px) 0px, (max-width: 1024px) 0px, (max-width: 1280px) 150px, 200px"
                    />
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2 xl:p-4">
                      <h3 className="text-lg xl:text-2xl wild-youth-text-white text-center">{programs[prevIndex].title}</h3>
                    </div>
                  </div>
                </div>
              </div>

              {/* Current card (larger) - reducido para mejor layout */}
              <div className="w-full max-w-xs xs:max-w-sm sm:max-w-sm md:max-w-md lg:w-2/5 xl:w-1/3 xl:max-w-xs 2xl:w-1/3 2xl:max-w-md transition-all duration-500 z-10 programs-card-main-mobile mx-auto">
                <div className="relative rounded-lg overflow-hidden transform rotate-1 shadow-2xl">
                  <div className="aspect-[3/4] sm:aspect-[3/4] relative">
                    <Image
                      src={programs[currentIndex].image || "/placeholder.svg"}
                      alt={programs[currentIndex].alt}
                      fill
                      className="object-cover object-center"
                      priority
                      sizes="(max-width: 640px) 70vw, (max-width: 768px) 60vw, (max-width: 1024px) 50vw, (max-width: 1280px) 300px, (max-width: 1600px) 250px, 300px"
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

              {/* Next card (smaller) - más reducido */}
              <div className="hidden lg:block w-1/8 xl:w-1/6 transform scale-55 opacity-60 transition-all duration-500 ml-1 xl:ml-2 programs-card-side-mobile">
                <div className="relative rounded-lg overflow-hidden shadow-lg">
                  <div className="aspect-[3/4] sm:aspect-[3/4] relative">
                    <Image
                      src={programs[nextIndex].image || "/placeholder.svg"}
                      alt={programs[nextIndex].alt}
                      fill
                      className="object-cover object-center"
                      sizes="(max-width: 768px) 0px, (max-width: 1024px) 0px, (max-width: 1280px) 150px, 200px"
                    />
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2 xl:p-4">
                      <h3 className="text-lg xl:text-2xl wild-youth-text-white text-center">{programs[nextIndex].title}</h3>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right arrow */}
            <button
              onClick={nextSlide}
              className="absolute right-0 xs:right-1 sm:right-2 z-20 bg-blue-500 hover:bg-blue-600 text-white rounded-full p-1.5 xs:p-2 sm:p-2.5 md:p-3 transform -translate-y-1/2 top-1/2 shadow-lg transition-all duration-200 programs-nav-mobile"
              aria-label="Next program"
            >
              <ChevronRight className="w-4 h-4 xs:w-5 xs:h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 lg:w-8 lg:h-8" />
            </button>
          </div>

          {/* Dots indicator - responsive sizing */}
          <div className="flex justify-center mt-2 xs:mt-3 sm:mt-4 space-x-1 xs:space-x-1.5 sm:space-x-2 programs-dots-mobile">
            {programs.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-1.5 h-1.5 xs:w-2 xs:h-2 sm:w-2.5 sm:h-2.5 rounded-full transition-all duration-300 programs-dot-mobile ${
                  index === currentIndex 
                    ? "bg-yellow-400 scale-125" 
                    : "bg-white/40 hover:bg-white/60"
                }`}
                aria-label={`Go to program ${index + 1}`}
              />
            ))}
          </div>

          {/* Description - responsive spacing and typography */}
          <div className="text-center mt-4 xs:mt-6 sm:mt-8 text-white/90 px-4 xs:px-6 sm:px-8 md:px-12 programs-description-mobile">
            <h4 className="text-base xs:text-lg sm:text-xl md:text-2xl ethnocentric-title-white mb-2 xs:mb-3 sm:mb-4 programs-subtitle-mobile">
              {programs[currentIndex].sport.toUpperCase()}
            </h4>
            <p className="max-w-xs xs:max-w-sm sm:max-w-md md:max-w-lg lg:max-w-2xl xl:max-w-3xl mx-auto whitespace-pre-line text-xs xs:text-sm sm:text-base md:text-lg leading-relaxed programs-text-mobile">
              {programs[currentIndex].description}
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
