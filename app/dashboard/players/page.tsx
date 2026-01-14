"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { User, Calendar, GraduationCap, Phone, ChevronDown, ChevronUp, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"

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
    school: {
      name: string
      location: string
    }
  }
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
        router.push("/register")
        return
      }

      const { data: studentsData, error: studentsError } = await supabase
        .from("student")
        .select(`
          studentid,
          firstname,
          lastname,
          dob,
          grade,
          ecname,
          ecphone,
          ecrelationship,
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

    } catch (error) {
      console.error("Fetch students error:", error)
    } finally {
      setLoading(false)
    }
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

  const toggleExpand = (studentId: string) => {
    setExpandedStudent(expandedStudent === studentId ? null : studentId)
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
        <h1 className="text-3xl font-bold text-gray-900">My Players</h1>
        <p className="mt-2 text-gray-600">Manage your children's enrollment and information.</p>
      </div>

      {/* No Students */}
      {students.length === 0 && (
        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-12 text-center">
          <User className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">No Players Found</h2>
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

      {/* Students List */}
      <div className="space-y-6">
        {students.map((student) => {
          const isExpanded = expandedStudent === student.studentid
          const activeEnrollments = student.enrollments.filter(e => e.isactive)
          const inactiveEnrollments = student.enrollments.filter(e => !e.isactive)

          return (
            <div key={student.studentid} className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
              {/* Student Header */}
              <div className="px-6 py-5 border-b border-gray-200">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                      {student.firstname} {student.lastname}
                    </h2>
                    <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-2" />
                        {calculateAge(student.dob)} years old
                      </div>
                      <div className="flex items-center">
                        <GraduationCap className="h-4 w-4 mr-2" />
                        Grade {student.grade}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => toggleExpand(student.studentid)}
                    className="p-2 rounded-md hover:bg-gray-100 transition-colors"
                    aria-label={isExpanded ? "Collapse details" : "Expand details"}
                  >
                    {isExpanded ? (
                      <ChevronUp className="h-6 w-6 text-gray-600" />
                    ) : (
                      <ChevronDown className="h-6 w-6 text-gray-600" />
                    )}
                  </button>
                </div>
              </div>

              {/* Student Content */}
              <div className="px-6 py-5">
                {/* Enrolled Programs */}
                <div className="mb-6">
                  <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                    <div className="h-1 w-1 rounded-full mr-2" style={{ backgroundColor: '#0085B7' }}></div>
                    Enrolled Programs
                  </h3>
                  {student.enrollments.length === 0 ? (
                    <div className="text-sm text-gray-500 bg-gray-50 p-4 rounded-lg flex items-start">
                      <AlertCircle className="h-4 w-4 mr-2 flex-shrink-0 mt-0.5" />
                      No enrollments yet
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {activeEnrollments.map((enrollment) => (
                        <div key={enrollment.enrollmentid} className="border border-gray-200 rounded-lg p-4 hover:border-[#0085B7] transition-colors">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h4 className="font-semibold text-gray-900">{enrollment.team.name}</h4>
                              <p className="text-sm text-gray-600 mt-1">{enrollment.team.description}</p>
                              <p className="text-sm text-gray-600 mt-2">
                                <span className="font-medium">School:</span> {enrollment.team.school?.name || 'TBD'}
                              </p>
                              <p className="text-sm text-gray-600">
                                <span className="font-medium">Location:</span> {enrollment.team.school?.location || 'TBD'}
                              </p>
                            </div>
                            <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded-full">
                              Active
                            </span>
                          </div>
                        </div>
                      ))}
                      {inactiveEnrollments.length > 0 && isExpanded && (
                        <>
                          <h4 className="text-sm font-medium text-gray-500 mt-4 mb-2">Past Enrollments</h4>
                          {inactiveEnrollments.map((enrollment) => (
                            <div key={enrollment.enrollmentid} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <h4 className="font-semibold text-gray-700">{enrollment.team.name}</h4>
                                  <p className="text-sm text-gray-500 mt-1">{enrollment.team.school?.name}</p>
                                </div>
                                <span className="px-3 py-1 bg-gray-200 text-gray-600 text-xs font-semibold rounded-full">
                                  Inactive
                                </span>
                              </div>
                            </div>
                          ))}
                        </>
                      )}
                    </div>
                  )}
                </div>

                {/* Emergency Contact - Expandable */}
                {isExpanded && (
                  <div className="border-t border-gray-200 pt-6">
                    <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                      <div className="h-1 w-1 rounded-full mr-2" style={{ backgroundColor: '#0085B7' }}></div>
                      Emergency Contact
                    </h3>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs font-medium text-gray-500 mb-1">Name</p>
                          <p className="text-sm text-gray-900">{student.ecname}</p>
                        </div>
                        <div>
                          <p className="text-xs font-medium text-gray-500 mb-1">Relationship</p>
                          <p className="text-sm text-gray-900">{student.ecrelationship}</p>
                        </div>
                        <div className="sm:col-span-2">
                          <p className="text-xs font-medium text-gray-500 mb-1">Phone</p>
                          <a 
                            href={`tel:${student.ecphone}`}
                            className="text-sm flex items-center hover:underline"
                            style={{ color: '#0085B7' }}
                          >
                            <Phone className="h-4 w-4 mr-2" />
                            {student.ecphone}
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                {activeEnrollments.length > 0 && (
                  <div className="mt-6 pt-6 border-t border-gray-200 flex gap-3">
                    <Button 
                      variant="outline"
                      className="flex-1"
                      onClick={() => router.push("/dashboard/schedule")}
                    >
                      View Schedule
                    </Button>
                    <Button 
                      variant="outline"
                      className="flex-1"
                      disabled
                      title="Coming in Phase 2"
                    >
                      View Details
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
