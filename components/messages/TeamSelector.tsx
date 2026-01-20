'use client'

interface TeamWithCoach {
  teamid: string
  teamname: string
  coachid: string
  coachname: string
}

interface TeamSelectorProps {
  teams: TeamWithCoach[]
  selected: TeamWithCoach | null
  onChange: (team: TeamWithCoach) => void
  getUnreadCount?: (teamId: string, coachId: string) => number
}

export default function TeamSelector({ 
  teams, 
  selected, 
  onChange,
  getUnreadCount 
}: TeamSelectorProps) {
  if (!teams.length) {
    return (
      <div className="text-sm text-gray-500 p-4 bg-gray-50 rounded-md">
        No teams available
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-gray-700">
        Select a team to message the coach:
      </label>
      <select
        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0085B7] focus:border-transparent"
        value={selected?.teamid || ''}
        onChange={(e) => {
          const team = teams.find((t) => t.teamid === e.target.value)
          if (team) onChange(team)
        }}
      >
        {teams.map((team) => {
          const unreadCount = getUnreadCount ? getUnreadCount(team.teamid, team.coachid) : 0
          return (
            <option key={`${team.teamid}-${team.coachid}`} value={team.teamid}>
              {team.teamname} - Coach: {team.coachname}
              {unreadCount > 0 ? ` (${unreadCount})` : ''}
            </option>
          )
        })}
      </select>
    </div>
  )
}
