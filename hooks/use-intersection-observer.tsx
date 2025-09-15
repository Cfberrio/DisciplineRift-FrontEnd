"use client"

import { useEffect, useState, useRef, type RefObject } from "react"

type IntersectionOptions = {
  threshold?: number | number[]
  rootMargin?: string
  once?: boolean
}

export function useIntersectionObserver(options: IntersectionOptions = {}): [RefObject<HTMLDivElement>, boolean] {
  const { threshold = 0.1, rootMargin = "0px", once = false } = options
  const [isIntersecting, setIsIntersecting] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsIntersecting(true)
          if (once && ref.current) {
            observer.unobserve(ref.current)
          }
        } else if (!once) {
          setIsIntersecting(false)
        }
      },
      { threshold, rootMargin },
    )

    const currentRef = ref.current
    if (currentRef) {
      observer.observe(currentRef)
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef)
      }
    }
  }, [threshold, rootMargin, once])

  return [ref, isIntersecting]
}
