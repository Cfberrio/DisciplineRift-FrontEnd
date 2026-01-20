"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { supabase } from "@/lib/supabase"
import { Calendar, Users, CreditCard, Clock, MapPin, User, ChevronRight, TrendingUp, Bell } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  getStudentColorById,
  formatDate,
  formatTimeRange,
  getSportEmoji,
  getCountdownText,
  getInitials
} from "@/lib/dashboard-utils"
import { useMessageNotifications } from "@/hooks/use-message-notifications"
import NotificationBell from "@/components/notifications/NotificationBell"

interface Student {
  studentid: string
  firstname: string
  lastname: string
  grade: string
  dob: string
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
    session: Session[]
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
    email: string
    phone: string
  }
}

interface NextPractice {
  studentId: string
  studentName: string
  teamName: string
  sport?: string
  date: string
  dayOfWeek: string
  time: string
  location: string
  schoolName: string
  coachName: string
  sportEmoji: string
}

export default function DashboardHome() {
  const [students, setStudents] = useState<Student[]>([])
  const [nextPractices, setNextPractices] = useState<NextPractice[]>([])
  const [parentId, setParentId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  // Hook de notificaciones
  const { totalUnread } = useMessageNotifications(parentId)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      
      if (authError || !user) {
        router.push("/dashboard/login")
        return
      }

      setParentId(user.id)

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

      // Calculate next practices
      const practices = calculateNextPractices(formattedStudents)
      setNextPractices(practices)

    } catch (error) {
      console.error("Dashboard data fetch error:", error)
    } finally {
      setLoading(false)
    }
  }

  const calculateNextPractices = (students: Student[]): NextPractice[] => {
    const practices: NextPractice[] = []
    const today = new Date()
    const todayDay = today.getDay() // 0 = Sunday, 1 = Monday, etc.

    students.forEach(student => {
      student.enrollments.forEach(enrollment => {
        if (!enrollment.isactive || !enrollment.team?.session) return

        enrollment.team.session.forEach(session => {
          const daysArray = session.daysofweek.split(',').map(d => d.trim())
          const dayMap: { [key: string]: number } = {
            'Sunday': 0, 'Monday': 1, 'Tuesday': 2, 'Wednesday': 3,
            'Thursday': 4, 'Friday': 5, 'Saturday': 6
          }

          // Find next occurrence
          daysArray.forEach(day => {
            const dayNum = dayMap[day]
            if (dayNum !== undefined) {
              let daysUntilPractice = (dayNum - todayDay + 7) % 7
              if (daysUntilPractice === 0) daysUntilPractice = 7 // Next week if today

              const nextDate = new Date(today)
              nextDate.setDate(today.getDate() + daysUntilPractice)

              // Check if within session date range
              const sessionStart = new Date(session.startdate)
              const sessionEnd = new Date(session.enddate)
              
              if (nextDate >= sessionStart && nextDate <= sessionEnd) {
                practices.push({
                  studentId: student.studentid,
                  studentName: `${student.firstname} ${student.lastname}`,
                  teamName: enrollment.team.name,
                  sport: enrollment.team.sport,
                  date: nextDate.toISOString().split('T')[0],
                  dayOfWeek: day,
                  time: formatTimeRange(session.starttime, session.endtime),
                  location: enrollment.team.school?.location || 'TBD',
                  schoolName: enrollment.team.school?.name || 'School TBD',
                  coachName: session.staff?.name || 'Coach TBD',
                  sportEmoji: getSportEmoji(enrollment.team.sport)
                })
              }
            }
          })
        })
      })
    })

    // Sort by date and return next 6
    return practices.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()).slice(0, 6)
  }

  // Calculate stats
  const activeEnrollments = students.filter(s => 
    s.enrollments.some(e => e.isactive)
  )

  const totalActivePrograms = students.reduce((sum, student) => 
    sum + student.enrollments.filter(e => e.isactive).length, 0
  )

  // Get this week's practices count
  const getThisWeekPracticesCount = (): number => {
    const today = new Date()
    const nextWeek = new Date(today)
    nextWeek.setDate(today.getDate() + 7)

    return nextPractices.filter(p => {
      const practiceDate = new Date(p.date)
      return practiceDate >= today && practiceDate < nextWeek
    }).length
  }

  const thisWeekPractices = getThisWeekPracticesCount()

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0085B7] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">Welcome Back!</h1>
        <p className="text-lg text-gray-600">Here's what's happening with your children's programs.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-8">
        <div className="bg-gradient-to-br from-blue-50 to-white rounded-xl shadow-md border-2 border-blue-200 p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <div className="p-3 bg-blue-100 rounded-xl">
              <Calendar className="h-6 w-6 text-[#0085B7]" />
            </div>
            <TrendingUp className="h-5 w-5 text-blue-400" />
          </div>
          <p className="text-sm font-medium text-gray-600 mb-1">This Week</p>
          <p className="text-4xl font-bold text-gray-900">{thisWeekPractices}</p>
          <p className="text-sm text-gray-500 mt-1">
            {thisWeekPractices === 1 ? 'practice' : 'practices'}
          </p>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-white rounded-xl shadow-md border-2 border-green-200 p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <div className="p-3 bg-green-100 rounded-xl">
              <Users className="h-6 w-6 text-green-600" />
            </div>
            <TrendingUp className="h-5 w-5 text-green-400" />
          </div>
          <p className="text-sm font-medium text-gray-600 mb-1">Active Players</p>
          <p className="text-4xl font-bold text-gray-900">{activeEnrollments.length}</p>
          <p className="text-sm text-gray-500 mt-1">of {students.length} total</p>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-white rounded-xl shadow-md border-2 border-purple-200 p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <div className="p-3 bg-purple-100 rounded-xl">
              <CreditCard className="h-6 w-6 text-purple-600" />
            </div>
            <TrendingUp className="h-5 w-5 text-purple-400" />
          </div>
          <p className="text-sm font-medium text-gray-600 mb-1">Active Programs</p>
          <p className="text-4xl font-bold text-gray-900">{totalActivePrograms}</p>
          <p className="text-sm text-gray-500 mt-1">enrollments</p>
        </div>
      </div>

      {/* Notifications Card */}
      {totalUnread > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Bell className="h-6 w-6 text-[#0085B7]" />
              <h2 className="text-lg font-semibold text-gray-900">New Messages</h2>
            </div>
            <span className="inline-flex items-center rounded-full bg-red-100 px-3 py-1 text-sm font-medium text-red-800">
              {totalUnread} new
            </span>
          </div>
          <p className="text-sm text-gray-600 mb-4">
            You have unread messages from your coaches
          </p>
          <div className="flex justify-center">
            <NotificationBell parentId={parentId} size="lg" showLabel />
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <Link href="/dashboard/schedule">
          <Button className="w-full h-full py-6 flex items-center justify-center gap-3 bg-white hover:bg-[#0085B7] text-gray-900 hover:text-white border-2 border-gray-200 hover:border-[#0085B7] transition-all group">
            <Calendar className="h-6 w-6 text-[#0085B7] group-hover:text-white" />
            <span className="font-bold text-lg">View Schedule</span>
          </Button>
        </Link>
        <Link href="/dashboard/players">
          <Button className="w-full h-full py-6 flex items-center justify-center gap-3 bg-white hover:bg-green-600 text-gray-900 hover:text-white border-2 border-gray-200 hover:border-green-600 transition-all group">
            <Users className="h-6 w-6 text-green-600 group-hover:text-white" />
            <span className="font-bold text-lg">My Players</span>
          </Button>
        </Link>
        <Link href="/dashboard/payments">
          <Button className="w-full h-full py-6 flex items-center justify-center gap-3 bg-white hover:bg-purple-600 text-gray-900 hover:text-white border-2 border-gray-200 hover:border-purple-600 transition-all group">
            <CreditCard className="h-6 w-6 text-purple-600 group-hover:text-white" />
            <span className="font-bold text-lg">Payments</span>
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-5 gap-8">
        {/* Next Practices - Takes more space */}
        <div className="xl:col-span-3">
          <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-200 bg-gradient-to-r from-[#0085B7] to-[#006B94]">
              <h2 className="text-2xl font-bold text-white flex items-center">
                <Calendar className="h-6 w-6 mr-3" />
                Upcoming Practices
              </h2>
            </div>
            <div className="p-6">
              {nextPractices.length === 0 ? (
                <p className="text-gray-500 text-center py-12 text-lg">No practices scheduled</p>
              ) : (
                <div className="space-y-4">
                  {nextPractices.map((practice, index) => {
                    const studentColor = getStudentColorById(practice.studentId)
                    const countdown = getCountdownText(practice.date, practice.time.split(' - ')[0])

                    return (
                      <div 
                        key={index} 
                        className="border-2 rounded-xl p-4 hover:shadow-md transition-all"
                        style={{ borderColor: `${studentColor.primary}30`, backgroundColor: `${studentColor.light}20` }}
                      >
                        <div className="flex items-start gap-4">
                          {/* Sport Emoji */}
                          <div className="text-4xl flex-shrink-0">
                            {practice.sportEmoji}
                          </div>

                          {/* Practice Info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2 flex-wrap">
                              <span
                                className="inline-flex items-center px-3 py-1 rounded-full text-sm font-bold"
                                style={{
                                  backgroundColor: studentColor.primary,
                                  color: 'white',
                                }}
                              >
                                {practice.studentName}
                              </span>
                              <span className="text-sm font-bold px-3 py-1 bg-gray-100 text-gray-700 rounded-full">
                                {countdown}
                              </span>
                            </div>
                            
                            <h3 className="font-bold text-gray-900 text-lg mb-3">{practice.teamName}</h3>
                            
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                              <div className="flex items-center text-gray-700">
                                <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                                <span className="font-medium">{formatDate(practice.date, 'long')}</span>
                              </div>
                              <div className="flex items-center text-gray-700">
                                <Clock className="h-4 w-4 mr-2 text-gray-400" />
                                <span className="font-medium">{practice.time}</span>
                              </div>
                              <div className="flex items-center text-gray-700">
                                <MapPin className="h-4 w-4 mr-2 text-gray-400" />
                                <span className="font-medium truncate">{practice.schoolName}</span>
                              </div>
                              <div className="flex items-center text-gray-600">
                                <User className="h-4 w-4 mr-2 text-gray-400" />
                                <span className="truncate">{practice.coachName}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
              {nextPractices.length > 0 && (
                <Link href="/dashboard/schedule">
                  <Button className="w-full mt-6 py-6 text-base font-bold" style={{ backgroundColor: '#0085B7' }}>
                    View Full Schedule
                    <ChevronRight className="h-5 w-5 ml-2" />
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Active Students - Sidebar */}
        <div className="xl:col-span-2">
          <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden sticky top-6">
            <div className="px-6 py-5 border-b border-gray-200 bg-gradient-to-r from-green-600 to-green-700">
              <h2 className="text-2xl font-bold text-white flex items-center">
                <Users className="h-6 w-6 mr-3" />
                My Players
              </h2>
            </div>
            <div className="p-6">
              {activeEnrollments.length === 0 ? (
                <p className="text-gray-500 text-center py-12">No active enrollments</p>
              ) : (
                <div className="space-y-4">
                  {activeEnrollments.map(student => {
                    const studentColor = getStudentColorById(student.studentid)
                    const initials = getInitials(student.firstname, student.lastname)
                    const activeCount = student.enrollments.filter(e => e.isactive).length

                    return (
                      <Link key={student.studentid} href={`/dashboard/player/${student.studentid}`}>
                        <div className="border-2 rounded-xl p-4 hover:shadow-md hover:border-[#0085B7] transition-all cursor-pointer" style={{ borderColor: studentColor.light }}>
                          <div className="flex items-center gap-3 mb-3">
                            {/* Avatar */}
                            <div
                              className="w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center text-white text-lg sm:text-xl font-bold flex-shrink-0"
                              style={{ backgroundColor: studentColor.primary }}
                            >
                              {initials}
                            </div>

                            <div className="flex-1 min-w-0">
                              <h3 className="font-bold text-gray-900 text-lg sm:text-xl truncate">
                                {student.firstname} {student.lastname}
                              </h3>
                              <p className="text-sm sm:text-base text-gray-600">
                                Grade {student.grade}
                              </p>
                            </div>

                            <span 
                              className="px-2.5 py-1 sm:px-3 sm:py-1 rounded-full text-xs sm:text-sm font-bold text-white flex-shrink-0"
                              style={{ backgroundColor: studentColor.primary }}
                            >
                              {activeCount} {activeCount === 1 ? 'program' : 'programs'}
                            </span>
                          </div>

                          {/* Active Programs */}
                          <div className="space-y-2">
                            {student.enrollments
                              .filter(e => e.isactive)
                              .map(enrollment => {
                                const sportEmoji = getSportEmoji(enrollment.team.sport)
                                return (
                                  <div key={enrollment.enrollmentid} className="flex items-center text-sm bg-gray-50 rounded-lg p-2">
                                    <span className="text-xl mr-2">{sportEmoji}</span>
                                    <div className="flex-1 min-w-0">
                                      <p className="font-semibold text-gray-900 truncate">{enrollment.team.name}</p>
                                      <p className="text-xs text-gray-600 truncate">{enrollment.team.school?.name}</p>
                                    </div>
                                  </div>
                                )
                              })}
                          </div>
                        </div>
                      </Link>
                    )
                  })}
                </div>
              )}
              <Link href="/dashboard/players">
                <Button className="w-full mt-6 py-6 text-base font-bold bg-green-600 hover:bg-green-700">
                  View All Players
                  <ChevronRight className="h-5 w-5 ml-2" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
