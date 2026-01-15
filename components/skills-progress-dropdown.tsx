"use client"

import { useState } from "react"
import { ChevronDown, Check, Clock, Circle, Lock } from "lucide-react"
import { Tier } from "@/lib/tiers/types"
import { getSkillStatus, getSkillStatusColor, getStudentColorById } from "@/lib/dashboard-utils"

interface SkillsProgressDropdownProps {
  tiers: Tier[]
  currentTier: number
  attendancePercentage: number
  studentId: string
  sportEmoji: string
}

export default function SkillsProgressDropdown({
  tiers,
  currentTier,
  attendancePercentage,
  studentId,
  sportEmoji
}: SkillsProgressDropdownProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const studentColor = getStudentColorById(studentId)

  // Calculate total progress
  const totalSkills = tiers.reduce((acc, tier) => acc + tier.skills.length, 0)
  const completedSkills = tiers.reduce((acc, tier) => {
    const tierCompleted = tier.skills.filter(skill => {
      const status = getSkillStatus(tier.tierNumber, currentTier, attendancePercentage)
      return status === "Consistent"
    })
    return acc + tierCompleted.length
  }, 0)

  const getTierStatus = (tierNumber: number): 'completed' | 'current' | 'locked' => {
    if (tierNumber < currentTier) return 'completed'
    if (tierNumber === currentTier) return 'current'
    return 'locked'
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Consistent":
        return <Check className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
      case "Developing":
        return <Clock className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
      case "Not Started":
        return <Circle className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
      default:
        return <Circle className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
    }
  }

  return (
    <div className="space-y-3">
      {/* Main Toggle Button */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-4 py-3 sm:px-6 sm:py-4 bg-white border-2 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 flex items-center justify-between gap-3"
        style={{ borderColor: studentColor.primary }}
      >
        <div className="flex items-center gap-3">
          <div 
            className="w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center text-white font-bold text-lg sm:text-xl flex-shrink-0"
            style={{ backgroundColor: studentColor.primary }}
          >
            {sportEmoji}
          </div>
          <div className="text-left">
            <h3 className="text-base sm:text-lg font-bold text-gray-900">
              View Skills Progress
            </h3>
            <p className="text-xs sm:text-sm text-gray-600">
              {completedSkills}/{totalSkills} skills completed
            </p>
          </div>
        </div>
        <ChevronDown 
          className={`h-5 w-5 sm:h-6 sm:w-6 text-gray-400 transition-transform duration-200 flex-shrink-0 ${
            isExpanded ? 'transform rotate-180' : ''
          }`}
        />
      </button>

      {/* Expandable Content - All Tiers */}
      {isExpanded && (
        <div className="space-y-3 sm:space-y-4 animate-in slide-in-from-top duration-300">
          {tiers.map((tier) => {
            const status = getTierStatus(tier.tierNumber)
            const isCurrent = tier.tierNumber === currentTier

            // Calculate skills progress for this tier
            const tierSkillsCompleted = tier.skills.filter(skill => {
              const skillStatus = getSkillStatus(tier.tierNumber, currentTier, attendancePercentage)
              return skillStatus === "Consistent"
            }).length

            return (
              <div
                key={tier.tierNumber}
                className={`
                  border-2 rounded-xl overflow-hidden bg-white shadow-sm
                  ${isCurrent ? 'ring-2 ring-offset-2' : ''}
                  ${status === 'locked' ? 'opacity-60' : ''}
                `}
                style={
                  isCurrent 
                    ? { borderColor: studentColor.primary, ringColor: studentColor.light }
                    : { borderColor: '#E5E7EB' }
                }
              >
                {/* Tier Header */}
                <div 
                  className="p-3 sm:p-4 flex items-center gap-3 sm:gap-4"
                  style={{ 
                    backgroundColor: isCurrent ? `${studentColor.light}20` : '#F9FAFB' 
                  }}
                >
                  {/* Status Icon */}
                  <div 
                    className="w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{
                      backgroundColor: status === 'completed' 
                        ? '#10B981' 
                        : status === 'current' 
                        ? studentColor.primary 
                        : '#D1D5DB'
                    }}
                  >
                    {status === 'completed' && <Check className="h-5 w-5 sm:h-6 sm:w-6 text-white" />}
                    {status === 'current' && (
                      <span className="text-white font-bold text-base sm:text-lg">
                        {tier.tierNumber}
                      </span>
                    )}
                    {status === 'locked' && <Lock className="h-5 w-5 sm:h-6 sm:w-6 text-white" />}
                  </div>

                  {/* Tier Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="text-base sm:text-lg font-bold text-gray-900">
                        Tier {tier.tierNumber}
                      </h4>
                      {isCurrent && (
                        <span 
                          className="px-2 py-0.5 rounded-full text-xs font-semibold text-white"
                          style={{ backgroundColor: studentColor.primary }}
                        >
                          Current
                        </span>
                      )}
                    </div>
                    <p className="text-xs sm:text-sm text-gray-600 mt-0.5">
                      {tierSkillsCompleted}/{tier.skills.length} skills mastered
                    </p>
                  </div>
                </div>

                {/* Skills List */}
                <div 
                  className="p-3 sm:p-4"
                  style={{ backgroundColor: `${studentColor.light}08` }}
                >
                  {/* Mobile: Single Column */}
                  <div className="sm:hidden space-y-2">
                    {tier.skills.map((skill) => {
                      const skillStatus = getSkillStatus(tier.tierNumber, currentTier, attendancePercentage)
                      const colors = getSkillStatusColor(skillStatus)

                      return (
                        <div
                          key={skill.id}
                          className={`flex items-center gap-2 p-2.5 bg-white rounded-lg border-2 ${colors.border}`}
                        >
                          <div 
                            className={`flex items-center justify-center w-6 h-6 rounded-full ${colors.bg} ${colors.text} flex-shrink-0`}
                          >
                            {getStatusIcon(skillStatus)}
                          </div>
                          <span className="text-sm text-gray-900 flex-1">{skill.name}</span>
                          <span
                            className={`px-2 py-0.5 rounded-full text-xs font-semibold whitespace-nowrap ${colors.bg} ${colors.text}`}
                          >
                            {skillStatus === "Consistent" ? "✓" : skillStatus === "Developing" ? "●" : "○"}
                          </span>
                        </div>
                      )
                    })}
                  </div>

                  {/* Desktop: Two Columns */}
                  <div className="hidden sm:grid sm:grid-cols-2 gap-3">
                    {tier.skills.map((skill) => {
                      const skillStatus = getSkillStatus(tier.tierNumber, currentTier, attendancePercentage)
                      const colors = getSkillStatusColor(skillStatus)

                      return (
                        <div
                          key={skill.id}
                          className={`flex items-center gap-3 p-3 bg-white rounded-lg border-2 hover:shadow-sm transition-shadow ${colors.border}`}
                        >
                          <div 
                            className={`flex items-center justify-center w-8 h-8 rounded-full ${colors.bg} ${colors.text} flex-shrink-0`}
                          >
                            {getStatusIcon(skillStatus)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium text-gray-900">{skill.name}</div>
                            {skill.description && (
                              <div className="text-xs text-gray-500 mt-0.5">{skill.description}</div>
                            )}
                          </div>
                          <span
                            className={`px-2.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${colors.bg} ${colors.text} flex-shrink-0`}
                          >
                            {skillStatus}
                          </span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            )
          })}

          {/* Overall Progress Summary */}
          <div className="bg-gradient-to-r from-gray-50 to-white border border-gray-200 rounded-xl p-4 sm:p-5">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm sm:text-base font-bold text-gray-900">Overall Progress</h4>
              <span className="text-lg sm:text-xl font-bold" style={{ color: studentColor.primary }}>
                {Math.round((completedSkills / totalSkills) * 100)}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5 sm:h-3 mb-3">
              <div 
                className="h-2.5 sm:h-3 rounded-full transition-all duration-500"
                style={{ 
                  width: `${(completedSkills / totalSkills) * 100}%`,
                  backgroundColor: studentColor.primary 
                }}
              />
            </div>
            <div className="flex items-center justify-between text-xs sm:text-sm text-gray-600">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  <span>Mastered</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                  <span>Developing</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-gray-400"></div>
                  <span>Not Started</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
