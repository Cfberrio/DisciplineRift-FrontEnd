"use client"

/**
 * Custom hook for checking registration status
 * This hook allows the frontend to query the backend dashboard for registration status updates
 */
import { useState, useEffect } from "react"

interface RegistrationStatus {
  registrationId: string
  status: "pending" | "approved" | "rejected" | "waitlisted"
  paymentStatus: "unpaid" | "processing" | "paid" | "refunded"
  message?: string
  nextSteps?: string[]
  lastUpdated: string
}

interface UseRegistrationStatusProps {
  registrationId: string
  pollingInterval?: number // in milliseconds
}

export function useRegistrationStatus({
  registrationId,
  pollingInterval = 60000, // Default to checking every minute
}: UseRegistrationStatusProps) {
  const [status, setStatus] = useState<RegistrationStatus | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  // Function to fetch the current registration status
  const fetchStatus = async () => {
    if (!registrationId) return

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/registration-status?id=${registrationId}`)

      if (!response.ok) {
        throw new Error("Failed to fetch registration status")
      }

      const data = await response.json()
      setStatus(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred")
      console.error("Error fetching registration status:", err)
    } finally {
      setIsLoading(false)
    }
  }

  // Set up polling to check status periodically
  useEffect(() => {
    if (!registrationId) return

    // Fetch immediately on mount
    fetchStatus()

    // Set up interval for polling
    const intervalId = setInterval(fetchStatus, pollingInterval)

    // Clean up interval on unmount
    return () => clearInterval(intervalId)
  }, [registrationId, pollingInterval])

  // Function to manually refresh the status
  const refreshStatus = () => {
    fetchStatus()
  }

  return {
    status,
    isLoading,
    error,
    refreshStatus,
  }
}
