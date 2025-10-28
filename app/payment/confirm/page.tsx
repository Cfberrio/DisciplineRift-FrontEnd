"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import Head from "next/head"
import { CheckCircle, XCircle, Loader2, Home, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

interface PaymentDetails {
  amount: number
  teamName: string
  studentName: string
  date: string
}

export default function PaymentConfirmPage() {
  const searchParams = useSearchParams()
  const [isLoading, setIsLoading] = useState(true)
  const [paymentDetails, setPaymentDetails] = useState<PaymentDetails | null>(null)
  const [error, setError] = useState<string | null>(null)

  const success = searchParams.get("success")
  const sessionId = searchParams.get("session_id")
  const enrollmentId = searchParams.get("enrollment_id")
  const isMock = searchParams.get("mock")
  const errorParam = searchParams.get("error")

  useEffect(() => {
    async function confirmPayment() {
      if (errorParam) {
        setError(getErrorMessage(errorParam))
        setIsLoading(false)
        return
      }

      if (success === "true") {
        if (isMock === "true") {
          // Mock payment success
          setPaymentDetails({
            amount: 299,
            teamName: "Mock Team",
            studentName: "Test Student",
            date: new Date().toISOString(),
          })
          setIsLoading(false)
          return
        }

        if (sessionId) {
          try {
            // Confirm payment via API
            const response = await fetch("/api/payment/confirm", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ sessionId }),
            })

            const data = await response.json()

            if (data.success) {
              setPaymentDetails(data.paymentDetails)
            } else {
              setError(data.message || "Payment confirmation failed")
            }
          } catch (err) {
            console.error("Payment confirmation error:", err)
            setError("Failed to confirm payment")
          }
        } else {
          setError("Missing payment session information")
        }
      } else {
        setError("Payment was not successful")
      }

      setIsLoading(false)
    }

    confirmPayment()
  }, [success, sessionId, enrollmentId, isMock, errorParam])

  const getErrorMessage = (errorCode: string): string => {
    switch (errorCode) {
      case "missing_session":
        return "Payment session not found"
      case "invalid_session":
        return "Invalid payment session"
      case "payment_not_completed":
        return "Payment was not completed"
      case "missing_enrollment":
        return "Enrollment information missing"
      case "payment_record_failed":
        return "Failed to record payment"
      case "unexpected_error":
        return "An unexpected error occurred"
      default:
        return "Payment confirmation failed"
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  if (isLoading) {
    return (
      <>
        <Head>
          <title>Confirming Payment | Discipline Rift</title>
          <meta name="robots" content="noindex,nofollow" />
        </Head>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-lg text-center max-w-md w-full mx-4">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Confirming Payment</h2>
          <p className="text-gray-600">Please wait while we process your payment...</p>
        </div>
        </div>
      </>
    )
  }

  if (error) {
    return (
      <>
        <Head>
          <title>Payment Failed | Discipline Rift</title>
          <meta name="robots" content="noindex,nofollow" />
        </Head>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-lg text-center max-w-md w-full mx-4">
          <div className="bg-red-100 rounded-full p-4 w-16 h-16 mx-auto mb-4">
            <XCircle className="h-8 w-8 text-red-600 mx-auto" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Payment Failed</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <div className="space-y-3">
            <Link href="/register">
              <Button className="w-full bg-blue-600 hover:bg-blue-700">Try Again</Button>
            </Link>
            <Link href="/">
              <Button variant="outline" className="w-full bg-transparent">
                <Home className="mr-2 h-4 w-4" />
                Return Home
              </Button>
            </Link>
          </div>
        </div>
        </div>
      </>
    )
  }

  if (paymentDetails) {
    return (
      <>
        <Head>
          <title>Payment Successful | Discipline Rift</title>
          <meta name="robots" content="noindex,nofollow" />
        </Head>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-lg text-center max-w-md w-full mx-4">
          <div className="bg-green-100 rounded-full p-4 w-16 h-16 mx-auto mb-4">
            <CheckCircle className="h-8 w-8 text-green-600 mx-auto" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment Successful!</h2>
          <p className="text-gray-600 mb-6">Your registration has been completed successfully.</p>

          <div className="bg-gray-50 p-4 rounded-lg mb-6 text-left">
            <h3 className="font-semibold text-gray-900 mb-3">Payment Details</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Amount:</span>
                <span className="font-medium">${paymentDetails.amount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Team:</span>
                <span className="font-medium">{paymentDetails.teamName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Student:</span>
                <span className="font-medium">{paymentDetails.studentName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Date:</span>
                <span className="font-medium">{formatDate(paymentDetails.date)}</span>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg mb-6">
            <h4 className="font-semibold text-blue-900 mb-2">What's Next?</h4>
            <ul className="text-sm text-blue-800 text-left space-y-1">
              <li>• You'll receive a confirmation email shortly</li>
              <li>• The coach will contact you before the first session</li>
              <li>• Check your parent dashboard for updates</li>
            </ul>
          </div>

          <div className="space-y-3">
            <Link href="/dashboard">
              <Button className="w-full bg-blue-600 hover:bg-blue-700">
                <User className="mr-2 h-4 w-4" />
                View Dashboard
              </Button>
            </Link>
            <Link href="/">
              <Button variant="outline" className="w-full bg-transparent">
                <Home className="mr-2 h-4 w-4" />
                Return Home
              </Button>
            </Link>
          </div>
        </div>
        </div>
      </>
    )
  }

  return null
}
