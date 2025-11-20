"use client"

import { useState, useEffect } from "react"
import { Dialog } from "@/components/ui/dialog"
import EmailSignupModal from "./email-signup-modal"

const LOCAL_STORAGE_KEY = "disciplineRiftEmailModalShown"

export default function EmailSignupManager() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    // Check if running in browser environment
    if (typeof window !== "undefined") {
      const modalShown = localStorage.getItem(LOCAL_STORAGE_KEY)
      if (!modalShown) {
        // Optional: Add a small delay before showing the modal
        const timer = setTimeout(() => {
          setIsModalOpen(true)
        }, 1500) // 1.5 second delay
        return () => clearTimeout(timer)
      }
    }
  }, [])

  const handleSubscribe = async (email: string, name: string, honeypot: string) => {
    setIsSubmitting(true)
    console.log("Subscribing to newsletter:", email, "Name:", name)

    try {
      // Call the new newsletter subscribe API with soft validation
      const response = await fetch("/api/newsletter/subscribe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          name,
          honeypot,
        }),
      })

      const result = await response.json()

      if (response.ok && result.ok) {
        console.log("✅ Newsletter subscription successful:", result.msg)
        // On successful subscription:
        localStorage.setItem(LOCAL_STORAGE_KEY, "true")
        setIsModalOpen(false)
        // Optionally, show a success toast/message here
      } else {
        console.error("❌ Newsletter subscription failed:", result.msg)
        // Handle error - could show an error message to the user
        // For now, we'll still close the modal to avoid blocking the user
        localStorage.setItem(LOCAL_STORAGE_KEY, "true")
        setIsModalOpen(false)
      }
    } catch (error) {
      console.error("❌ Error subscribing to newsletter:", error)
      // Handle error - still close modal to avoid blocking the user
      localStorage.setItem(LOCAL_STORAGE_KEY, "true")
      setIsModalOpen(false)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleOpenChange = (open: boolean) => {
    setIsModalOpen(open)
    if (!open) {
      // If the modal is closing for any reason (subscribed, 'X', Esc, overlay click),
      // mark it as shown to prevent it from reappearing.
      if (typeof window !== "undefined") {
        localStorage.setItem(LOCAL_STORAGE_KEY, "true")
      }
    }
  }

  // Don't render the Dialog provider if the modal should not be open initially or is managed.
  // The modal will only render if isModalOpen becomes true.
  if (!isModalOpen && typeof window !== "undefined" && localStorage.getItem(LOCAL_STORAGE_KEY)) {
    return null
  }

  return (
    <Dialog open={isModalOpen} onOpenChange={handleOpenChange}>
      {/* 
        The EmailSignupModal component renders DialogContent and its children.
        It's only rendered when Dialog's `open` prop is true.
      */}
      {isModalOpen && <EmailSignupModal onSubscribe={handleSubscribe} isSubmitting={isSubmitting} />}
    </Dialog>
  )
}
