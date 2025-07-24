"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Menu, X, LogIn, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setIsScrolled(true)
      } else {
        setIsScrolled(false)
      }
    }

    window.addEventListener("scroll", handleScroll)
    handleScroll() // Call on mount to set initial state

    return () => {
      window.removeEventListener("scroll", handleScroll)
    }
  }, [])

  const navItems = [
    { name: "ABOUT", href: "#about" },
    { name: "PROGRAMS", href: "#programs" },
    { name: "DR EXPERIENCE", href: "#experience" },
    { name: "CLUB", href: "#club" },
    { name: "FAQ", href: "#faq" },
    { name: "CONTACT US", href: "#contact" },
  ]

  const handleNavClick = (href: string) => {
    setIsMenuOpen(false)

    // Smooth scroll to section
    const element = document.querySelector(href)
    if (element) {
      const headerHeight = 80 // Account for fixed header height
      const elementPosition = element.getBoundingClientRect().top + window.pageYOffset
      const offsetPosition = elementPosition - headerHeight

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      })
    }
  }

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300 ease-in-out",
        isScrolled ? "bg-white shadow-md py-3" : "bg-transparent py-4",
      )}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link
            href="/"
            className={cn(
              "text-xl font-bold transition-colors duration-300",
              isScrolled ? "text-dr-blue" : "text-white",
            )}
          >
            DISCIPLINE RIFT
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => (
              <button
                key={item.name}
                onClick={() => handleNavClick(item.href)}
                className={cn(
                  "font-bold italic transition-colors duration-300 px-3 py-2 rounded-md text-sm hover:bg-opacity-80 cursor-pointer",
                  isScrolled ? "text-gray-700 hover:bg-blue-50 hover:text-dr-blue" : "text-white hover:bg-white/10",
                )}
              >
                {item.name}
              </button>
            ))}

            <div className="flex items-center space-x-2 pl-3">
              <Button
                size="sm"
                onClick={() => handleNavClick("#register")}
                className={cn(
                  "rounded-full px-5 py-2 text-sm transition-colors duration-300 cursor-pointer",
                  isScrolled ? "bg-sky-500 hover:bg-blue-600 text-white" : "bg-sky-500 hover:bg-blue-600 text-white",
                )}
              >
                REGISTER NOW
              </Button>

              <Link
                href="/dashboard"
                aria-label="Parent Dashboard"
                className={cn(
                  "p-2 rounded-md transition-colors duration-300",
                  isScrolled ? "hover:bg-blue-50 text-gray-700" : "hover:bg-white/10 text-white",
                )}
              >
                <User className="h-5 w-5" />
                <span className="sr-only">Dashboard</span>
              </Link>

              <Link
                href="/login"
                aria-label="Login"
                className={cn(
                  "p-2 rounded-md transition-colors duration-300",
                  isScrolled ? "hover:bg-blue-50 text-gray-700" : "hover:bg-white/10 text-white",
                )}
              >
                <LogIn className="h-5 w-5" />
                <span className="sr-only">Log In</span>
              </Link>
            </div>
          </nav>

          {/* Mobile Menu Button */}
          <button
            className={cn(
              "md:hidden p-2 rounded-md transition-colors duration-300",
              isScrolled ? "text-gray-700 hover:bg-blue-50" : "text-white hover:bg-white/10",
            )}
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
            aria-expanded={isMenuOpen}
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden bg-white shadow-lg absolute top-full left-0 right-0 animate-fade-down">
          <div className="container mx-auto px-4 py-4">
            <nav className="flex flex-col space-y-2">
              {navItems.map((item) => (
                <button
                  key={item.name}
                  onClick={() => handleNavClick(item.href)}
                  className="text-gray-700 font-bold italic py-2 px-3 hover:bg-blue-50 hover:text-dr-blue rounded-md transition-colors text-left"
                >
                  {item.name}
                </button>
              ))}
              <Button
                className="bg-sky-500 hover:bg-blue-600 text-white rounded-full w-full mt-2"
                onClick={() => handleNavClick("#register")}
              >
                REGISTER NOW
              </Button>
              <div className="flex space-x-3 pt-3 border-t border-gray-200 mt-3">
                <Link
                  href="/dashboard"
                  aria-label="Parent Dashboard"
                  className="flex-1 bg-blue-50 p-2 rounded-md text-dr-blue text-center font-medium hover:bg-blue-100 transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <User className="h-5 w-5 inline mr-1" /> Dashboard
                </Link>
                <Link
                  href="/login"
                  aria-label="Login"
                  className="flex-1 bg-blue-50 p-2 rounded-md text-dr-blue text-center font-medium hover:bg-blue-100 transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <LogIn className="h-5 w-5 inline mr-1" /> Log In
                </Link>
              </div>
            </nav>
          </div>
        </div>
      )}
    </header>
  )
}
