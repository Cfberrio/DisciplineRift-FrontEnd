"use client"

import { Children, type ReactNode, cloneElement, isValidElement } from "react"
import { useIntersectionObserver } from "@/hooks/use-intersection-observer"
import { cn } from "@/lib/utils"

interface StaggeredChildrenProps {
  children: ReactNode
  className?: string
  staggerAmount?: number
  baseDelay?: number
  animation?: "fade-up" | "fade-left" | "fade-right" | "zoom-in"
  threshold?: number
  rootMargin?: string
}

export default function StaggeredChildren({
  children,
  className,
  staggerAmount = 100,
  baseDelay = 0,
  animation = "fade-up",
  threshold = 0.1,
  rootMargin = "0px",
}: StaggeredChildrenProps) {
  const [ref, isIntersecting] = useIntersectionObserver({
    threshold,
    rootMargin,
    once: true,
  })

  const getAnimationClass = () => {
    switch (animation) {
      case "fade-up":
        return "animate-fade-up"
      case "fade-left":
        return "animate-fade-left"
      case "fade-right":
        return "animate-fade-right"
      case "zoom-in":
        return "animate-zoom-in"
      default:
        return "animate-fade-up"
    }
  }

  const childrenWithStagger = Children.map(children, (child, index) => {
    if (isValidElement(child)) {
      return cloneElement(child, {
        className: cn(child.props.className, "opacity-0", isIntersecting && getAnimationClass()),
        style: {
          ...child.props.style,
          transitionDelay: `${baseDelay + index * staggerAmount}ms`,
          animationDelay: `${baseDelay + index * staggerAmount}ms`,
        },
      })
    }
    return child
  })

  return (
    <div ref={ref} className={className}>
      {childrenWithStagger}
    </div>
  )
}
