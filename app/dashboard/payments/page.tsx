"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { CreditCard, Calendar, User, DollarSign } from "lucide-react"
import { getSportEmoji } from "@/lib/dashboard-utils"

interface Payment {
  paymentid: string
  date: string
  amount: number
  enrollment: {
    enrollmentid: string
    student: {
      studentid: string
      firstname: string
      lastname: string
    }
    team: {
      teamid: string
      name: string
      sport: string
    }
  }
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  }).format(date)
}

const formatAmount = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount)
}

export default function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    fetchPayments()
  }, [])

  const fetchPayments = async () => {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      
      if (authError || !user) {
        router.push("/dashboard/login")
        return
      }

      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        console.error("No session found")
        return
      }

      const response = await fetch("/api/payments", {
        headers: {
          "Authorization": `Bearer ${session.access_token}`
        }
      })

      if (!response.ok) {
        console.error("Error fetching payments:", await response.text())
        return
      }

      const { payments: paymentsData } = await response.json()
      setPayments(paymentsData || [])

    } catch (error) {
      console.error("Fetch payments error:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0085B7] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading payments...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">Payment History</h1>
        <p className="text-lg text-gray-600">
          {payments.length} {payments.length === 1 ? 'payment' : 'payments'} recorded
        </p>
      </div>

      {/* No Payments */}
      {payments.length === 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <CreditCard className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">No payments found</h2>
          <p className="text-gray-600 mb-6">You don't have any payment records yet.</p>
        </div>
      )}

      {/* Payments Table - Desktop */}
      {payments.length > 0 && (
        <div className="hidden md:block bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-[#0085B7] to-[#006B94]">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">
                    Student
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">
                    Program
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">
                    Amount
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {payments.map((payment) => {
                  const sportEmoji = getSportEmoji(payment.enrollment.team.sport)

                  return (
                    <tr key={payment.paymentid} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-sm text-gray-900">
                          <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                          {formatDate(payment.date)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <User className="h-4 w-4 mr-2 text-gray-400" />
                          <div className="text-sm font-medium text-gray-900">
                            {payment.enrollment.student.firstname} {payment.enrollment.student.lastname}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <span className="text-xl mr-2">{sportEmoji}</span>
                          <div className="text-sm text-gray-900 truncate max-w-[200px]">
                            {payment.enrollment.team.name}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-sm font-bold text-gray-900">
                          <DollarSign className="h-4 w-4 text-green-600" />
                          {formatAmount(payment.amount)}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Payments Cards - Mobile */}
      {payments.length > 0 && (
        <div className="md:hidden space-y-4">
          {payments.map((payment) => {
            const sportEmoji = getSportEmoji(payment.enrollment.team.sport)

            return (
              <div key={payment.paymentid} className="bg-white rounded-xl shadow-md border-2 border-gray-200 overflow-hidden">
                {/* Header with Date */}
                <div className="px-4 py-3 bg-gradient-to-r from-[#0085B7] to-[#006B94]">
                  <div className="flex items-center text-sm font-semibold text-white">
                    <Calendar className="h-4 w-4 mr-2" />
                    {formatDate(payment.date)}
                  </div>
                </div>

                {/* Content */}
                <div className="px-4 py-4 space-y-3">
                  {/* Student */}
                  <div className="flex items-center">
                    <User className="h-4 w-4 mr-2 text-gray-400 flex-shrink-0" />
                    <span className="text-sm font-semibold text-gray-900">
                      {payment.enrollment.student.firstname} {payment.enrollment.student.lastname}
                    </span>
                  </div>

                  {/* Program */}
                  <div className="flex items-start">
                    <span className="text-xl mr-2 flex-shrink-0">{sportEmoji}</span>
                    <span className="text-sm text-gray-700 line-clamp-2 flex-1">
                      {payment.enrollment.team.name}
                    </span>
                  </div>

                  {/* Amount */}
                  <div className="pt-2 border-t border-gray-200">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-gray-500 uppercase">Amount Paid</span>
                      <span className="text-lg font-bold text-[#0085B7] flex items-center">
                        {formatAmount(payment.amount)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
