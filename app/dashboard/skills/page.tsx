"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { getTierSystemBySport } from "@/lib/tiers"
import { 
  getStudentColorById, 
  getInitials,
  getSportEmoji
} from "@/lib/dashboard-utils"
import SkillsTierAccordion from "@/components/skills-tier-accordion"
import { Loader2, Trophy, Target } from "lucide-react"

interface Student {
  studentid: string
  firstname: string
  lastname: string
  Level: number
  enrollment: Enrollment[]
}

interface Enrollment {
  enrollmentid: string
  isactive: boolean
  team: {
    teamid: string
    name: string
    sport: string
    school: {
      name: string
    }
  }
}

export default function SkillsPage() {
  const [loading, setLoading] = useState(true)
  const [students, setStudents] = useState<Student[]>([])
  const router = useRouter()

  useEffect(() => {
    fetchStudentsData()
  }, [])

  const fetchStudentsData = async () => {
    try {
      setLoading(true)

      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.push("/dashboard/login")
        return
      }

      const response = await fetch("/api/students/list", {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      })

      if (!response.ok) {
        console.error("Error fetching students:", await response.text())
        return
      }

      const { students: studentsData } = await response.json()

      const formattedStudents = (studentsData || []).map((student: any) => ({
        ...student,
        enrollments: student.enrollment || []
      }))

      setStudents(formattedStudents)

    } catch (error) {
      console.error("Skills data fetch error:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-[#0085B7] mx-auto mb-4" />
          <p className="text-gray-600">Loading skills...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Target className="h-8 w-8 sm:h-10 sm:w-10 text-[#0085B7]" />
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900">
              Skills & Tier Progress
            </h1>
          </div>
          <p className="text-sm sm:text-base text-gray-600">
            Track skill development and tier progression for all your players
          </p>
        </div>

        {/* Students Grid */}
        {students.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <div className="text-5xl mb-4">📋</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              No Students Enrolled
            </h3>
            <p className="text-gray-600">
              You don't have any students enrolled in programs yet.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {students.map(student => {
              const studentColor = getStudentColorById(student.studentid)
              const initials = getInitials(student.firstname, student.lastname)
              const activeEnrollments = student.enrollment?.filter(e => e.isactive) || []

              return (
                <div
                  key={student.studentid}
                  className="bg-white rounded-xl shadow-md border-2 overflow-hidden"
                  style={{ borderColor: studentColor.light }}
                >
                  {/* Student Header */}
                  <div 
                    className="px-4 py-4 sm:px-6 sm:py-5 border-b-4"
                    style={{ borderColor: studentColor.primary, backgroundColor: studentColor.light }}
                  >
                    <div className="flex items-center gap-4">
                      {/* Avatar */}
                      <div
                        className="w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center text-white text-xl sm:text-2xl font-bold flex-shrink-0 shadow-md"
                        style={{ backgroundColor: studentColor.primary }}
                      >
                        {initials}
                      </div>

                      {/* Student Info */}
                      <div className="flex-1 min-w-0">
                        <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 truncate">
                          {student.firstname} {student.lastname}
                        </h2>
                        <div className="flex items-center gap-2 mt-1">
                          <Trophy className="h-4 w-4 text-[#0085B7]" />
                          <span className="text-sm sm:text-base font-semibold text-gray-700">
                            Current Level: Tier {student.Level || 1}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Enrollments / Sports */}
                  <div className="p-4 sm:p-6">
                    {activeEnrollments.length === 0 ? (
                      <p className="text-gray-500 text-center py-8">
                        No active enrollments
                      </p>
                    ) : (
                      <div className="space-y-4 sm:space-y-6">
                        {activeEnrollments.map(enrollment => {
                          const tierSystem = getTierSystemBySport(enrollment.team.sport)
                          const sportEmoji = getSportEmoji(enrollment.team.sport)
                          const currentTier = student.Level || 1

                          if (!tierSystem) {
                            return (
                              <div key={enrollment.enrollmentid} className="text-center py-4 text-gray-500">
                                Tier system not available for {enrollment.team.sport}
                              </div>
                            )
                          }

                          return (
                            <div 
                              key={enrollment.enrollmentid}
                              className="border-2 rounded-xl overflow-hidden"
                              style={{ borderColor: `${studentColor.primary}30` }}
                            >
                              {/* Sport Header */}
                              <div 
                                className="px-4 py-3 sm:px-5 sm:py-4 flex items-center justify-between"
                                style={{ backgroundColor: `${studentColor.light}30` }}
                              >
                                <div className="flex items-center gap-3">
                                  <span className="text-3xl sm:text-4xl">{sportEmoji}</span>
                                  <div>
                                    <h3 className="text-base sm:text-lg font-bold text-gray-900">
                                      {enrollment.team.sport}
                                    </h3>
                                    <p className="text-xs sm:text-sm text-gray-600">
                                      {enrollment.team.name}
                                    </p>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <div 
                                    className="text-2xl sm:text-3xl font-bold"
                                    style={{ color: studentColor.primary }}
                                  >
                                    T{currentTier}
                                  </div>
                                  <div className="text-xs sm:text-sm text-gray-600">
                                    of {tierSystem.tiers.length}
                                  </div>
                                </div>
                              </div>

                              {/* Skills & Tier Progression Accordion */}
                              <div className="p-4 sm:p-5">
                                <SkillsTierAccordion
                                  tierSystem={tierSystem}
                                  currentTier={currentTier}
                                  attendancePercentage={100}
                                  studentId={student.studentid}
                                  studentColor={studentColor}
                                />
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
