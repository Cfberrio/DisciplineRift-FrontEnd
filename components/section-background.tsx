"use client"

import type { ReactNode } from "react"
import Image from "next/image"
import { cn } from "@/lib/utils"

interface SectionBackgroundProps {
  children: ReactNode
  className?: string
  variant?: "default" | "light" | "dark" | "gradient" | "image"
  image?: string
  overlayOpacity?: number
  gradientDirection?: "top" | "bottom" | "left" | "right" | "diagonal"
  id?: string
}

export default function SectionBackground({
  children,
  className,
  variant = "default",
  image,
  overlayOpacity = 0.7,
  gradientDirection = "bottom",
  id,
}: SectionBackgroundProps) {
  // Define gradient directions
  const gradientMap = {
    top: "bg-gradient-to-t",
    bottom: "bg-gradient-to-b",
    left: "bg-gradient-to-l",
    right: "bg-gradient-to-r",
    diagonal: "bg-gradient-to-br",
  }

  // Define background classes based on variant
  const getBgClasses = () => {
    switch (variant) {
      case "light":
        return "bg-white text-blue-800"
      case "dark":
        return "bg-blue-900 text-white"
      case "gradient":
        return `${gradientMap[gradientDirection]} from-blue-500 to-blue-800 text-white`
      case "image":
        return "relative text-white"
      default:
        return "bg-blue-50 text-blue-800"
    }
  }

  return (
    <section id={id} className={cn("relative overflow-hidden", getBgClasses(), className)}>
      {variant === "image" && image && (
        <>
          {/* Background image */}
          <div className="absolute inset-0 z-0">
            <Image src={image || "/placeholder.svg"} alt="Background" fill className="object-cover" priority />

            {/* Overlay with gradient */}
            <div
              className={`absolute inset-0 ${gradientMap[gradientDirection]} from-blue-900 to-blue-500`}
              style={{ opacity: overlayOpacity }}
            ></div>

            {/* Bottom gradient overlay (similar to Passion Camp) */}
            <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-blue-500 to-transparent"></div>
          </div>
        </>
      )}

      {/* Content */}
      <div className={cn("relative z-10", variant === "image" ? "text-white" : "")}>{children}</div>
    </section>
  )
}
