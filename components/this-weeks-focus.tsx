"use client"

import { Target } from "lucide-react"
import { SportTierSystem } from "@/lib/tiers"
import { getSkillStatus, getStudentColorById } from "@/lib/dashboard-utils"

interface ThisWeeksFocusProps {
  currentTier: number
  tierSystem: SportTierSystem
  attendancePercentage: number
  studentId: string
}

export default function ThisWeeksFocus({
  currentTier,
  tierSystem,
  attendancePercentage,
  studentId
}: ThisWeeksFocusProps) {
  const studentColor = getStudentColorById(studentId)

  // Get current tier
  const currentTierData = tierSystem.tiers.find(t => t.tierNumber === currentTier)
  
  if (!currentTierData) {
    return null
  }

  // Filter skills in "Developing" status (current tier skills)
  const developingSkills = currentTierData.skills.filter(skill => {
    const status = getSkillStatus(currentTier, currentTier, attendancePercentage)
    return status === "Developing"
  })

  return (
    <div 
      className="rounded-xl border-2 overflow-hidden"
      style={{ 
        borderColor: studentColor.primary,
        backgroundColor: `${studentColor.light}30`
      }}
    >
      {/* Header */}
      <div 
        className="px-4 py-3 sm:px-5 sm:py-4 flex items-center gap-2.5 sm:gap-3"
        style={{ backgroundColor: studentColor.primary }}
      >
        <Target className="h-5 w-5 sm:h-6 sm:w-6 text-white flex-shrink-0" />
        <h3 className="text-base sm:text-lg font-bold text-white">
          Current Focus
        </h3>
      </div>

      {/* Content */}
      <div className="p-4 sm:p-5">
        {developingSkills.length > 0 ? (
          <>
            <p className="text-xs sm:text-sm text-gray-700 mb-3 sm:mb-4">
              Skills in development for {tierSystem.sportEmoji} {tierSystem.sportName} - Tier {currentTier}:
            </p>
            <ul className="space-y-2 sm:space-y-2.5">
              {developingSkills.map((skill) => (
                <li 
                  key={skill.id} 
                  className="flex items-start gap-2.5 sm:gap-3 p-2.5 sm:p-3 bg-white rounded-lg border border-gray-200"
                >
                  <div 
                    className="w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                    style={{ backgroundColor: studentColor.primary }}
                  >
                    <div className="w-2 h-2 rounded-full bg-white"></div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm sm:text-base font-medium text-gray-900">
                      {skill.name}
                    </div>
                    {skill.description && (
                      <div className="text-xs sm:text-sm text-gray-600 mt-1">
                        {skill.description}
                      </div>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </>
        ) : (
          <div className="text-center py-6 sm:py-8">
            <div className="text-4xl sm:text-5xl mb-3 sm:mb-4">🎉</div>
            <h4 className="text-base sm:text-lg font-bold text-gray-900 mb-2">
              Great Job!
            </h4>
            <p className="text-xs sm:text-sm text-gray-600 max-w-md mx-auto">
              Keep practicing to master all skills and move to the next tier.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
