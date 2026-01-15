// Dashboard Utility Functions

/**
 * Student color palette - consistent across dashboard
 */
export const STUDENT_COLORS = [
  { primary: '#0085B7', light: '#E6F4F9', dark: '#006B94' }, // Blue (Discipline Rift)
  { primary: '#10B981', light: '#D1FAE5', dark: '#059669' }, // Green
  { primary: '#8B5CF6', light: '#EDE9FE', dark: '#7C3AED' }, // Purple
  { primary: '#F59E0B', light: '#FEF3C7', dark: '#D97706' }, // Orange
  { primary: '#EF4444', light: '#FEE2E2', dark: '#DC2626' }, // Red
]

/**
 * Get color for a student by index
 */
export function getStudentColor(index: number) {
  return STUDENT_COLORS[index % STUDENT_COLORS.length]
}

/**
 * Get color for a student by ID (consistent hashing)
 */
export function getStudentColorById(studentId: string) {
  // Simple hash function for consistent colors
  let hash = 0
  for (let i = 0; i < studentId.length; i++) {
    hash = studentId.charCodeAt(i) + ((hash << 5) - hash)
  }
  const index = Math.abs(hash) % STUDENT_COLORS.length
  return STUDENT_COLORS[index]
}

/**
 * Get initials from a name
 */
export function getInitials(firstName: string, lastName: string): string {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
}

/**
 * Format date for display
 */
export function formatDate(dateStr: string, format: 'short' | 'long' | 'full' = 'short'): string {
  const date = new Date(dateStr)
  
  switch (format) {
    case 'short':
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric'
      })
    case 'long':
      return date.toLocaleDateString('en-US', { 
        weekday: 'short',
        month: 'short', 
        day: 'numeric'
      })
    case 'full':
      return date.toLocaleDateString('en-US', { 
        weekday: 'long',
        month: 'long', 
        day: 'numeric',
        year: 'numeric'
      })
    default:
      return dateStr
  }
}

/**
 * Format time from HH:MM:SS to 12-hour format
 */
export function formatTime(timeStr: string): string {
  const [hours, minutes] = timeStr.split(':')
  const hour = parseInt(hours, 10)
  const ampm = hour >= 12 ? 'PM' : 'AM'
  const displayHour = hour % 12 || 12
  return `${displayHour}:${minutes} ${ampm}`
}

/**
 * Format time range
 */
export function formatTimeRange(startTime: string, endTime: string): string {
  return `${formatTime(startTime)} - ${formatTime(endTime)}`
}

/**
 * Check if a date is today
 */
export function isToday(dateStr: string): boolean {
  const date = new Date(dateStr)
  const today = new Date()
  return date.toDateString() === today.toDateString()
}

/**
 * Check if a date is tomorrow
 */
export function isTomorrow(dateStr: string): boolean {
  const date = new Date(dateStr)
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  return date.toDateString() === tomorrow.toDateString()
}

/**
 * Get relative date label (Today, Tomorrow, or day of week)
 */
export function getRelativeDateLabel(dateStr: string): string {
  if (isToday(dateStr)) return 'TODAY'
  if (isTomorrow(dateStr)) return 'TOMORROW'
  
  const date = new Date(dateStr)
  const today = new Date()
  const diffDays = Math.floor((date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
  
  if (diffDays >= 0 && diffDays <= 6) {
    return date.toLocaleDateString('en-US', { weekday: 'long' }).toUpperCase()
  }
  
  return date.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric' 
  }).toUpperCase()
}

/**
 * Get countdown text for upcoming event
 */
export function getCountdownText(dateStr: string, timeStr: string): string {
  const eventDate = new Date(`${dateStr}T${timeStr}`)
  const now = new Date()
  const diffMs = eventDate.getTime() - now.getTime()
  
  if (diffMs < 0) return 'Past'
  
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffDays = Math.floor(diffHours / 24)
  
  if (diffHours < 1) {
    const diffMinutes = Math.floor(diffMs / (1000 * 60))
    return `In ${diffMinutes}m`
  }
  
  if (diffHours < 24) {
    return `In ${diffHours}h`
  }
  
  if (diffDays === 1) return 'Tomorrow'
  if (diffDays < 7) return `In ${diffDays} days`
  
  return formatDate(dateStr, 'short')
}

/**
 * Calculate age from date of birth
 */
export function calculateAge(dob: string): number {
  const birthDate = new Date(dob)
  const today = new Date()
  let age = today.getFullYear() - birthDate.getFullYear()
  const monthDiff = today.getMonth() - birthDate.getMonth()
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--
  }
  return age
}

/**
 * Group events by date
 */
export function groupEventsByDate<T extends { date: string }>(events: T[]): Map<string, T[]> {
  const grouped = new Map<string, T[]>()
  
  events.forEach(event => {
    const existing = grouped.get(event.date) || []
    grouped.set(event.date, [...existing, event])
  })
  
  return grouped
}

/**
 * Sort dates chronologically
 */
export function sortDates(dates: string[]): string[] {
  return dates.sort((a, b) => new Date(a).getTime() - new Date(b).getTime())
}

/**
 * Get sport emoji by sport type from database
 */
export function getSportEmoji(sport?: string): string {
  if (!sport) return '🏅' // Default if no sport specified
  
  const sportLower = sport.toLowerCase()
  
  if (sportLower.includes('soccer') || sportLower.includes('football')) return '⚽'
  if (sportLower.includes('basketball')) return '🏀'
  if (sportLower.includes('volleyball')) return '🏐'
  if (sportLower.includes('baseball')) return '⚾'
  if (sportLower.includes('tennis')) return '🎾'
  if (sportLower.includes('pickleball')) return '🏓'
  if (sportLower.includes('swimming')) return '🏊'
  if (sportLower.includes('track')) return '🏃'
  if (sportLower.includes('wrestling')) return '🤼'
  if (sportLower.includes('cheer')) return '📣'
  if (sportLower.includes('flag')) return '🏈'
  
  return '🏅' // Default sports icon
}

/**
 * Truncate text with ellipsis
 */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength - 3) + '...'
}

/**
 * Get day of week from date string
 */
export function getDayOfWeek(dateStr: string): string {
  const date = new Date(dateStr)
  return date.toLocaleDateString('en-US', { weekday: 'short' })
}

/**
 * Get all days in a month (including padding from previous/next month)
 */
export function getDaysInMonth(year: number, month: number): Date[] {
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  const days: Date[] = []
  
  // Add padding days from previous month
  const firstDayOfWeek = firstDay.getDay() // 0 = Sunday
  const prevMonthLastDay = new Date(year, month, 0).getDate()
  
  for (let i = firstDayOfWeek - 1; i >= 0; i--) {
    days.push(new Date(year, month - 1, prevMonthLastDay - i))
  }
  
  // Add all days of current month
  for (let day = 1; day <= lastDay.getDate(); day++) {
    days.push(new Date(year, month, day))
  }
  
  // Add padding days from next month to complete the grid (6 rows x 7 days = 42)
  const remainingDays = 42 - days.length
  for (let day = 1; day <= remainingDays; day++) {
    days.push(new Date(year, month + 1, day))
  }
  
  return days
}

/**
 * Get first day of month (0-6, Sunday = 0)
 */
export function getFirstDayOfMonth(year: number, month: number): number {
  return new Date(year, month, 1).getDay()
}

/**
 * Check if date has events
 */
export function hasEvents<T extends { date: string }>(dateStr: string, events: T[]): boolean {
  return events.some(event => event.date === dateStr)
}

/**
 * Get events for specific date
 */
export function getEventsForDate<T extends { date: string }>(dateStr: string, events: T[]): T[] {
  return events.filter(event => event.date === dateStr)
}

/**
 * Check if two dates are the same day
 */
export function isSameDay(date1: Date, date2: Date): boolean {
  return date1.getFullYear() === date2.getFullYear() &&
         date1.getMonth() === date2.getMonth() &&
         date1.getDate() === date2.getDate()
}

/**
 * Format date as YYYY-MM-DD
 */
export function formatDateForComparison(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

// ============================================
// TIER SYSTEM & SKILLS TRACKING
// ============================================

import type { SkillStatus, TierSkill, SkillWithStatus } from './tiers'

/**
 * Calculate current tier based on attendance percentage
 * @param attendancePercentage - Percentage of practices attended (0-100)
 * @returns Tier number (1-6)
 */
export function calculateCurrentTier(attendancePercentage: number): number {
  if (attendancePercentage <= 20) return 1
  if (attendancePercentage <= 40) return 2
  if (attendancePercentage <= 60) return 3
  if (attendancePercentage <= 80) return 4
  if (attendancePercentage <= 95) return 5
  return 6
}

/**
 * Get skill status based on tier and attendance
 * @param skillTier - The tier this skill belongs to
 * @param currentTier - Student's current tier
 * @param attendancePercentage - Student's attendance percentage
 * @returns SkillStatus
 */
export function getSkillStatus(
  skillTier: number, 
  currentTier: number, 
  attendancePercentage: number
): SkillStatus {
  // Skills from future tiers haven't been started
  if (skillTier > currentTier) {
    return "Not Started"
  }
  
  // Skills from current tier are being developed
  if (skillTier === currentTier) {
    return "Developing"
  }
  
  // Skills from past tiers
  // If attendance is high, skill is consistent; otherwise still developing
  if (skillTier < currentTier) {
    return attendancePercentage >= 85 ? "Consistent" : "Developing"
  }
  
  return "Not Started"
}

/**
 * Get skills that are the focus for this week (current tier skills in Developing status)
 * @param currentTier - Student's current tier
 * @param allSkills - All skills with their status
 * @returns Array of skills marked as Developing
 */
export function getThisWeeksFocus(currentTier: number, allSkills: SkillWithStatus[]): SkillWithStatus[] {
  return allSkills.filter(skill => 
    skill.tierNumber === currentTier && skill.status === "Developing"
  )
}

/**
 * Get badge color for skill status
 * @param status - Skill status
 * @returns Tailwind color classes
 */
export function getSkillStatusColor(status: SkillStatus): { bg: string, text: string, border: string } {
  switch (status) {
    case "Consistent":
      return { 
        bg: "bg-green-100", 
        text: "text-green-800", 
        border: "border-green-300" 
      }
    case "Developing":
      return { 
        bg: "bg-yellow-100", 
        text: "text-yellow-800", 
        border: "border-yellow-300" 
      }
    case "Not Started":
      return { 
        bg: "bg-gray-100", 
        text: "text-gray-600", 
        border: "border-gray-300" 
      }
    default:
      return { 
        bg: "bg-gray-100", 
        text: "text-gray-600", 
        border: "border-gray-300" 
      }
  }
}

/**
 * Get icon for tier status (completed, current, locked)
 * @param tierNumber - The tier number
 * @param currentTier - Student's current tier
 * @returns Icon indicator
 */
export function getTierStatusIcon(tierNumber: number, currentTier: number): string {
  if (tierNumber < currentTier) return "✓" // Completed
  if (tierNumber === currentTier) return "●" // Current
  return "🔒" // Locked
}
