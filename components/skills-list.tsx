"use client"

import { TierSkill } from "@/lib/tiers"
import { getSkillStatus, getSkillStatusColor } from "@/lib/dashboard-utils"

interface SkillsListProps {
  skills: TierSkill[]
  tierNumber: number
  currentTier: number
  attendancePercentage: number
}

export default function SkillsList({
  skills,
  tierNumber,
  currentTier,
  attendancePercentage
}: SkillsListProps) {
  return (
    <div className="p-3 sm:p-4">
      {/* Mobile: Single Column */}
      <div className="sm:hidden space-y-2">
        {skills.map((skill) => {
          const status = getSkillStatus(tierNumber, currentTier, attendancePercentage)
          const colors = getSkillStatusColor(status)

          return (
            <div
              key={skill.id}
              className="flex items-center justify-between gap-2 p-2.5 bg-white rounded-lg border border-gray-200"
            >
              <span className="text-sm text-gray-900 flex-1">{skill.name}</span>
              <span
                className={`px-2 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${colors.bg} ${colors.text}`}
              >
                {status}
              </span>
            </div>
          )
        })}
      </div>

      {/* Desktop: Two Columns */}
      <div className="hidden sm:grid sm:grid-cols-2 gap-3">
        {skills.map((skill) => {
          const status = getSkillStatus(tierNumber, currentTier, attendancePercentage)
          const colors = getSkillStatusColor(status)

          return (
            <div
              key={skill.id}
              className="flex items-center justify-between gap-3 p-3 bg-white rounded-lg border border-gray-200 hover:border-gray-300 transition-colors"
            >
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-gray-900">{skill.name}</div>
                {skill.description && (
                  <div className="text-xs text-gray-500 mt-0.5">{skill.description}</div>
                )}
              </div>
              <span
                className={`px-2.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${colors.bg} ${colors.text} flex-shrink-0`}
              >
                {status}
              </span>
            </div>
          )
        })}
      </div>

      {/* Skills Summary */}
      <div className="mt-3 pt-3 border-t border-gray-200">
        <div className="flex items-center justify-between text-xs text-gray-600">
          <span>Total Skills: {skills.length}</span>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-gray-400"></div>
              <span>Not Started</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-yellow-400"></div>
              <span>Developing</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-green-500"></div>
              <span>Consistent</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
