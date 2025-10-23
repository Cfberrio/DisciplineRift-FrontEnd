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
        {/* Desktop background */}
        <Image
          src="/hero-halftone-background.png"
          alt="Dynamic halftone pattern background"
          fill
          priority
          className="object-cover object-center w-full h-full hero-background-image hidden lg:block"
        />
        
        {/* Mobile background */}
        <Image
          src="/01.png"
          alt="Mobile background"
          fill
          priority
          className="object-cover object-center w-full h-full hero-background-mobile lg:hidden"
        />

        {/* Subtle overlay to ensure text readability */}
        <div className="absolute inset-0 bg-black/20"></div>

        {/* Bottom gradient overlay for smooth transition */}
        <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-blue-600/30 to-transparent"></div>
      </div>

      {/* Content container */}
      <div className="container relative z-10 px-3 xs:px-4 sm:px-6 md:px-8 py-6 xs:py-8 sm:py-12 md:py-16 lg:py-20 h-full hero-mobile-container">
        <div className="flex flex-col items-center justify-center text-center h-full min-h-screen">
          {/* Main DISCIPLINE RIFT Logo */}
          <div
            className={`relative transition-all duration-1000 transform ${
              isLoaded ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
            }`}
          >
            <div className="flex justify-center items-center px-4 sm:px-6 mb-4 xs:mb-6 sm:mb-8 md:mb-10 lg:mb-12 relative z-20 overflow-visible">
              <Image
                src="DISCIPLINE_RIFT_HEROIMAGE.png"
                alt="Discipline Rift"
                width={2200}              // 2x para servir imagen nítida
                height={1329}
                priority
                sizes="(max-width: 1024px) 200vw, 200vw"  // indica que se mostrará al doble del viewport
                className="w-full max-w-[100%] h-auto hero-logo-main drop-shadow-2xl
                          origin-center scale-[2]"       // 2x en todos los breakpoints
              />
            </div>

          </div>

          {/* Mobile Layout - Text and Button stacked */}
          <div className="lg:hidden">
            {/* Text content - Fall Season message */}
            <div
              className={`mt-6 xs:mt-8 sm:mt-10 md:mt-12 text-center text-white transition-all duration-1000 delay-500 transform relative z-20 ${
                isLoaded ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
              }`}
            >
              <h2 className="text-base xs:text-lg sm:text-xl md:text-2xl font-medium wild-youth-text-white mb-8 xs:mb-10 sm:mb-12 md:mb-16 hero-text-mobile">
                September<br />2025, Fall Season
              </h2>
            </div>

            {/* CTA Button */}
            <div
              className={`transition-all duration-1000 delay-700 transform relative z-20 ${
                isLoaded ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
              }`}
            >
              <Button
                size="lg"
                className="bg-dr-blue hover:bg-blue-700 ethnocentric-title-white rounded-full min-h-[50px] xs:min-h-[55px] sm:min-h-[60px] px-8 xs:px-10 sm:px-12 py-4 xs:py-5 sm:py-6 text-sm xs:text-base sm:text-lg shadow-lg hero-button-mobile"
              >
                <Link href="/register" className="flex items-center">
                  REGISTER NOW <ArrowRight className="ml-2 h-5 w-5 xs:h-6 xs:w-6" />
                </Link>
              </Button>
            </div>
          </div>

          {/* Desktop Layout - Button and Text side by side */}
          <div className="hidden lg:block">
            <div className="flex items-center justify-between w-full max-w-6xl mx-auto mt-16 xl:mt-20">
              {/* CTA Button - Left side */}
              <div
                className={`transition-all duration-1000 delay-500 transform relative z-20 ${
                  isLoaded ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
                }`}
              >
                <Button
                  size="lg"
                  className="bg-dr-blue hover:bg-blue-700 ethnocentric-title-white rounded-full min-h-[60px] px-12 py-6 text-lg shadow-lg"
                >
                  <Link href="/register" className="flex items-center">
                    REGISTER NOW <ArrowRight className="ml-3 h-6 w-6" />
                  </Link>
                </Button>
              </div>

              {/* Text content - Right side */}
              <div
                className={`text-right text-white transition-all duration-1000 delay-700 transform relative z-20 ${
                  isLoaded ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
                }`}
              >
                <h2 className="text-lg xl:text-xl font-medium wild-youth-text-white">
                  <span className="invisible">Winter Season </span>November 2025<span className="invisible">, </span>Winter Season<span className="invisible"> is here! Join us this</span>
                </h2>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
