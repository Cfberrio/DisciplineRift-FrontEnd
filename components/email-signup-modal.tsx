"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Mail, ArrowRight, Loader2, User, AlertCircle, CheckCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import { validateEmail, getSuggestedEmail, normalizeEmail } from "@/lib/email-validation"

interface EmailSignupModalProps {
  onSubscribe: (email: string, name: string, honeypot: string) => Promise<void>
  isSubmitting: boolean
}

export default function EmailSignupModal({ onSubscribe, isSubmitting }: EmailSignupModalProps) {
  const [email, setEmail] = useState("")
  const [name, setName] = useState("")
  const [honeypot, setHoneypot] = useState("")
  const [error, setError] = useState("")
  const [suggestion, setSuggestion] = useState<string | null>(null)
  const [validationWarning, setValidationWarning] = useState("")

  // Real-time validation on email change
  useEffect(() => {
    if (!email.trim()) {
      setSuggestion(null)
      setValidationWarning("")
      return
    }

    const normalized = normalizeEmail(email)
    const result = validateEmail(normalized)

    if (!result.valid && result.error) {
      setValidationWarning(result.error)
      setSuggestion(null)
    } else if (result.suggestion) {
      setSuggestion(result.suggestion)
      setValidationWarning("")
    } else {
      setSuggestion(null)
      setValidationWarning("")
    }
  }, [email])

  const handleSuggestionClick = () => {
    if (suggestion) {
      setEmail(suggestion)
      setSuggestion(null)
      setValidationWarning("")
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    
    if (!name.trim()) {
      setError("Name is required.")
      return
    }

    if (!email.trim()) {
      setError("Email address is required.")
      return
    }

    // Validate email
    const normalized = normalizeEmail(email)
    const result = validateEmail(normalized)
    
    if (!result.valid) {
      setError(result.error || "Invalid email address")
      return
    }

    setError("")
    await onSubscribe(email, name, honeypot)
  }

  return (
    <DialogContent className="w-[95vw] max-w-md sm:w-full md:max-w-lg lg:max-w-xl bg-gradient-to-br from-blue-500 to-blue-700 text-white border-none shadow-2xl rounded-lg overflow-hidden max-h-[90vh] overflow-y-auto">
      <DialogHeader className="pt-6 sm:pt-8 px-6 sm:px-8 text-center">
        <div className="mx-auto mb-4 bg-yellow-400 p-3 rounded-full w-fit">
          <Mail className="h-8 w-8 text-blue-700" />
        </div>
        <DialogTitle className="font-ethnocentric text-xl sm:text-2xl md:text-3xl lg:text-4xl text-yellow-300 tracking-wide mb-2 leading-tight">
          What If Sports Could Unlock Your Child's Potential?
        </DialogTitle>
        <DialogDescription className="text-blue-100 text-sm sm:text-base leading-relaxed mb-2">
          Discover how volleyball, tennis, or pickleball can help your child build confidence, discipline, and teamwork—all while having fun.
          <br /><strong>Sign up to get season updates, expert tips, and priority registration.</strong>
        </DialogDescription>
      </DialogHeader>
      <form onSubmit={handleSubmit} className="px-6 sm:px-8 py-4 sm:py-6 space-y-4">
        {/* Honeypot field - hidden from users, bots will fill it */}
        <input
          type="text"
          name="website"
          value={honeypot}
          onChange={(e) => setHoneypot(e.target.value)}
          tabIndex={-1}
          autoComplete="off"
          style={{
            position: 'absolute',
            left: '-9999px',
            width: '1px',
            height: '1px',
            opacity: 0,
          }}
          aria-hidden="true"
        />

        <div className="relative">
          <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-blue-300" />
          <Input
            id="name"
            type="text"
            placeholder="Your Name"
            value={name}
            onChange={(e) => {
              setName(e.target.value)
              if (error) setError("")
            }}
            required
            className={cn(
              "w-full pl-10 pr-4 py-3 h-12 text-base rounded-md border-2 bg-blue-600/50 text-white placeholder-blue-300 focus:bg-blue-600 focus:border-yellow-400 focus:ring-yellow-400",
              error && "border-red-400 focus:border-red-500 ring-red-500",
            )}
            aria-describedby="form-error"
          />
        </div>
        
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-blue-300" />
          <Input
            id="email"
            type="email"
            placeholder="your.email@example.com"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value)
              if (error) setError("")
            }}
            required
            className={cn(
              "w-full pl-10 pr-4 py-3 h-12 text-base rounded-md border-2 bg-blue-600/50 text-white placeholder-blue-300 focus:bg-blue-600 focus:border-yellow-400 focus:ring-yellow-400",
              (error || validationWarning) && "border-red-400 focus:border-red-500 ring-red-500",
            )}
            aria-describedby="form-error validation-warning email-suggestion"
          />
        </div>

        {/* Email suggestion */}
        {suggestion && !error && (
          <button
            type="button"
            onClick={handleSuggestionClick}
            className="w-full text-left text-sm text-yellow-300 bg-yellow-900/30 px-3 py-2 rounded-md hover:bg-yellow-900/50 transition-colors flex items-center gap-2"
            id="email-suggestion"
          >
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            <span>Did you mean <strong className="underline">{suggestion}</strong>?</span>
          </button>
        )}

        {/* Validation warning (real-time) */}
        {validationWarning && !error && (
          <p id="validation-warning" className="text-sm text-yellow-300 bg-yellow-900/30 px-3 py-2 rounded-md flex items-center gap-2">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            {validationWarning}
          </p>
        )}

        {/* Error message */}
        {error && (
          <p id="form-error" className="text-sm text-red-300 bg-red-900/50 px-3 py-2 rounded-md flex items-center gap-2">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            {error}
          </p>
        )}
        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-yellow-400 hover:bg-yellow-500 text-blue-700 font-bold rounded-md h-12 text-lg transition-all duration-300 transform hover:scale-105 shadow-md"
        >
          {isSubmitting ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <ArrowRight className="mr-2 h-5 w-5" />}
          {isSubmitting ? "GETTING GUIDE..." : "Get My Parent Guide"}
        </Button>
      </form>
      <DialogFooter className="px-6 sm:px-8 pb-6 sm:pb-8 text-center space-y-3">
        <div className="w-full">
          <p className="text-sm font-semibold text-yellow-300 mb-1">
            How to Stay Connected to Your Child's Sports Journey
          </p>
          <p className="text-xs text-blue-200">
            5 simple ways to spark excitement and build a love for sports at home.
          </p>
        </div>
        
      </DialogFooter>
      {/* DialogClose is automatically added by shadcn/ui Dialog for the 'X' button */}
    </DialogContent>
  )
}
