"use client"

import type { ReactNode } from "react"
import { useIntersectionObserver } from "@/hooks/use-intersection-observer"
import { cn } from "@/lib/utils"

type AnimationType = "fade-up" | "fade-down" | "fade-left" | "fade-right" | "zoom-in" | "zoom-out" | "flip" | "none"

interface AnimatedSectionProps {
  children: ReactNode
  className?: string
  animation?: AnimationType
  delay?: number
  threshold?: number
  rootMargin?: string
  id?: string
  once?: boolean
}

export default function AnimatedSection({
  children,
  className,
  animation = "fade-up",
  delay = 0,
  threshold = 0.1,
  rootMargin = "0px",
  id,
  once = true,
}: AnimatedSectionProps) {
  const [ref, isIntersecting] = useIntersectionObserver({
    threshold,
    rootMargin,
    once,
  })

  const getAnimationClass = () => {
    if (!isIntersecting) return "opacity-0"

    switch (animation) {
      case "fade-up":
        return "animate-fade-up"
      case "fade-down":
        return "animate-fade-down"
      case "fade-left":
        return "animate-fade-left"
      case "fade-right":
        return "animate-fade-right"
      case "zoom-in":
        return "animate-zoom-in"
      case "zoom-out":
        return "animate-zoom-out"
      case "flip":
        return "animate-flip"
      case "none":
        return "opacity-100"
      default:
        return "animate-fade-up"
    }
  }

  return (
    <div
      ref={ref}
      id={id}
      className={cn("transition-all duration-700", getAnimationClass(), className)}
      style={{
        transitionDelay: `${delay}ms`,
        willChange: "opacity, transform",
      }}
    >
      {children}
    </div>
  )
}
