"use client"

import { getStudentColorById } from "@/lib/dashboard-utils"

interface Sport {
  name: string
  emoji: string
  enrollmentId: string
}

interface SportProfileTabsProps {
  sports: Sport[]
  selectedSport: string
  onSelectSport: (sportName: string) => void
  studentId: string
}

export default function SportProfileTabs({
  sports,
  selectedSport,
  onSelectSport,
  studentId
}: SportProfileTabsProps) {
  const studentColor = getStudentColorById(studentId)

  if (sports.length === 0) {
    return null
  }

  return (
    <div className="bg-white border-b border-gray-200">
      {/* Mobile: Horizontal Scroll Tabs */}
      <div className="sm:hidden overflow-x-auto scrollbar-hide">
        <div className="flex gap-1 p-2 min-w-max">
          {sports.map((sport) => {
            const isSelected = sport.name === selectedSport
            return (
              <button
                key={sport.enrollmentId}
                onClick={() => onSelectSport(sport.name)}
                className={`
                  flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium text-sm whitespace-nowrap
                  transition-all duration-200
                  ${isSelected 
                    ? 'text-white shadow-md' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }
                `}
                style={isSelected ? { backgroundColor: studentColor.primary } : {}}
              >
                <span className="text-lg">{sport.emoji}</span>
                <span>{sport.name}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Desktop: Traditional Tabs */}
      <div className="hidden sm:flex border-b border-gray-200">
        {sports.map((sport) => {
          const isSelected = sport.name === selectedSport
          return (
            <button
              key={sport.enrollmentId}
              onClick={() => onSelectSport(sport.name)}
              className={`
                flex items-center gap-2 px-6 py-4 font-medium text-sm md:text-base
                transition-all duration-200 border-b-2 -mb-px
                ${isSelected 
                  ? 'border-current' 
                  : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }
              `}
              style={isSelected ? { color: studentColor.primary } : {}}
            >
              <span className="text-xl md:text-2xl">{sport.emoji}</span>
              <span>{sport.name}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
