"use client"

import { useState, useEffect } from "react"
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
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background image with overlay */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/hero-halftone-background.png"
          alt="Dynamic halftone pattern background"
          fill
          priority
          className="object-cover"
        />

        {/* Subtle overlay to ensure text readability */}
        <div className="absolute inset-0 bg-black/20"></div>

        {/* Bottom gradient overlay for smooth transition */}
        <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-blue-600/30 to-transparent"></div>
      </div>

      {/* Content container */}
      <div className="container relative z-10 px-4 py-8 xs:py-12 sm:py-16 md:py-20 h-full">
        <div className="flex flex-col items-center justify-center text-center h-full min-h-screen">
          {/* Main title with brushstroke effect */}
          <div
            className={`relative transition-all duration-1000 transform ${
              isLoaded ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
            }`}
          >
            <h1 className="font-ethnocentric text-2xl xs:text-3xl iphone16:text-4xl sm:text-4xl md:text-6xl lg:text-7xl xl:text-9xl text-blue-400 leading-none mb-0"></h1>
            <h1 className="font-ethnocentric text-xl xs:text-2xl iphone16:text-3xl sm:text-3xl md:text-5xl lg:text-6xl xl:text-8xl text-white leading-none mt-[-8px] xs:mt-[-10px] iphone16:mt-[-12px] sm:mt-[-12px] md:mt-[-20px] lg:mt-[-25px] xl:mt-[-30px]">
              
            </h1>
          </div>
          {/* CTA Button */}
          <div
            className={`mt-[32rem] xs:mt-[32rem] iphone16:mt-[32rem] sm:mt-[32rem] md:mt-[32rem] lg:mt-[32rem] transition-all duration-1000 delay-500 transform ${
              isLoaded ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
            }`}
          >
            <Button
              size="lg"
              className="bg-white hover:bg-blue-50 text-blue-600 font-bold rounded-full px-4 xs:px-6 iphone16:px-7 sm:px-8 py-3 xs:py-4 iphone16:py-5 sm:py-6 text-sm xs:text-base iphone16:text-lg sm:text-lg shadow-lg"
            >
              <Link href="#register" className="flex items-center">
                REGISTER NOW <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>

                    {/* Date and location */}
          <div
            className={`mt-24 xs:mt-28 iphone16:mt-32 sm:mt-36 md:mt-40 lg:mt-44 text-white text-sm xs:text-base iphone16:text-lg sm:text-lg md:text-xl ethnocentric-text-white transition-all duration-1000 delay-700 transform ${
              isLoaded ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
            }`}
          >
            <div>
              <p className="text-sm xs:text-base sm:text-lg md:text-xl lg:text-2xl wild-youth-text-white mb-3 xs:mb-4 sm:mb-6 px-4 xs:px-0">September 2025</p>
            </div>
            <div>
              <p className="text-sm xs:text-base sm:text-lg md:text-xl lg:text-2xl wild-youth-text-white mb-3 xs:mb-4 sm:mb-6 px-4 xs:px-0">Fall Season</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
