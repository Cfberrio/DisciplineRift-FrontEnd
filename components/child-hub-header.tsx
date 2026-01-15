"use client"

import Link from "next/link"
import { Calendar, MessageCircle, FileText, AlertCircle } from "lucide-react"
import { getInitials, getStudentColorById } from "@/lib/dashboard-utils"

interface Coach {
  id: string
  name: string
  email: string
}

interface School {
  id: number
  name: string
  location: string
}

interface ChildHubHeaderProps {
  student: {
    id: string
    firstName: string
    lastName: string
    fullName: string
    age: number
    grade: string
  }
  attendancePercentage: number
  coaches: Coach[]
  school: School | null
}

export default function ChildHubHeader({
  student,
  attendancePercentage,
  coaches,
  school
}: ChildHubHeaderProps) {
  const studentColor = getStudentColorById(student.id)
  const initials = getInitials(student.firstName, student.lastName)

  // Calculate progress circle dasharray (circumference = 2 * PI * radius)
  const radius = 45
  const circumference = 2 * Math.PI * radius
  const progress = (attendancePercentage / 100) * circumference
  const remaining = circumference - progress

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="p-4 sm:p-6 md:p-8">
        {/* Header Content - Responsive Layout */}
        <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 md:gap-8">
          {/* Left: Avatar + Info */}
          <div className="flex items-center gap-4 sm:flex-1">
            {/* Avatar */}
            <div
              className="relative w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-full flex items-center justify-center text-white text-xl sm:text-2xl md:text-3xl font-bold flex-shrink-0 shadow-lg"
              style={{ backgroundColor: studentColor.primary }}
            >
              {initials}
            </div>

            {/* Student Info */}
            <div className="flex-1 min-w-0">
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-1 truncate">
                {student.fullName}
              </h1>
              <div className="flex flex-wrap gap-x-3 gap-y-1 text-sm sm:text-base text-gray-600">
                <span>{student.age} years old</span>
                <span className="hidden sm:inline">•</span>
                <span>Grade {student.grade}</span>
              </div>
              
              {/* School Badge */}
              {school && (
                <div className="mt-2">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#E6F4F9] text-[#006B94]">
                    📍 {school.name}
                  </span>
                </div>
              )}

              {/* Coaches */}
              {coaches.length > 0 && (
                <div className="mt-2 text-xs sm:text-sm text-gray-500">
                  Coach: {coaches.map(c => c.name.split(' ')[0]).join(', ')}
                </div>
              )}
            </div>
          </div>

          {/* Right: Attendance Circle - Desktop */}
          <div className="hidden sm:flex items-center justify-center flex-shrink-0">
            <div className="relative w-28 h-28 md:w-32 md:h-32">
              {/* Background Circle */}
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="50%"
                  cy="50%"
                  r={radius}
                  stroke="#E5E7EB"
                  strokeWidth="8"
                  fill="none"
                />
                {/* Progress Circle */}
                <circle
                  cx="50%"
                  cy="50%"
                  r={radius}
                  stroke={studentColor.primary}
                  strokeWidth="8"
                  fill="none"
                  strokeDasharray={`${progress} ${remaining}`}
                  strokeLinecap="round"
                  className="transition-all duration-500"
                />
              </svg>
              {/* Percentage Text */}
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <div className="text-2xl md:text-3xl font-bold" style={{ color: studentColor.primary }}>
                  {attendancePercentage}%
                </div>
                <div className="text-xs text-gray-500 mt-0.5">Attendance</div>
              </div>
            </div>
          </div>

          {/* Attendance Bar - Mobile */}
          <div className="sm:hidden">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Attendance</span>
              <span className="text-sm font-bold" style={{ color: studentColor.primary }}>
                {attendancePercentage}%
              </span>
            </div>
            <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  backgroundColor: studentColor.primary,
                  width: `${attendancePercentage}%`
                }}
              />
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-6 sm:mt-8">
          <h3 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">
            Quick Actions
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
            {/* Report Absence */}
            <button
              className="flex flex-col items-center justify-center p-3 sm:p-4 rounded-lg border-2 border-gray-200 hover:border-[#0085B7] hover:bg-blue-50 transition-all group"
              disabled
            >
              <AlertCircle className="h-5 w-5 sm:h-6 sm:w-6 text-gray-400 group-hover:text-[#0085B7] mb-1.5 sm:mb-2" />
              <span className="text-xs sm:text-sm font-medium text-gray-700 group-hover:text-[#0085B7] text-center">
                Report Absence
              </span>
            </button>

            {/* Message Coach */}
            <button
              className="flex flex-col items-center justify-center p-3 sm:p-4 rounded-lg border-2 border-gray-200 hover:border-[#0085B7] hover:bg-blue-50 transition-all group"
              disabled
            >
              <MessageCircle className="h-5 w-5 sm:h-6 sm:w-6 text-gray-400 group-hover:text-[#0085B7] mb-1.5 sm:mb-2" />
              <span className="text-xs sm:text-sm font-medium text-gray-700 group-hover:text-[#0085B7] text-center">
                Message Coach
              </span>
            </button>

            {/* View Schedule */}
            <Link
              href="/dashboard/schedule"
              className="flex flex-col items-center justify-center p-3 sm:p-4 rounded-lg border-2 border-gray-200 hover:border-[#0085B7] hover:bg-blue-50 transition-all group"
            >
              <Calendar className="h-5 w-5 sm:h-6 sm:w-6 text-gray-400 group-hover:text-[#0085B7] mb-1.5 sm:mb-2" />
              <span className="text-xs sm:text-sm font-medium text-gray-700 group-hover:text-[#0085B7] text-center">
                View Schedule
              </span>
            </Link>

            {/* View Resources */}
            <button
              className="flex flex-col items-center justify-center p-3 sm:p-4 rounded-lg border-2 border-gray-200 hover:border-[#0085B7] hover:bg-blue-50 transition-all group"
              disabled
            >
              <FileText className="h-5 w-5 sm:h-6 sm:w-6 text-gray-400 group-hover:text-[#0085B7] mb-1.5 sm:mb-2" />
              <span className="text-xs sm:text-sm font-medium text-gray-700 group-hover:text-[#0085B7] text-center">
                View Resources
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
