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
      <div className="container relative z-10 px-4 py-20 h-full">
        <div className="flex flex-col items-center justify-center text-center h-full">
          {/* Main title with brushstroke effect */}
          <div
            className={`relative transition-all duration-1000 transform ${
              isLoaded ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
            }`}
          >
            <h1 className="font-ethnocentric text-7xl md:text-9xl text-blue-400 leading-none mb-0"></h1>
            <h1 className="font-ethnocentric text-6xl md:text-8xl text-white leading-none mt-[-20px] md:mt-[-30px]">
              
            </h1>
          </div>


          {/* CTA Button */}
          <div
            className={`mt-32 transition-all duration-1000 delay-500 transform ${
              isLoaded ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
            }`}
          >
            <Button
              size="lg"
              className="bg-white hover:bg-blue-50 text-blue-600 font-bold rounded-full px-8 py-6 text-lg shadow-lg"
            >
              <Link href="#register" className="flex items-center">
                REGISTER NOW <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
