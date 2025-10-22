"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { ArrowRight, ChevronDown, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import AnimatedSection from "@/components/animated-section"

export default function DynamicHero() {
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    setIsLoaded(true)
  }, [])

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0 z-0">
        {/* Main background image */}
        <Image
          src="/high-school-volleyball-game.png"
          alt="Sports players in action"
          fill
          priority
          className="object-cover brightness-[0.6]"
        />

        {/* Overlay with gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/70 to-purple-600/40"></div>

        {/* Dynamic shapes and patterns */}
        <div className="absolute inset-0">
          {/* Animated circles */}
          <div
            className={`absolute top-1/4 left-1/4 w-64 h-64 rounded-full bg-yellow-400/30 filter blur-xl transform transition-all duration-1000 ${isLoaded ? "scale-100 opacity-60" : "scale-0 opacity-0"}`}
            style={{ animationDelay: "0.2s" }}
          ></div>
          <div
            className={`absolute bottom-1/3 right-1/4 w-80 h-80 rounded-full bg-orange-400/20 filter blur-xl transform transition-all duration-1000 ${isLoaded ? "scale-100 opacity-50" : "scale-0 opacity-0"}`}
            style={{ animationDelay: "0.4s" }}
          ></div>
          <div
            className={`absolute top-2/3 left-1/3 w-48 h-48 rounded-full bg-blue-300/30 filter blur-xl transform transition-all duration-1000 ${isLoaded ? "scale-100 opacity-60" : "scale-0 opacity-0"}`}
            style={{ animationDelay: "0.6s" }}
          ></div>

          {/* Animated stars */}
          <div
            className={`absolute top-1/5 right-1/5 transform transition-all duration-1000 ${isLoaded ? "scale-100 opacity-70 rotate-12" : "scale-0 opacity-0"}`}
          >
            <Star className="text-yellow-300 h-12 w-12" />
          </div>
          <div
            className={`absolute bottom-1/4 left-1/6 transform transition-all duration-1000 ${isLoaded ? "scale-100 opacity-70 -rotate-12" : "scale-0 opacity-0"}`}
          >
            <Star className="text-yellow-300 h-8 w-8" />
          </div>

          {/* Diagonal stripes */}
          <div className="absolute inset-0 bg-stripes opacity-10"></div>
        </div>
      </div>

      {/* Content container */}
      <div className="container relative z-10 px-4 py-20">
        <div className="flex flex-col md:flex-row items-center gap-8">
          {/* Season announcement */}
          <AnimatedSection animation="fade-right" delay={200} className="md:w-1/4 mb-8 md:mb-0">
            <div className="bg-gradient-to-br from-yellow-400 to-orange-500 text-white p-6 rounded-lg text-center transform rotate-3 shadow-xl border-4 border-white/30">
              <h3 className="text-xl font-bold mb-2 transform -rotate-3">WINTER SEASON</h3>
              <p className="mb-2 transform -rotate-3">SEASON STARTING</p>
              <p className="text-xl font-bold transform -rotate-3">NOVEMBER</p>
              <p className="text-xl font-bold transform -rotate-3">3th</p>

              {/* Decorative elements */}
              <div className="absolute -top-4 -right-4 w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center transform rotate-12">
                <span className="text-white font-bold text-sm">NEW!</span>
              </div>
            </div>
          </AnimatedSection>

          {/* Main hero content */}
          <AnimatedSection animation="fade-up" delay={400} className="md:w-3/4 text-center">
            <div className="relative">
              {/* Background shape */}

              {/* Content */}
              <div className="relative text-white p-2 xs:p-4 sm:p-6 md:p-8 lg:p-12 rounded-lg z-10 transform rotate-1 xs:rotate-2">
                {/* Title with brush effect */}
                <div className="flex flex-col items-center justify-center relative">
                  {/* Brush stroke background for title */}
                  <div className="absolute inset-0 bg-brush-stroke bg-no-repeat bg-center bg-contain opacity-20"></div>

                  {/* Main title */}
                  <h1 className="text-2xl xs:text-3xl sm:text-4xl md:text-6xl lg:text-8xl xl:text-9xl wild-youth-text-white mb-0 tracking-tight relative z-10 leading-none">
                    DISCIPLINE
                  </h1>
                  <h1 className="text-xl xs:text-2xl sm:text-3xl md:text-5xl lg:text-7xl xl:text-8xl wild-youth-text-white -mt-1 xs:-mt-2 sm:-mt-3 md:-mt-4 lg:-mt-6 xl:-mt-8 tracking-tight relative z-10 leading-none">
                    RIFT
                  </h1>

                  {/* Decorative elements */}
                  <div className="absolute -top-8 -left-8 w-16 h-16 bg-yellow-400 rounded-full filter blur-md opacity-70"></div>
                  <div className="absolute -bottom-8 -right-8 w-16 h-16 bg-orange-400 rounded-full filter blur-md opacity-70"></div>
                </div>

                {/* Subtitle */}
                <p className="text-sm xs:text-base sm:text-lg md:text-xl lg:text-2xl mb-4 xs:mb-6 sm:mb-8 mt-2 xs:mt-4 sm:mt-6 relative z-10 px-2 xs:px-4 sm:px-0 text-center max-w-xs xs:max-w-sm sm:max-w-md md:max-w-lg mx-auto">
                  Developing Young Athletes in Volleyball, Tennis, & Pickleball
                </p>

                {/* CTA Button */}
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-black rounded-full px-4 xs:px-6 sm:px-8 py-3 xs:py-4 sm:py-6 text-sm xs:text-base sm:text-lg font-bold shadow-lg transform transition-transform hover:scale-105 w-auto min-w-[160px] xs:min-w-[180px] sm:min-w-[200px]"
                >
                  <Link href="/?scrollTo=register" className="flex items-center">
                    REGISTER NOW <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>

                {/* Decorative elements */}
                <div className="absolute top-1/4 right-8 w-8 h-8 bg-white rounded-full opacity-20"></div>
                <div className="absolute bottom-1/4 left-8 w-12 h-12 bg-white rounded-full opacity-20"></div>
              </div>

              {/* Additional decorative elements */}
              <div className="absolute -top-4 -left-4 w-12 h-12 bg-yellow-400 rounded-full flex items-center justify-center transform -rotate-12 z-20 shadow-md">
                <span className="text-black font-bold text-xs">KIDS</span>
              </div>
              <div className="absolute -bottom-4 -right-4 w-16 h-16 bg-orange-500 rounded-full flex items-center justify-center transform rotate-12 z-20 shadow-md">
                <span className="text-white font-bold text-sm">JOIN US!</span>
              </div>
            </div>
          </AnimatedSection>
        </div>
      </div>

      {/* Scroll indicator */}
      <AnimatedSection
        animation="fade-up"
        delay={1500}
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-10 animate-bounce"
      >
        <div className="bg-white/30 p-2 rounded-full backdrop-blur-sm">
          <ChevronDown className="h-10 w-10 text-white" />
        </div>
      </AnimatedSection>
    </section>
  )
}
