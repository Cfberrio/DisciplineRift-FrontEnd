"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { XCircle, AlertCircle, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function PaymentCancelPage() {
  const [status, setStatus] = useState<"loading" | "cancelled" | "error">("loading")
  const [message, setMessage] = useState("")
  const searchParams = useSearchParams()

  useEffect(() => {
    const sessionId = searchParams.get("session_id")
    const error = searchParams.get("error")

    const handleCancellation = async () => {
      try {
        if (error) {
          console.log("🔄 Processing payment error:", error)
          setStatus("error")

          switch (error) {
            case "payment_record_failed":
              setMessage("Failed to process payment record")
              break
            case "session_not_found":
              setMessage("Payment session not found")
              break
            case "payment_failed":
              setMessage("Payment processing failed")
              break
            default:
              setMessage("An error occurred during payment processing")
          }
          return
        }

        if (sessionId) {
          console.log("🔄 Recording payment cancellation for session:", sessionId)

          const response = await fetch("/api/payment/cancel", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ sessionId }),
          })

          const data = await response.json()
          console.log("Payment cancellation response:", data)

          if (response.ok) {
            setStatus("cancelled")
            setMessage(data.message || "Payment was cancelled")
          } else {
            setStatus("error")
            setMessage(data.message || "Failed to process cancellation")
          }
        } else {
          setStatus("cancelled")
          setMessage("Payment was cancelled by user")
        }
      } catch (error) {
        console.error("Payment cancellation error:", error)
        setStatus("error")
        setMessage("Failed to process cancellation")
      }
    }

    handleCancellation()
  }, [searchParams])

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full text-center">
          <Loader2 className="h-12 w-12 animate-spin text-dr-blue mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Processing</h1>
          <p className="text-gray-600">Please wait while we process your request...</p>
        </div>
      </div>
    )
  }

  if (status === "cancelled") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full text-center">
          <XCircle className="h-16 w-16 text-orange-500 mx-auto mb-6" />
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Payment Cancelled</h1>
          <p className="text-gray-600 mb-6">{message}</p>

          <div className="bg-orange-50 p-4 rounded-lg mb-6">
            <p className="text-sm text-orange-800">
              Your registration is still saved. You can complete the payment later to secure your spot on the team.
            </p>
          </div>

          <div className="space-y-3">
            <Link href="/#register">
              <Button className="w-full bg-dr-blue hover:bg-blue-700 text-white">Complete Registration</Button>
            </Link>
            <Link href="/">
              <Button variant="outline" className="w-full bg-transparent">
                Return to Home
              </Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full text-center">
        <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-6" />
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Payment Error</h1>
        <p className="text-gray-600 mb-6">{message}</p>

        <div className="space-y-3">
          <Link href="/#register">
            <Button className="w-full bg-dr-blue hover:bg-blue-700 text-white">Try Again</Button>
          </Link>
          <Link href="/">
            <Button variant="outline" className="w-full bg-transparent">
              Return to Home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
