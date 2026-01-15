"use client"

import Link from "next/link"
import { ChevronRight, Home } from "lucide-react"

export interface BreadcrumbItem {
  label: string
  href?: string
}

interface BreadcrumbProps {
  items: BreadcrumbItem[]
  className?: string
}

export default function Breadcrumb({ items, className = "" }: BreadcrumbProps) {
  return (
    <nav 
      className={`flex items-center space-x-1 text-sm text-gray-600 ${className}`}
      aria-label="Breadcrumb"
    >
      {/* Home Icon */}
      <Link 
        href="/dashboard" 
        className="flex items-center hover:text-[#0085B7] transition-colors"
        aria-label="Home"
      >
        <Home className="h-4 w-4" />
      </Link>

      {/* Breadcrumb Items */}
      {items.map((item, index) => {
        const isLast = index === items.length - 1

        return (
          <div key={index} className="flex items-center space-x-1">
            <ChevronRight className="h-4 w-4 text-gray-400 flex-shrink-0" />
            {item.href && !isLast ? (
              <Link
                href={item.href}
                className="hover:text-[#0085B7] transition-colors truncate"
              >
                {item.label}
              </Link>
            ) : (
              <span 
                className={`truncate ${isLast ? 'text-gray-900 font-semibold' : ''}`}
                aria-current={isLast ? 'page' : undefined}
              >
                {item.label}
              </span>
            )}
          </div>
        )
      })}
    </nav>
  )
}
