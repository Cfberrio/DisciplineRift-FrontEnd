"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { ChevronDown, ChevronUp } from "lucide-react"
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
    { name: "REGISTER", href: "/?scrollTo=register" },
    { name: "PROGRAMS", href: "/?scrollTo=programs" },
    { name: "DR EXPERIENCE", href: "/?scrollTo=experience" },
    { name: "CLUB", href: "/?scrollTo=club" },
    { name: "FAQ", href: "/?scrollTo=faq" },
    { name: "CONTACT", href: "/?scrollTo=contact" },
    { name: "JOIN TEAM", href: "/?scrollTo=join-team" },
  ]

  const handleNavClick = (href: string) => {
    setIsMenuOpen(false)
    window.location.href = href
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
          <Link href="/" className="transition-opacity duration-300 hover:opacity-80">
            <Image
              src={isScrolled ? "/LOGO DR AZUL.png" : "/DR_LOGO_BLANCO.png"}
              alt="Discipline Rift"
              width={120}
              height={40}
              className="h-8 w-auto transition-all duration-300"
              priority
            />
          </Link>

          {/* Desktop Navigation - Centered */}
          <nav className="hidden md:flex items-center justify-center space-x-1 absolute left-1/2 transform -translate-x-1/2">
            {navItems.map((item) => (
              <button
                key={item.name}
                onClick={() => handleNavClick(item.href)}
                className={cn(
                  "font-bold transition-colors duration-300 px-3 py-2 rounded-md text-sm hover:bg-opacity-80 cursor-pointer",
                  isScrolled ? "text-gray-700 hover:bg-blue-50 hover:text-dr-blue" : "text-white hover:bg-white/10",
                )}
              >
                {item.name}
              </button>
            ))}
          </nav>

          {/* Login/Dashboard Icons - Right */}
          <div className="hidden md:flex items-center space-x-2">
            <button
              aria-label="Parent Dashboard"
              className={cn(
                "p-2 rounded-md transition-colors duration-300 cursor-default",
                isScrolled ? "hover:bg-blue-50 text-gray-700" : "hover:bg-white/10 text-white",
              )}
              onClick={() => {}} // No hace nada
            >
              <Image
                src={isScrolled ? "/CUENTA_ICONO_AZUL.png" : "/PERSONA.png"}
                alt="Dashboard"
                width={20}
                height={20}
                className="h-5 w-5 transition-all duration-300"
              />
              <span className="sr-only">Dashboard</span>
            </button>

            <button
              aria-label="Login"
              className={cn(
                "p-2 rounded-md transition-colors duration-300 cursor-default",
                isScrolled ? "hover:bg-blue-50 text-gray-700" : "hover:bg-white/10 text-white",
              )}
              onClick={() => {}} // No hace nada
            >
              <Image
                src={isScrolled ? "/Logout_desktop_azul.png" : "/LOG OUT_BLANCO.png"}
                alt="Log In"
                width={20}
                height={20}
                className="h-5 w-5"
              />
              <span className="sr-only">Log In</span>
            </button>
          </div>

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
            {isMenuOpen ? <ChevronUp className="h-6 w-6" /> : <ChevronDown className="h-6 w-6" />}
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
                  className="text-gray-700 font-bold py-2 px-3 hover:bg-blue-50 hover:text-dr-blue rounded-md transition-colors text-left"
                >
                  {item.name}
                </button>
              ))}
                             <div className="flex space-x-3 pt-3 border-t border-gray-200 mt-3">
                 <button
                   aria-label="Parent Dashboard"
                   className="flex-1 bg-blue-50 p-2 rounded-md text-dr-blue text-center font-medium hover:bg-blue-100 transition-colors cursor-default"
                   onClick={() => {}} // No hace nada
                 >
                   <Image
                     src="/CUENTA_ICONO_AZUL.png"
                     alt="Dashboard"
                     width={20}
                     height={20}
                     className="h-5 w-5 inline mr-1 transition-all duration-300"
                   />
                   Dashboard
                 </button>
                 <button
                   aria-label="Login"
                   className="flex-1 bg-blue-50 p-2 rounded-md text-dr-blue text-center font-medium hover:bg-blue-100 transition-colors cursor-default"
                   onClick={() => {}} // No hace nada
                 >
                   <Image
                     src="/LOG OUT_BLANCO.png"
                     alt="Log In"
                     width={20}
                     height={20}
                     className="h-5 w-5 inline mr-1"
                   />
                   Log In
                 </button>
               </div>
            </nav>
          </div>
        </div>
      )}
    </header>
  )
}
