"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import Image from "next/image"
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
  // State for mobile detection
  const [isMobile, setIsMobile] = useState(false)

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

  // Mobile detection effect
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Calculate previous and next indices
  const prevIndex = currentIndex === 0 ? maxIndex : currentIndex - 1
  const nextIndex = currentIndex === maxIndex ? 0 : currentIndex + 1

  // Get color for each sport
  const getSportColor = (sport: string) => {
    switch (sport) {
      case 'volleyball':
        return '#66d43d'
      case 'pickleball':
        return '#f25f22'
      case 'tennis':
        return '#e6dd19'
      default:
        return '#66d43d'
    }
  }

  return (
    <section
      className="py-8 xs:py-12 sm:py-16 md:py-0 relative overflow-hidden programs-section-mobile"
      id="programs"
      style={{ 
        backgroundImage: isMobile ? "url('/06.png')" : "url('/programs-background.png')", 
        backgroundPosition: "center center",
        backgroundSize: "100% 100%",
        backgroundRepeat: "no-repeat",
        backgroundAttachment: "local",
        minHeight: "100vh",
        width: "100%",
        height: "100%"
      }}
    >
      {/* Decorative elements - can be adjusted or removed if background is sufficient */}
      <div className="absolute top-10 left-10 w-32 h-32 bg-yellow-400/30 rounded-full filter blur-3xl opacity-20"></div>
      <div className="absolute bottom-10 right-10 w-40 h-40 bg-orange-400/30 rounded-full filter blur-3xl opacity-20"></div>

      {/* TÍTULO PROGRAMS - MUY ARRIBA EN LA SECCIÓN */}
      <div className="absolute top-2 xs:top-3 sm:top-4 md:top-5 lg:top-6 xl:top-8 left-1/2 transform -translate-x-1/2 z-20">
        <AnimatedSection animation="fade-up" delay={200}>
          <div className="text-center">
            <img
              src="/PROGRAMS.png"
              alt="Programs"
              className="w-auto h-20 xs:h-24 sm:h-28 md:h-24 lg:h-28 xl:h-32 object-contain mx-auto scale-150 xs:scale-[1.75] sm:scale-[2] md:scale-100"
            />
          </div>
        </AnimatedSection>
      </div>

      {/* CONTAINER DEL CARRUSEL - MITAD DE LA SECCIÓN PARA MÓVILES */}
      <div className="container absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 md:relative md:top-auto md:left-auto md:transform-none z-10 px-4 pt-0 md:pt-60 lg:pt-72 xl:pt-80 2xl:pt-96 programs-container-mobile">
        
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
              className="absolute left-2 xs:left-3 sm:left-4 md:left-0 z-20 transform -translate-y-1/2 top-1/2 transition-all duration-200 programs-nav-mobile hover:scale-110"
              aria-label="Previous program"
            >
              <Image
                src="/FLECHAIZQUIERDA.png"
                alt="Previous"
                width={40}
                height={40}
                className="w-6 h-6 xs:w-8 xs:h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 lg:w-16 lg:h-16"
              />
            </button>

            {/* Cards container - Móvil: 3 cards / Desktop: mantener original */}
            {/* Layout para móvil - mostrar 3 cards */}
            <div className="block md:hidden flex justify-center items-center w-full max-w-3xl mx-auto px-2 xs:px-4 sm:px-6">
              {/* Previous card móvil */}
              <div className="w-1/4 transform scale-65 opacity-75 transition-all duration-500 -mr-8 z-5 aspect-[4/5] relative overflow-hidden">
                <Image
                  src={programs[prevIndex].image || "/placeholder.svg"}
                  alt={programs[prevIndex].alt}
                  fill
                  className="object-cover object-center"
                  sizes="(max-width: 768px) 25vw"
                />
              </div>
              
              {/* Current card móvil */}
              <div className="w-full max-w-48 transition-all duration-500 z-20 mx-auto aspect-[4/5] relative overflow-hidden">
                <Image
                  src={programs[currentIndex].image || "/placeholder.svg"}
                  alt={programs[currentIndex].alt}
                  fill
                  className="object-cover object-center"
                  priority
                  sizes="(max-width: 768px) 50vw"
                />
              </div>
              
              {/* Next card móvil */}
              <div className="w-1/4 transform scale-65 opacity-75 transition-all duration-500 -ml-8 z-5 aspect-[4/5] relative overflow-hidden">
                <Image
                  src={programs[nextIndex].image || "/placeholder.svg"}
                  alt={programs[nextIndex].alt}
                  fill
                  className="object-cover object-center"
                  sizes="(max-width: 768px) 25vw"
                />
              </div>
            </div>

            {/* Layout para desktop - mantener original */}
            <div className="hidden md:flex justify-center items-center w-full max-w-3xl mx-auto px-8">
              {/* Previous card desktop */}
              <div className="w-1/4 lg:w-1/3 transform scale-65 opacity-85 transition-all duration-500 -mr-12 lg:-mr-14 xl:-mr-16 z-5 aspect-[4/5] relative overflow-hidden">
                <Image
                  src={programs[prevIndex].image || "/placeholder.svg"}
                  alt={programs[prevIndex].alt}
                  fill
                  className="object-cover object-center"
                  sizes="(max-width: 1024px) 150px, 180px"
                />
              </div>

              {/* Current card desktop */}
              <div className="w-full max-w-80 lg:max-w-96 transition-all duration-500 z-20 mx-auto aspect-[4/5] relative overflow-hidden">
                <Image
                  src={programs[currentIndex].image || "/placeholder.svg"}
                  alt={programs[currentIndex].alt}
                  fill
                  className="object-cover object-center"
                  priority
                  sizes="(max-width: 1024px) 40vw, (max-width: 1280px) 280px, 350px"
                />
              </div>

              {/* Next card desktop */}
              <div className="w-1/4 lg:w-1/3 transform scale-65 opacity-85 transition-all duration-500 -ml-12 lg:-ml-14 xl:-ml-16 z-5 aspect-[4/5] relative overflow-hidden">
                <Image
                  src={programs[nextIndex].image || "/placeholder.svg"}
                  alt={programs[nextIndex].alt}
                  fill
                  className="object-cover object-center"
                  sizes="(max-width: 1024px) 150px, 180px"
                />
              </div>
            </div>

            {/* Right arrow */}
            <button
              onClick={nextSlide}
              className="absolute right-2 xs:right-3 sm:right-4 md:right-0 z-20 transform -translate-y-1/2 top-1/2 transition-all duration-200 programs-nav-mobile hover:scale-110"
              aria-label="Next program"
            >
              <Image
                src="/FLECHADERECHA.png"
                alt="Next"
                width={40}
                height={40}
                className="w-6 h-6 xs:w-8 xs:h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 lg:w-16 lg:h-16"
              />
            </button>
          </div>

          {/* Dots indicator - responsive sizing */}
          <div className="flex justify-center mt-4 xs:mt-5 sm:mt-6 space-x-1.5 xs:space-x-2 sm:space-x-2.5 programs-dots-mobile">
            {programs.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-1.5 h-1.5 xs:w-2 xs:h-2 sm:w-2 sm:h-2 md:w-2.5 md:h-2.5 rounded-full transition-all duration-300 programs-dot-mobile ${
                  index === currentIndex 
                    ? "scale-125" 
                    : "bg-white/40 hover:bg-white/60"
                }`}
                style={index === currentIndex ? {
                  backgroundColor: getSportColor(programs[index].sport),
                  boxShadow: `0 0 10px ${getSportColor(programs[index].sport)}80`
                } : {}}
                aria-label={`Go to program ${index + 1}`}
              />
            ))}
          </div>

                     {/* Description - solo para desktop */}
           <div className="hidden md:block text-center mt-4 xs:mt-6 sm:mt-8 text-white/90 px-4 xs:px-6 sm:px-8 md:px-12 programs-description-mobile">
             <h4 className="text-base xs:text-lg sm:text-xl md:text-2xl ethnocentric-title-white mb-2 xs:mb-3 sm:mb-4 programs-subtitle-mobile">
               {programs[currentIndex].sport.toUpperCase()}
             </h4>
             <p className="max-w-xs xs:max-w-sm sm:max-w-md md:max-w-lg lg:max-w-2xl xl:max-w-3xl mx-auto whitespace-pre-line text-xs xs:text-sm sm:text-base md:text-lg leading-relaxed programs-text-mobile">
               {programs[currentIndex].description}
             </p>
           </div>
        </div>
      </div>

      {/* Description para móviles - posicionada en la parte inferior */}
      <div className="block md:hidden absolute bottom-6 xs:bottom-8 sm:bottom-10 left-1/2 transform -translate-x-1/2 w-full z-30">
        <div className="text-center text-white/90 px-4 xs:px-6 sm:px-8">
          <h4 className="text-sm xs:text-base sm:text-lg ethnocentric-title-white mb-1 xs:mb-2 sm:mb-3">
            {programs[currentIndex].sport.toUpperCase()}
          </h4>
          <p className="max-w-xs xs:max-w-sm sm:max-w-md mx-auto text-xs xs:text-sm sm:text-sm leading-relaxed">
            {programs[currentIndex].description}
          </p>
        </div>
      </div>
    </section>
  )
}
