"use client"

import { useState } from "react"
import { ChevronDown, Check, Lock, Target, Circle, Clock } from "lucide-react"
import { SportTierSystem } from "@/lib/tiers/types"
import { getSkillStatus, getSkillStatusColor } from "@/lib/dashboard-utils"

interface SkillsTierAccordionProps {
  tierSystem: SportTierSystem
  currentTier: number
  attendancePercentage: number
  studentId: string
  studentColor: { primary: string; light: string; dark: string }
}

export default function SkillsTierAccordion({
  tierSystem,
  currentTier,
  attendancePercentage,
  studentId,
  studentColor
}: SkillsTierAccordionProps) {
  // Expand current tier by default
  const [expandedTier, setExpandedTier] = useState<number>(currentTier)

  const getTierStatus = (tierNumber: number): 'completed' | 'current' | 'locked' => {
    if (tierNumber < currentTier) return 'completed'
    if (tierNumber === currentTier) return 'current'
    return 'locked'
  }

  const handleTierClick = (tierNumber: number) => {
    setExpandedTier(expandedTier === tierNumber ? 0 : tierNumber)
  }

  // Get developing skills for This Week's Focus (only for current tier)
  const getDevelopingSkills = (tierNumber: number) => {
    const tier = tierSystem.tiers.find(t => t.tierNumber === tierNumber)
    if (!tier || tierNumber !== currentTier) return []
    
    return tier.skills.filter(skill => {
      const status = getSkillStatus(tierNumber, currentTier, attendancePercentage)
      return status === "Developing"
    })
  }

  return (
    <div className="space-y-2 sm:space-y-3">
      {tierSystem.tiers.map((tier) => {
        const status = getTierStatus(tier.tierNumber)
        const isExpanded = expandedTier === tier.tierNumber
        const isCurrent = tier.tierNumber === currentTier
        const developingSkills = getDevelopingSkills(tier.tierNumber)

        return (
          <div
            key={tier.tierNumber}
            className={`
              border-2 rounded-xl overflow-hidden transition-all duration-200
              ${isCurrent ? 'ring-2 ring-offset-2' : ''}
              ${status === 'locked' ? 'opacity-60' : ''}
            `}
            style={
              isCurrent 
                ? { borderColor: studentColor.primary, ringColor: studentColor.light }
                : { borderColor: '#E5E7EB' }
            }
          >
            {/* Tier Header - Clickable */}
            <button
              onClick={() => handleTierClick(tier.tierNumber)}
              className="w-full p-3 sm:p-4 flex items-center gap-3 sm:gap-4 hover:bg-gray-50 transition-colors"
              disabled={status === 'locked'}
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
              <div className="flex-1 text-left min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-base sm:text-lg font-bold text-gray-900">
                    Tier {tier.tierNumber}
                  </h3>
                  {isCurrent && (
                    <span 
                      className="px-2 py-0.5 rounded-full text-xs font-semibold text-white"
                      style={{ backgroundColor: studentColor.primary }}
                    >
                      CURRENT LEVEL ⭐
                    </span>
                  )}
                  {status === 'completed' && (
                    <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-800">
                      Complete
                    </span>
                  )}
                  {status === 'locked' && (
                    <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-600">
                      Locked
                    </span>
                  )}
                </div>
                <p className="text-xs sm:text-sm text-gray-600 mt-0.5">
                  {tier.skills.length} {tier.skills.length === 1 ? 'skill' : 'skills'}
                </p>
              </div>

              {/* Expand Icon */}
              {status !== 'locked' && (
                <ChevronDown 
                  className={`h-5 w-5 text-gray-400 transition-transform flex-shrink-0 ${
                    isExpanded ? 'transform rotate-180' : ''
                  }`}
                />
              )}
            </button>

            {/* Expanded Content */}
            {isExpanded && status !== 'locked' && (
              <div 
                className="border-t border-gray-200 animate-in slide-in-from-top duration-200"
                style={{ backgroundColor: `${studentColor.light}10` }}
              >
                <div className="p-3 sm:p-4 space-y-4">
                  {/* This Week's Focus - Only for Current Tier */}
                  {isCurrent && developingSkills.length > 0 && (
                    <div 
                      className="rounded-lg border-2 overflow-hidden"
                      style={{ 
                        borderColor: studentColor.primary,
                        backgroundColor: `${studentColor.light}30`
                      }}
                    >
                      {/* Header */}
                      <div 
                        className="px-3 py-2.5 sm:px-4 sm:py-3 flex items-center gap-2"
                        style={{ backgroundColor: studentColor.primary }}
                      >
                        <Target className="h-4 w-4 sm:h-5 sm:w-5 text-white flex-shrink-0" />
                        <h4 className="text-sm sm:text-base font-bold text-white">
                          📍 Current Focus
                        </h4>
                      </div>

                      {/* Content */}
                      <div className="p-3 sm:p-4">
                        <p className="text-xs sm:text-sm text-gray-700 mb-2 sm:mb-3">
                          Skills in development for this tier:
                        </p>
                        <ul className="space-y-2">
                          {developingSkills.map((skill) => (
                            <li 
                              key={skill.id} 
                              className="flex items-start gap-2 sm:gap-2.5 p-2 sm:p-2.5 bg-white rounded-lg border border-gray-200"
                            >
                              <div 
                                className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                                style={{ backgroundColor: studentColor.primary }}
                              >
                                <div className="w-2 h-2 rounded-full bg-white"></div>
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="text-sm font-medium text-gray-900">
                                  {skill.name}
                                </div>
                                {skill.description && (
                                  <div className="text-xs text-gray-600 mt-0.5">
                                    {skill.description}
                                  </div>
                                )}
                              </div>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}

                  {/* All Skills in this Tier */}
                  <div>
                    <h4 className="text-sm font-bold text-gray-700 mb-2 flex items-center">
                      <span className="mr-2">All Tier {tier.tierNumber} Skills:</span>
                    </h4>
                    
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
                              {skillStatus === "Consistent" && <Check className="h-3.5 w-3.5" />}
                              {skillStatus === "Developing" && <Clock className="h-3.5 w-3.5" />}
                              {skillStatus === "Not Started" && <Circle className="h-3.5 w-3.5" />}
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
                              {skillStatus === "Consistent" && <Check className="h-4 w-4" />}
                              {skillStatus === "Developing" && <Clock className="h-4 w-4" />}
                              {skillStatus === "Not Started" && <Circle className="h-4 w-4" />}
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
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
