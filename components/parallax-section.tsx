"use client"

import { useRef, type ReactNode, useEffect, useState } from "react"
import { cn } from "@/lib/utils"

interface ParallaxSectionProps {
  children: ReactNode
  className?: string
  speed?: number
  direction?: "up" | "down"
}

export default function ParallaxSection({ children, className, speed = 0.2, direction = "up" }: ParallaxSectionProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [offset, setOffset] = useState(0)
  const [windowHeight, setWindowHeight] = useState(0)
  const [elementTop, setElementTop] = useState(0)

  useEffect(() => {
    const handleResize = () => {
      setWindowHeight(window.innerHeight)
      if (ref.current) {
        const rect = ref.current.getBoundingClientRect()
        setElementTop(rect.top + window.scrollY)
      }
    }

    const handleScroll = () => {
      if (windowHeight > 0 && elementTop > 0) {
        // Calculate how far the element is from the viewport top
        const scrollPosition = window.scrollY
        const elementPosition = elementTop - scrollPosition
        const distanceFromViewportTop = elementPosition - windowHeight

        // Calculate parallax offset based on distance from viewport
        const parallaxOffset = distanceFromViewportTop * speed * (direction === "up" ? -1 : 1)
        setOffset(parallaxOffset)
      }
    }

    handleResize()
    window.addEventListener("resize", handleResize)
    window.addEventListener("scroll", handleScroll)

    return () => {
      window.removeEventListener("resize", handleResize)
      window.removeEventListener("scroll", handleScroll)
    }
  }, [speed, direction, windowHeight, elementTop])

  return (
    <div ref={ref} className={cn("overflow-hidden", className)}>
      <div
        style={{
          transform: `translateY(${offset}px)`,
          transition: "transform 0.1s ease-out",
          willChange: "transform",
        }}
      >
        {children}
      </div>
    </div>
  )
}
