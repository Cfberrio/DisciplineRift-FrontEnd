"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { supabase } from "@/lib/supabase"
import { Calendar, Users, CreditCard, Clock, MapPin, User, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"

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
  studentName: string
  teamName: string
  date: string
  dayOfWeek: string
  time: string
  location: string
  schoolName: string
  coachName: string
}

export default function DashboardHome() {
  const [students, setStudents] = useState<Student[]>([])
  const [nextPractices, setNextPractices] = useState<NextPractice[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      
      if (authError || !user) {
        router.push("/register")
        return
      }

      // Fetch students with enrollments
      const { data: studentsData, error: studentsError } = await supabase
        .from("student")
        .select(`
          studentid,
          firstname,
          lastname,
          grade,
          dob,
          enrollment (
            enrollmentid,
            isactive,
            team (
              teamid,
              name,
              description,
              school (
                name,
                location
              ),
              session (
                sessionid,
                startdate,
                enddate,
                starttime,
                endtime,
                daysofweek,
                staff (
                  name,
                  email,
                  phone
                )
              )
            )
          )
        `)
        .eq("parentid", user.id)
        .order("created_at", { ascending: false })

      if (studentsError) {
        console.error("Error fetching students:", studentsError)
        return
      }

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
                  studentName: `${student.firstname} ${student.lastname}`,
                  teamName: enrollment.team.name,
                  date: nextDate.toISOString().split('T')[0],
                  dayOfWeek: day,
                  time: `${session.starttime.slice(0, 5)} - ${session.endtime.slice(0, 5)}`,
                  location: enrollment.team.school?.location || 'TBD',
                  schoolName: enrollment.team.school?.name || 'School TBD',
                  coachName: session.staff?.name || 'Coach TBD'
                })
              }
            }
          })
        })
      })
    })

    // Sort by date and return next 5
    return practices.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()).slice(0, 5)
  }

  const calculateAge = (dob: string) => {
    const birthDate = new Date(dob)
    const today = new Date()
    let age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--
    }
    return age
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

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

  const activeEnrollments = students.filter(s => 
    s.enrollments.some(e => e.isactive)
  )

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-2 text-gray-600">Welcome back! Here's what's happening with your children's programs.</p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <Link href="/dashboard/schedule">
          <Button className="w-full h-full py-6 flex items-center justify-center gap-3 bg-white hover:bg-gray-50 text-gray-900 border-2 border-gray-200 hover:border-[#0085B7]">
            <Calendar className="h-5 w-5" style={{ color: '#0085B7' }} />
            <span className="font-semibold">View Schedule</span>
          </Button>
        </Link>
        <Link href="/dashboard/players">
          <Button className="w-full h-full py-6 flex items-center justify-center gap-3 bg-white hover:bg-gray-50 text-gray-900 border-2 border-gray-200 hover:border-[#0085B7]">
            <Users className="h-5 w-5" style={{ color: '#0085B7' }} />
            <span className="font-semibold">My Players</span>
          </Button>
        </Link>
        <Link href="/dashboard/payments">
          <Button className="w-full h-full py-6 flex items-center justify-center gap-3 bg-white hover:bg-gray-50 text-gray-900 border-2 border-gray-200 hover:border-[#0085B7]">
            <CreditCard className="h-5 w-5" style={{ color: '#0085B7' }} />
            <span className="font-semibold">Payments</span>
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Next Practices */}
        <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200" style={{ backgroundColor: '#0085B7' }}>
            <h2 className="text-xl font-bold text-white flex items-center">
              <Calendar className="h-5 w-5 mr-2" />
              Upcoming Practices
            </h2>
          </div>
          <div className="p-6">
            {nextPractices.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No upcoming practices scheduled</p>
            ) : (
              <div className="space-y-4">
                {nextPractices.map((practice, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4 hover:border-[#0085B7] transition-colors">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-semibold text-gray-900">{practice.studentName}</h3>
                        <p className="text-sm text-gray-600">{practice.teamName}</p>
                      </div>
                      <span className="text-xs font-medium px-2 py-1 rounded" style={{ backgroundColor: '#E6F4F9', color: '#0085B7' }}>
                        {practice.dayOfWeek}
                      </span>
                    </div>
                    <div className="space-y-1 text-sm text-gray-600">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-2" />
                        {formatDate(practice.date)}
                      </div>
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-2" />
                        {practice.time}
                      </div>
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 mr-2" />
                        {practice.schoolName}
                      </div>
                      <div className="flex items-center">
                        <User className="h-4 w-4 mr-2" />
                        Coach: {practice.coachName}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {nextPractices.length > 0 && (
              <Link href="/dashboard/schedule">
                <Button className="w-full mt-4" variant="outline">
                  View Full Schedule
                  <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
            )}
          </div>
        </div>

        {/* Active Enrollments */}
        <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200" style={{ backgroundColor: '#0085B7' }}>
            <h2 className="text-xl font-bold text-white flex items-center">
              <Users className="h-5 w-5 mr-2" />
              Active Enrollments
            </h2>
          </div>
          <div className="p-6">
            {activeEnrollments.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No active enrollments</p>
            ) : (
              <div className="space-y-4">
                {activeEnrollments.map(student => (
                  <div key={student.studentid} className="border border-gray-200 rounded-lg p-4 hover:border-[#0085B7] transition-colors">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          {student.firstname} {student.lastname}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {calculateAge(student.dob)} years old • Grade {student.grade}
                        </p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      {student.enrollments
                        .filter(e => e.isactive)
                        .map(enrollment => (
                          <div key={enrollment.enrollmentid} className="flex items-center justify-between text-sm">
                            <div>
                              <p className="font-medium text-gray-900">{enrollment.team.name}</p>
                              <p className="text-gray-600">{enrollment.team.school?.name}</p>
                            </div>
                            <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded">
                              Active
                            </span>
                          </div>
                        ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
            <Link href="/dashboard/players">
              <Button className="w-full mt-4" variant="outline">
                View All Players
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
