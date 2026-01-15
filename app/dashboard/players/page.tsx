"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { User, Calendar, GraduationCap, Phone, ChevronDown, ChevronUp, AlertCircle, Clock, MapPin } from "lucide-react"
import { Button } from "@/components/ui/button"
import { 
  getStudentColorById, 
  getInitials,
  calculateAge,
  getSportEmoji,
  formatTimeRange
} from "@/lib/dashboard-utils"

interface Student {
  studentid: string
  firstname: string
  lastname: string
  dob: string
  grade: string
  ecname: string
  ecphone: string
  ecrelationship: string
  enrollments: Enrollment[]
}

interface Enrollment {
  enrollmentid: string
  isactive: boolean
  team: {
    teamid: string
    name: string
    description: string
    sport?: string
    school: {
      name: string
      location: string
    }
    session?: Session[]
  }
}

interface Session {
  sessionid: string
  startdate: string
  enddate: string
  starttime: string
  endtime: string
  daysofweek: string
  staff?: {
    name: string
  }
}

interface NextPractice {
  day: string
  date: string
  time: string
  location: string
}

export default function PlayersPage() {
  const [students, setStudents] = useState<Student[]>([])
  const [expandedStudent, setExpandedStudent] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    fetchStudents()
  }, [])

  const fetchStudents = async () => {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      
      if (authError || !user) {
        router.push("/dashboard/login")
        return
      }

      // Fetch students via API endpoint
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        console.error("No session found")
        return
      }

      const response = await fetch("/api/students/list", {
        headers: {
          "Authorization": `Bearer ${session.access_token}`
        }
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
      console.error("Fetch students error:", error)
    } finally {
      setLoading(false)
    }
  }

  const toggleExpand = (studentId: string) => {
    setExpandedStudent(expandedStudent === studentId ? null : studentId)
  }

  const getNextPractice = (enrollments: Enrollment[]): NextPractice | null => {
    const today = new Date()
    const todayDay = today.getDay()
    const dayMap: { [key: string]: number } = {
      'Sunday': 0, 'Monday': 1, 'Tuesday': 2, 'Wednesday': 3,
      'Thursday': 4, 'Friday': 5, 'Saturday': 6
    }

    let closestPractice: { date: Date, practice: NextPractice } | null = null

    enrollments.forEach(enrollment => {
      if (!enrollment.isactive || !enrollment.team?.session) return

      enrollment.team.session.forEach(session => {
        const daysArray = session.daysofweek.split(',').map(d => d.trim())

        daysArray.forEach(day => {
          const dayNum = dayMap[day]
          if (dayNum !== undefined) {
            let daysUntilPractice = (dayNum - todayDay + 7) % 7
            if (daysUntilPractice === 0) daysUntilPractice = 7

            const nextDate = new Date(today)
            nextDate.setDate(today.getDate() + daysUntilPractice)

            const sessionStart = new Date(session.startdate)
            const sessionEnd = new Date(session.enddate)

            if (nextDate >= sessionStart && nextDate <= sessionEnd) {
              if (!closestPractice || nextDate < closestPractice.date) {
                closestPractice = {
                  date: nextDate,
                  practice: {
                    day,
                    date: nextDate.toISOString().split('T')[0],
                    time: formatTimeRange(session.starttime, session.endtime),
                    location: enrollment.team.school?.name || 'TBD'
                  }
                }
              }
            }
          }
        })
      })
    })

    return closestPractice?.practice || null
  }

  const getCountdownText = (dateStr: string): string => {
    const date = new Date(dateStr)
    const today = new Date()
    const diffDays = Math.floor((date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

    if (diffDays === 0) return 'Today'
    if (diffDays === 1) return 'Tomorrow'
    if (diffDays < 7) return `In ${diffDays} days`
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0085B7] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading players...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">My Players</h1>
        <p className="text-lg text-gray-600">
          {students.length} {students.length === 1 ? 'player' : 'players'} registered
        </p>
      </div>

      {/* No Students */}
      {students.length === 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <User className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">No players found</h2>
          <p className="text-gray-600 mb-6">You haven't registered any children yet.</p>
          <Button 
            onClick={() => router.push("/register")}
            style={{ backgroundColor: '#0085B7' }}
            className="text-white"
          >
            Register Now
          </Button>
        </div>
      )}

      {/* Students Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {students.map((student) => {
          const isExpanded = expandedStudent === student.studentid
          const activeEnrollments = student.enrollments.filter(e => e.isactive)
          const inactiveEnrollments = student.enrollments.filter(e => !e.isactive)
          const studentColor = getStudentColorById(student.studentid)
          const initials = getInitials(student.firstname, student.lastname)
          const nextPractice = getNextPractice(student.enrollments)

          return (
            <div key={student.studentid} className="bg-white rounded-xl shadow-md border-2 border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
              {/* Student Header with Avatar */}
              <div 
                className="px-4 py-4 md:px-5 md:py-5 lg:px-6 lg:py-5 border-b-4"
                style={{ borderColor: studentColor.primary, backgroundColor: studentColor.light }}
              >
                <div className="flex items-start gap-2 sm:gap-3 md:gap-4">
                  {/* Avatar */}
                  <div
                    className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 lg:w-16 lg:h-16 rounded-full flex items-center justify-center text-white text-base sm:text-lg md:text-xl lg:text-2xl font-bold flex-shrink-0"
                    style={{ backgroundColor: studentColor.primary }}
                  >
                    {initials}
                  </div>

                  {/* Student Info */}
                  <div className="flex-1 min-w-0">
                    <h2 className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold text-gray-900 truncate">
                      {student.firstname} {student.lastname}
                    </h2>

                    {/* Next Practice Badge */}
                    {nextPractice && (
                      <div className="mt-1.5 sm:mt-2 md:mt-3 inline-flex items-center gap-1 sm:gap-1.5 md:gap-2 px-1.5 py-0.5 sm:px-2 sm:py-1 md:px-3 md:py-1.5 bg-white rounded-lg text-[10px] sm:text-xs md:text-sm shadow-sm border border-gray-200">
                        <Clock className="h-3 w-3 sm:h-3.5 sm:w-3.5 md:h-4 md:w-4 text-[#0085B7] flex-shrink-0" />
                        <span className="font-semibold text-gray-900">
                          Next: {getCountdownText(nextPractice.date)} • {nextPractice.time}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Expand Button - Mobile and Desktop */}
                  <button
                    onClick={() => toggleExpand(student.studentid)}
                    className="p-1 md:p-1.5 lg:p-2 rounded-lg hover:bg-white/50 transition-colors flex-shrink-0 self-start"
                    aria-label={isExpanded ? "Collapse details" : "Expand details"}
                  >
                    {isExpanded ? (
                      <ChevronUp className="h-5 w-5 md:h-6 md:w-6" style={{ color: studentColor.primary }} />
                    ) : (
                      <ChevronDown className="h-5 w-5 md:h-6 md:w-6" style={{ color: studentColor.primary }} />
                    )}
                  </button>
                </div>
              </div>

              {/* Student Content */}
              <div className="px-4 py-4 md:px-5 md:py-5 lg:px-6 lg:py-5">
                {/* Enrolled Programs */}
                <div className="mb-4 md:mb-5">
                  <h3 className="text-xs md:text-sm font-bold text-gray-700 mb-2 md:mb-3 flex items-center">
                    <div className="h-2 w-2 rounded-full mr-2" style={{ backgroundColor: studentColor.primary }}></div>
                    ACTIVE PROGRAMS
                    <span className="ml-2 px-2 py-0.5 bg-gray-100 text-gray-600 text-xs font-medium rounded-full">
                      {activeEnrollments.length}
                    </span>
                  </h3>

                  {student.enrollments.length === 0 ? (
                    <div className="text-sm text-gray-500 bg-gray-50 p-4 rounded-lg flex items-start">
                      <AlertCircle className="h-4 w-4 mr-2 flex-shrink-0 mt-0.5" />
                      No enrollments yet
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {activeEnrollments.map((enrollment) => {
                        const sportEmoji = getSportEmoji(enrollment.team.sport)
                        const sessions = enrollment.team.session || []
                        const daysOfWeek = sessions.length > 0 
                          ? sessions[0].daysofweek.split(',').map(d => d.trim().slice(0, 3)).join(' • ')
                          : 'TBD'
                        const timeRange = sessions.length > 0
                          ? formatTimeRange(sessions[0].starttime, sessions[0].endtime)
                          : 'TBD'

                        return (
                          <div key={enrollment.enrollmentid} className="border-2 rounded-xl p-3 md:p-4 hover:border-gray-400 transition-all" style={{ borderColor: `${studentColor.primary}30` }}>
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex items-start gap-2 flex-1 min-w-0">
                                <span className="text-2xl md:text-2xl lg:text-3xl flex-shrink-0">{sportEmoji}</span>
                                <div className="min-w-0 flex-1">
                                  <h4 className="font-bold text-gray-900 text-sm md:text-base truncate">{enrollment.team.name}</h4>
                                  <p className="text-xs md:text-sm text-gray-600 mt-0.5 line-clamp-2">{enrollment.team.description}</p>
                                </div>
                              </div>
                              <span className="px-2 py-0.5 md:px-3 md:py-1 bg-green-100 text-green-800 text-[10px] md:text-xs font-bold rounded-full flex-shrink-0 ml-2">
                                Active
                              </span>
                            </div>

                            {/* Schedule Info */}
                            <div className="mt-2 md:mt-3 space-y-1.5 md:space-y-2 text-xs md:text-sm">
                              <div className="flex items-center text-gray-700">
                                <Calendar className="h-3.5 w-3.5 md:h-4 md:w-4 mr-1.5 md:mr-2 text-gray-400 flex-shrink-0" />
                                <span className="font-medium truncate">{daysOfWeek}</span>
                              </div>
                              <div className="flex items-center text-gray-700">
                                <Clock className="h-3.5 w-3.5 md:h-4 md:w-4 mr-1.5 md:mr-2 text-gray-400 flex-shrink-0" />
                                <span className="font-medium">{timeRange}</span>
                              </div>
                              <div className="flex items-center text-gray-700">
                                <MapPin className="h-3.5 w-3.5 md:h-4 md:w-4 mr-1.5 md:mr-2 text-gray-400 flex-shrink-0" />
                                <span className="font-medium truncate">{enrollment.team.school?.name || 'TBD'}</span>
                              </div>
                            </div>
                          </div>
                        )
                      })}

                      {/* Past Enrollments - Only when expanded */}
                      {inactiveEnrollments.length > 0 && isExpanded && (
                        <div className="pt-3 border-t border-gray-200">
                          <h4 className="text-xs font-bold text-gray-500 mb-2 uppercase">Past Enrollments</h4>
                          {inactiveEnrollments.map((enrollment) => (
                            <div key={enrollment.enrollmentid} className="border border-gray-200 rounded-lg p-3 bg-gray-50 mb-2">
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <h4 className="font-semibold text-gray-700 text-sm">{enrollment.team.name}</h4>
                                  <p className="text-xs text-gray-500 mt-1">{enrollment.team.school?.name}</p>
                                </div>
                                <span className="px-2 py-1 bg-gray-200 text-gray-600 text-xs font-semibold rounded-full">
                                  Inactive
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Emergency Contact - Expandable */}
                {isExpanded && (
                  <div className="border-t border-gray-200 pt-4 md:pt-5">
                    <h3 className="text-xs md:text-sm font-bold text-gray-700 mb-2 md:mb-3 flex items-center">
                      <div className="h-2 w-2 rounded-full mr-2" style={{ backgroundColor: studentColor.primary }}></div>
                      EMERGENCY CONTACT
                    </h3>
                    <div className="bg-gray-50 rounded-xl p-3 md:p-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 md:gap-3">
                        <div>
                          <p className="text-[10px] md:text-xs font-bold text-gray-500 mb-1 uppercase">Name</p>
                          <p className="text-xs md:text-sm text-gray-900 font-medium">{student.ecname}</p>
                        </div>
                        <div>
                          <p className="text-[10px] md:text-xs font-bold text-gray-500 mb-1 uppercase">Relationship</p>
                          <p className="text-xs md:text-sm text-gray-900 font-medium">{student.ecrelationship}</p>
                        </div>
                        <div className="sm:col-span-2">
                          <p className="text-[10px] md:text-xs font-bold text-gray-500 mb-1 uppercase">Phone</p>
                          <a 
                            href={`tel:${student.ecphone}`}
                            className="text-xs md:text-sm flex items-center hover:underline font-medium"
                            style={{ color: studentColor.primary }}
                          >
                            <Phone className="h-3.5 w-3.5 md:h-4 md:w-4 mr-1.5 md:mr-2" />
                            {student.ecphone}
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                {activeEnrollments.length > 0 && (
                  <div className="mt-4 md:mt-5 pt-4 md:pt-5 border-t border-gray-200 flex flex-col xs:flex-row gap-2 md:gap-3">
                    <Button 
                      variant="outline"
                      className="flex-1 font-semibold hover:bg-gray-50 text-sm md:text-base py-2 md:py-2"
                      onClick={() => router.push("/dashboard/schedule")}
                    >
                      View Schedule
                    </Button>
                    <Button 
                      variant="outline"
                      className="flex-1 font-semibold text-sm md:text-base py-2 md:py-2"
                      disabled
                      title="Coming soon"
                    >
                      Details
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
