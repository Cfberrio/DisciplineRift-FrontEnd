"use client"

import type React from "react"

import { cn } from "@/lib/utils"

interface BrushstrokeTitleProps {
  children: React.ReactNode
  className?: string
  size?: "sm" | "md" | "lg" | "xl"
  color?: "blue" | "white" | "black" | "red"
}

export default function BrushstrokeTitle({ children, className, size = "lg", color = "blue" }: BrushstrokeTitleProps) {
  const sizeClasses = {
    sm: "text-2xl md:text-3xl",
    md: "text-3xl md:text-4xl",
    lg: "text-4xl md:text-5xl lg:text-6xl",
    xl: "text-5xl md:text-6xl lg:text-7xl",
  }

  const colorClasses = {
    blue: "text-dr-blue",
    white: "text-white",
    black: "text-black",
    red: "text-red-600",
  }

  return (
    <div className={cn("relative inline-block", className)}>
      <h1
        className={cn(
          "font-ethnocentric font-black tracking-widest relative z-10 uppercase",
          sizeClasses[size],
          colorClasses[color],
          "drop-shadow-lg",
          "filter contrast-125 brightness-110",
          "transform hover:scale-105 transition-transform duration-300",
        )}
        style={{
          textShadow: `
            2px 2px 4px rgba(0,0,0,0.3),
            -1px -1px 2px rgba(255,255,255,0.1),
            0 0 10px rgba(30, 64, 175, 0.2)
          `,
          background: `linear-gradient(135deg, ${color === "blue" ? "#1e40af" : color === "white" ? "#ffffff" : "#000000"} 0%, ${color === "blue" ? "#3b82f6" : color === "white" ? "#f8fafc" : "#374151"} 100%)`,
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text",
        }}
      >
        {children}
      </h1>

      {/* Decorative brush stroke effect */}
      <div
        className="absolute inset-0 -z-10 opacity-20"
        style={{
          background: `radial-gradient(ellipse at center, ${color === "blue" ? "rgba(30, 64, 175, 0.1)" : "rgba(0,0,0,0.1)"} 0%, transparent 70%)`,
          filter: "blur(8px)",
          transform: "scale(1.2) rotate(-2deg)",
        }}
      />

      {/* Animated underline effect */}
      <div
        className={cn(
          "absolute bottom-0 left-0 h-1 bg-gradient-to-r opacity-60 transform origin-left transition-all duration-500",
          color === "blue" ? "from-dr-blue to-dr-light-blue" : "from-gray-600 to-gray-400",
          "hover:scale-x-110 hover:opacity-80",
        )}
        style={{
          width: "100%",
          height: "3px",
          borderRadius: "2px",
        }}
      />
    </div>
  )
}
