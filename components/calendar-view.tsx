"use client"

import { 
  getDaysInMonth, 
  formatDateForComparison, 
  isSameDay, 
  getEventsForDate,
  getStudentColorById,
  hasEvents
} from "@/lib/dashboard-utils"

interface ScheduleEvent {
  id: string
  studentId: string
  studentName: string
  teamName: string
  sport?: string
  date: string
  startTime: string
  endTime: string
  isPast: boolean
}

interface Student {
  id: string
  name: string
}

interface CalendarViewProps {
  events: ScheduleEvent[]
  currentMonth: Date
  onDateClick: (date: string) => void
  selectedDate: string | null
  students: Student[]
}

export default function CalendarView({ 
  events, 
  currentMonth, 
  onDateClick, 
  selectedDate,
  students 
}: CalendarViewProps) {
  const today = new Date()
  const year = currentMonth.getFullYear()
  const month = currentMonth.getMonth()
  
  const days = getDaysInMonth(year, month)
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  const dayNamesShort = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']

  const isCurrentMonth = (date: Date) => date.getMonth() === month
  const isToday = (date: Date) => isSameDay(date, today)
  const isSelected = (date: Date) => selectedDate === formatDateForComparison(date)

  const getDateEvents = (date: Date) => {
    const dateStr = formatDateForComparison(date)
    return getEventsForDate(dateStr, events)
  }

  const hasDateEvents = (date: Date) => {
    const dateStr = formatDateForComparison(date)
    return hasEvents(dateStr, events)
  }

  const handleDayClick = (date: Date) => {
    if (!isCurrentMonth(date)) return
    const dateStr = formatDateForComparison(date)
    onDateClick(dateStr)
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      {/* Day Names Header */}
      <div className="grid grid-cols-7 bg-[#0085B7]">
        {/* Desktop day names */}
        {dayNames.map((day, index) => (
          <div
            key={`desktop-${index}`}
            className="hidden sm:block text-center py-3 text-white font-bold text-sm border-r border-[#006B94] last:border-r-0"
          >
            {day}
          </div>
        ))}
        {/* Mobile day names */}
        {dayNamesShort.map((day, index) => (
          <div
            key={`mobile-${index}`}
            className="sm:hidden text-center py-3 text-white font-bold text-xs border-r border-[#006B94] last:border-r-0"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7">
        {days.map((date, index) => {
          const dateEvents = getDateEvents(date)
          const hasPractices = hasDateEvents(date)
          const inCurrentMonth = isCurrentMonth(date)
          const todayDate = isToday(date)
          const selected = isSelected(date)
          
          // Get unique student IDs for this date's events
          const uniqueStudentIds = [...new Set(dateEvents.map(e => e.studentId))]
          const displayDots = uniqueStudentIds.slice(0, 3)
          const moreDots = uniqueStudentIds.length > 3 ? uniqueStudentIds.length - 3 : 0

          return (
            <div
              key={index}
              onClick={() => handleDayClick(date)}
              className={`
                relative min-h-[52px] sm:min-h-[70px] md:min-h-[85px] lg:min-h-[100px] p-1.5 sm:p-2 border-b border-r border-gray-200
                ${index % 7 === 6 ? 'border-r-0' : ''}
                ${index >= 35 ? 'border-b-0' : ''}
                ${inCurrentMonth ? 'bg-white hover:bg-gray-50 cursor-pointer active:bg-blue-50' : 'bg-gray-50 opacity-40 cursor-not-allowed'}
                ${todayDate ? 'border-2 !border-[#0085B7] bg-blue-50' : ''}
                ${selected ? 'ring-2 ring-[#0085B7] ring-inset bg-blue-50' : ''}
                transition-all duration-150
              `}
            >
              {/* Day Number */}
              <div className={`
                text-base sm:text-base md:text-lg font-semibold mb-0.5 leading-none
                ${!inCurrentMonth ? 'text-gray-400' : 'text-gray-900'}
                ${todayDate ? 'text-[#0085B7]' : ''}
                ${hasPractices && inCurrentMonth ? 'font-bold' : ''}
              `}>
                {date.getDate()}
              </div>

              {/* Today Badge */}
              {todayDate && inCurrentMonth && (
                <div className="absolute top-0.5 right-0.5 sm:top-1 sm:right-1 px-1 py-0.5 sm:px-1.5 sm:py-0.5 bg-[#0085B7] text-white text-[8px] sm:text-[10px] font-bold rounded">
                  TODAY
                </div>
              )}

              {/* Event Indicators */}
              {inCurrentMonth && hasPractices && (
                <>
                  {/* Mobile: Color bar indicator */}
                  <div className="sm:hidden absolute bottom-1 left-1 right-1 h-1 rounded-full overflow-hidden flex gap-0.5">
                    {displayDots.map((studentId, idx) => {
                      const color = getStudentColorById(studentId)
                      return (
                        <div
                          key={idx}
                          className="flex-1 h-full"
                          style={{ backgroundColor: color.primary }}
                          title={students.find(s => s.id === studentId)?.name || 'Student'}
                        />
                      )
                    })}
                  </div>
                  
                  {/* Desktop: Dots indicator */}
                  <div className="hidden sm:flex absolute bottom-1 left-0 right-0 items-center justify-center gap-1 px-1">
                    {displayDots.map((studentId, idx) => {
                      const color = getStudentColorById(studentId)
                      return (
                        <div
                          key={idx}
                          className="w-2 h-2 md:w-2.5 md:h-2.5 rounded-full flex-shrink-0"
                          style={{ backgroundColor: color.primary }}
                          title={students.find(s => s.id === studentId)?.name || 'Student'}
                        />
                      )
                    })}
                    {moreDots > 0 && (
                      <span className="text-[10px] font-bold text-gray-700">
                        +{moreDots}
                      </span>
                    )}
                  </div>
                </>
              )}

              {/* Hover Tooltip - Desktop only */}
              {inCurrentMonth && hasPractices && (
                <div className="hidden lg:block absolute left-0 top-full mt-1 z-10 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity">
                  <div className="bg-gray-900 text-white text-xs rounded px-2 py-1 shadow-lg whitespace-nowrap">
                    {dateEvents.length} {dateEvents.length === 1 ? 'practice' : 'practices'}
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
