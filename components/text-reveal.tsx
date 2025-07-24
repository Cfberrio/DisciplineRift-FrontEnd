"use client"

import { useIntersectionObserver } from "@/hooks/use-intersection-observer"
import { cn } from "@/lib/utils"

interface TextRevealProps {
  text: string
  className?: string
  threshold?: number
  rootMargin?: string
  once?: boolean
  delay?: number
  staggerAmount?: number
  tag?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "p" | "span"
}

export default function TextReveal({
  text,
  className,
  threshold = 0.1,
  rootMargin = "0px",
  once = true,
  delay = 0,
  staggerAmount = 30,
  tag: Tag = "h2",
}: TextRevealProps) {
  const [ref, isIntersecting] = useIntersectionObserver({
    threshold,
    rootMargin,
    once,
  })

  const words = text.split(" ")

  return (
    <Tag ref={ref} className={cn("overflow-hidden", className)}>
      {words.map((word, wordIndex) => (
        <span key={wordIndex} className="inline-block mr-[0.25em] overflow-hidden">
          <span
            className={cn(
              "inline-block transition-transform duration-700 ease-out",
              isIntersecting ? "translate-y-0" : "translate-y-full",
            )}
            style={{
              transitionDelay: `${delay + wordIndex * staggerAmount}ms`,
            }}
          >
            {word}
          </span>
        </span>
      ))}
    </Tag>
  )
}
