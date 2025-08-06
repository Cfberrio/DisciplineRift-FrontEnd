"use client"

import { useState, useEffect } from "react"
import "../styles/hero-mobile.css"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"

export default function PassionInspiredHero() {
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    setIsLoaded(true)
  }, [])

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden hero-section-mobile">
      {/* Background image with overlay */}
      <div className="absolute inset-0 z-0 hero-background-container">
        <Image
          src="/hero-halftone-background.png"
          alt="Dynamic halftone pattern background"
          fill
          priority
          className="object-cover object-center w-full h-full hero-background-image"
        />

        {/* Subtle overlay to ensure text readability */}
        <div className="absolute inset-0 bg-black/20"></div>

        {/* Bottom gradient overlay for smooth transition */}
        <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-blue-600/30 to-transparent"></div>
      </div>

      {/* Content container */}
      <div className="container relative z-10 px-3 xs:px-4 sm:px-6 md:px-8 py-6 xs:py-8 sm:py-12 md:py-16 lg:py-20 h-full hero-mobile-container">
        <div className="flex flex-col items-center justify-center text-center h-full min-h-screen">
          {/* Main title with brushstroke effect */}
          <div
            className={`relative transition-all duration-1000 transform ${
              isLoaded ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
            }`}
          >
            
          </div>
          {/* CTA Button */}
          <div
            className={`mt-16 xs:mt-20 sm:mt-24 md:mt-32 lg:mt-40 xl:mt-[32rem] hero-button-container transition-all duration-1000 delay-500 transform ${
              isLoaded ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
            }`}
          >
            <Button
              size="lg"
              className="bg-white hover:bg-blue-50 text-blue-600 font-bold rounded-full min-h-[44px] px-6 xs:px-8 sm:px-10 py-3 xs:py-4 sm:py-5 text-sm xs:text-base sm:text-lg shadow-lg"
            >
              <Link href="#register" className="flex items-center">
                REGISTER NOW <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>

                    {/* Date and location */}
          <div
            className={`mt-8 xs:mt-10 iphone16:mt-12 sm:mt-14 md:mt-16 lg:mt-18 text-white text-sm xs:text-base iphone16:text-lg sm:text-lg md:text-xl ethnocentric-text-white hero-date-text transition-all duration-1000 delay-700 transform ${
              isLoaded ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
            }`}
          >
            <div>
              <p className="text-xs xs:text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl wild-youth-text-white mb-2 xs:mb-3 sm:mb-4 md:mb-6 px-2 xs:px-3 sm:px-4">September 2025</p>
            </div>
            <div>
              <p className="text-xs xs:text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl wild-youth-text-white mb-2 xs:mb-3 sm:mb-4 md:mb-6 px-2 xs:px-3 sm:px-4">Fall Season</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
