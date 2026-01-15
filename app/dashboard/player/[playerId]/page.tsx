"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { getTierSystemBySport } from "@/lib/tiers"
import Breadcrumb from "@/components/breadcrumb"
import ChildHubHeader from "@/components/child-hub-header"
import SportProfileTabs from "@/components/sport-profile-tabs"
import TierNavigator from "@/components/tier-navigator"
import ThisWeeksFocus from "@/components/this-weeks-focus"
import { Loader2 } from "lucide-react"

interface Enrollment {
  enrollmentId: string
  sport: string
  teamName: string
  teamDescription?: string
  school: {
    id: number
    name: string
    location: string
  } | null
  coaches: Array<{
    id: string
    name: string
    email: string
  }>
  attendance: {
    totalPractices: number
    attended: number
    percentage: number
  }
  currentTier: number
}

interface StudentProfile {
  student: {
    id: string
    firstName: string
    lastName: string
    fullName: string
    dob: string
    age: number
    grade: string
  }
  enrollments: Enrollment[]
  summary: {
    totalEnrollments: number
    sports: string[]
    overallAttendance: number
  }
}

export default function ChildHubPage() {
  const params = useParams()
  const router = useRouter()
  const playerId = params.playerId as string

  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState<StudentProfile | null>(null)
  const [selectedSport, setSelectedSport] = useState<string>("")
  const [selectedTier, setSelectedTier] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchStudentProfile()
  }, [playerId])

  const fetchStudentProfile = async () => {
    try {
      setLoading(true)
      setError(null)

      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.push("/dashboard/login")
        return
      }

      const response = await fetch(`/api/students/${playerId}/profile`, {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      })

      if (!response.ok) {
        throw new Error("Failed to fetch student profile")
      }

      const data: StudentProfile = await response.json()
      setProfile(data)

      // Set first sport as default selected
      if (data.enrollments.length > 0) {
        setSelectedSport(data.enrollments[0].sport)
      }
    } catch (err) {
      console.error("Error fetching profile:", err)
      setError("Failed to load student profile")
    } finally {
      setLoading(false)
    }
  }

  const handleTierClick = (tierNumber: number) => {
    setSelectedTier(selectedTier === tierNumber ? null : tierNumber)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-[#0085B7] mx-auto mb-4" />
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    )
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center">
          <div className="text-5xl mb-4">😕</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Oops!</h2>
          <p className="text-gray-600 mb-6">{error || "Student not found"}</p>
          <button
            onClick={() => router.push("/dashboard/players")}
            className="px-6 py-3 bg-[#0085B7] text-white font-semibold rounded-lg hover:bg-[#006B94] transition-colors"
          >
            Back to Players
          </button>
        </div>
      </div>
    )
  }

  // Get current enrollment data
  const currentEnrollment = profile.enrollments.find(e => e.sport === selectedSport)
  const tierSystem = currentEnrollment ? getTierSystemBySport(currentEnrollment.sport) : null
  // Tier comes from student.Level column in database
  const currentTier = currentEnrollment?.currentTier || 1

  // Prepare sports for tabs
  const sports = profile.enrollments.map(e => ({
    name: e.sport,
    emoji: tierSystem?.sportEmoji || "🏅",
    enrollmentId: e.enrollmentId
  }))

  // Get all coaches and school from enrollments
  const allCoaches = profile.enrollments.flatMap(e => e.coaches)
  const uniqueCoaches = Array.from(new Map(allCoaches.map(c => [c.id, c])).values())
  const school = currentEnrollment?.school || null

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
      <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 sm:py-8 md:px-8 md:py-10 space-y-6">
        {/* Breadcrumb */}
        <Breadcrumb
          items={[
            { label: "Players", href: "/dashboard/players" },
            { label: profile.student.fullName }
          ]}
        />

        {/* Child Hub Header */}
        <ChildHubHeader
          student={profile.student}
          attendancePercentage={profile.summary.overallAttendance}
          coaches={uniqueCoaches}
          school={school}
        />

        {/* Check if student has enrollments */}
        {profile.enrollments.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
            <div className="text-5xl mb-4">📋</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              No Active Enrollments
            </h3>
            <p className="text-gray-600">
              This student is not currently enrolled in any sports programs.
            </p>
          </div>
        ) : (
          <>
            {/* Sport Profile Tabs */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <SportProfileTabs
                sports={sports}
                selectedSport={selectedSport}
                onSelectSport={setSelectedSport}
                studentId={profile.student.id}
              />

              {/* Sport Profile Content */}
              <div className="p-4 sm:p-6 md:p-8 space-y-6">
                {tierSystem ? (
                  <>
                    {/* Current Tier Card */}
                    <div className="bg-gradient-to-r from-[#0085B7] to-[#006B94] rounded-xl p-4 sm:p-6 text-white">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-sm sm:text-base font-medium opacity-90 mb-1">
                            Current Level
                          </div>
                          <div className="text-2xl sm:text-3xl md:text-4xl font-bold">
                            Tier {currentTier}
                          </div>
                        </div>
                        <div className="text-4xl sm:text-5xl md:text-6xl">
                          {tierSystem.sportEmoji}
                        </div>
                      </div>
                      <div className="mt-3 sm:mt-4 text-xs sm:text-sm opacity-90">
                        Based on {currentEnrollment?.attendance.percentage}% attendance
                      </div>
                    </div>

                    {/* This Week's Focus */}
                    <ThisWeeksFocus
                      currentTier={currentTier}
                      tierSystem={tierSystem}
                      attendancePercentage={currentEnrollment?.attendance.percentage || 0}
                      studentId={profile.student.id}
                    />

                    {/* Tier Navigator */}
                    <div>
                      <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">
                        Skill Progression
                      </h2>
                      <TierNavigator
                        tiers={tierSystem.tiers}
                        currentTier={currentTier}
                        selectedTier={selectedTier}
                        onSelectTier={handleTierClick}
                        attendancePercentage={currentEnrollment?.attendance.percentage || 0}
                        studentId={profile.student.id}
                      />
                    </div>
                  </>
                ) : (
                  <div className="text-center py-12">
                    <div className="text-5xl mb-4">🏗️</div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      Tier System Coming Soon
                    </h3>
                    <p className="text-gray-600">
                      The tier system for {selectedSport} is currently being developed.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
