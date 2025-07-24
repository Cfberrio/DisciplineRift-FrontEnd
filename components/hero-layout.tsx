"use client"

import type { ReactNode } from "react"
import Image from "next/image"
import { cn } from "@/lib/utils"
import BrushstrokeTitle from "@/components/brushstroke-title"

interface HeroLayoutProps {
  title: string
  subtitle?: string
  date?: string
  location?: string
  backgroundImage: string
  logo?: string
  children?: ReactNode
  className?: string
  titleColor?: "blue" | "white" | "yellow"
  subtitleColor?: "blue" | "white" | "yellow"
}

export default function HeroLayout({
  title,
  subtitle,
  date,
  location,
  backgroundImage,
  logo,
  children,
  className,
  titleColor = "blue",
  subtitleColor = "white",
}: HeroLayoutProps) {
  return (
    <section className={cn("relative min-h-screen flex items-center justify-center overflow-hidden", className)}>
      {/* Background image */}
      <div className="absolute inset-0 z-0">
        <Image
          src={backgroundImage || "/placeholder.svg"}
          alt="Background"
          fill
          priority
          className="object-cover brightness-[0.7]"
        />

        {/* Overlay with texture */}
        <div className="absolute inset-0 bg-blue-900/50 mix-blend-multiply"></div>

        {/* Light beams effect (similar to Passion Camp) */}
        <div className="absolute inset-0 bg-light-beams opacity-30 mix-blend-screen"></div>

        {/* Bottom gradient overlay */}
        <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-blue-500 to-transparent"></div>
      </div>

      {/* Content */}
      <div className="container relative z-10 px-4 py-20 text-center">
        {logo && (
          <div className="mb-8">
            <Image src={logo || "/placeholder.svg"} alt="Logo" width={80} height={80} className="mx-auto" />
          </div>
        )}

        <div className="max-w-5xl mx-auto">
          {/* Main title with brushstroke effect */}
          <BrushstrokeTitle color={titleColor} size="2xl">
            {title}
          </BrushstrokeTitle>

          {/* Subtitle */}
          {subtitle && (
            <BrushstrokeTitle color={subtitleColor} size="lg" className="mt-4">
              {subtitle}
            </BrushstrokeTitle>
          )}

          {/* Date and location */}
          {(date || location) && (
            <div className="mt-8 text-white text-xl md:text-2xl font-bold italic">
              {date && <div>{date}</div>}
              {location && <div>{location}</div>}
            </div>
          )}

          {/* Additional content */}
          {children && <div className="mt-12">{children}</div>}
        </div>
      </div>
    </section>
  )
}
