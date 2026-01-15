"use client"

import { ChevronDown, Check, Lock } from "lucide-react"
import { Tier } from "@/lib/tiers"
import { getStudentColorById } from "@/lib/dashboard-utils"
import SkillsList from "./skills-list"

interface TierNavigatorProps {
  tiers: Tier[]
  currentTier: number
  selectedTier: number | null
  onSelectTier: (tierNumber: number) => void
  attendancePercentage: number
  studentId: string
}

export default function TierNavigator({
  tiers,
  currentTier,
  selectedTier,
  onSelectTier,
  attendancePercentage,
  studentId
}: TierNavigatorProps) {
  const studentColor = getStudentColorById(studentId)

  const getTierStatus = (tierNumber: number): 'completed' | 'current' | 'locked' => {
    if (tierNumber < currentTier) return 'completed'
    if (tierNumber === currentTier) return 'current'
    return 'locked'
  }

  return (
    <div className="space-y-2 sm:space-y-3">
      {tiers.map((tier) => {
        const status = getTierStatus(tier.tierNumber)
        const isExpanded = selectedTier === tier.tierNumber
        const isCurrent = tier.tierNumber === currentTier

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
              onClick={() => onSelectTier(tier.tierNumber)}
              className="w-full p-3 sm:p-4 flex items-center gap-3 sm:gap-4 hover:bg-gray-50 transition-colors"
            >
              {/* Status Icon */}
              <div 
                className="w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center flex-shrink-0"
                style={{
                  backgroundColor: status === 'completed' 
                    ? '#10B981' 
                    : status === 'current' 
                    ? studentColor.primary 
                    : '#D1D5DB'
                }}
              >
                {status === 'completed' && <Check className="h-4 w-4 sm:h-5 sm:w-5 text-white" />}
                {status === 'current' && (
                  <span className="text-white font-bold text-sm sm:text-base">
                    {tier.tierNumber}
                  </span>
                )}
                {status === 'locked' && <Lock className="h-4 w-4 sm:h-5 sm:w-5 text-white" />}
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
                      Current Level
                    </span>
                  )}
                </div>
                <p className="text-xs sm:text-sm text-gray-600 mt-0.5">
                  {tier.skills.length} {tier.skills.length === 1 ? 'skill' : 'skills'}
                </p>
              </div>

              {/* Expand Icon */}
              <ChevronDown 
                className={`h-5 w-5 text-gray-400 transition-transform flex-shrink-0 ${
                  isExpanded ? 'transform rotate-180' : ''
                }`}
              />
            </button>

            {/* Skills List - Expandable */}
            {isExpanded && (
              <div 
                className="border-t border-gray-200 animate-in slide-in-from-top duration-200"
                style={{ backgroundColor: `${studentColor.light}10` }}
              >
                <SkillsList
                  skills={tier.skills}
                  tierNumber={tier.tierNumber}
                  currentTier={currentTier}
                  attendancePercentage={attendancePercentage}
                />
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
