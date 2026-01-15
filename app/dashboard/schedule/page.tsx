"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Calendar, Clock, MapPin, User, ChevronLeft, ChevronRight, LayoutGrid, List, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import CalendarView from "@/components/calendar-view"
import { 
  getStudentColorById, 
  formatTimeRange, 
  getRelativeDateLabel,
  formatDate,
  groupEventsByDate,
  sortDates,
  getSportEmoji,
  getCountdownText,
  getEventsForDate
} from "@/lib/dashboard-utils"

interface ScheduleEvent {
  id: string
  sessionId: string
  studentId: string
  studentName: string
  teamId: string
  teamName: string
  sport?: string
  schoolName: string
  location: string
  date: string
  dayOfWeek: string
  startTime: string
  endTime: string
  coach: {
    name: string
    email: string
    phone: string
  }
  isPast: boolean
}

interface Student {
  id: string
  name: string
}

type ViewMode = "calendar" | "list"

export default function SchedulePage() {
  const [events, setEvents] = useState<ScheduleEvent[]>([])
  const [filteredEvents, setFilteredEvents] = useState<ScheduleEvent[]>([])
  const [students, setStudents] = useState<Student[]>([])
  const [selectedStudent, setSelectedStudent] = useState<string>("all")
  const [showUpcomingOnly, setShowUpcomingOnly] = useState(true)
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<ViewMode>("calendar")
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    fetchSchedule()
  }, [currentMonth])

  useEffect(() => {
    filterEvents()
  }, [events, selectedStudent, showUpcomingOnly])

  const fetchSchedule = async () => {
    setLoading(true)
    try {
      const monthStr = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}`
      const response = await fetch(`/api/schedule?month=${monthStr}`)
      
      if (!response.ok) {
        if (response.status === 401) {
          router.push("/dashboard/login")
          return
        }
        throw new Error("Failed to fetch schedule")
      }

      const data = await response.json()
      setEvents(data.events || [])

      // Extract unique students
      const uniqueStudents = Array.from(
        new Map(
          (data.events || []).map((e: ScheduleEvent) => [e.studentId, { id: e.studentId, name: e.studentName }])
        ).values()
      )
      setStudents(uniqueStudents as Student[])

    } catch (error) {
      console.error("Error fetching schedule:", error)
    } finally {
      setLoading(false)
    }
  }

  const filterEvents = () => {
    let filtered = events

    // Filter by student
    if (selectedStudent !== "all") {
      filtered = filtered.filter(e => e.studentId === selectedStudent)
    }

    // Filter by upcoming only
    if (showUpcomingOnly) {
      filtered = filtered.filter(e => !e.isPast)
    }

    setFilteredEvents(filtered)
  }

  const previousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))
    setSelectedDate(null)
  }

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))
    setSelectedDate(null)
  }

  const handleDateClick = (date: string) => {
    setSelectedDate(selectedDate === date ? null : date)
  }

  // Get events for selected date
  const selectedDateEvents = selectedDate ? getEventsForDate(selectedDate, filteredEvents) : []

  // Group events by date for list view
  const groupedByDate = groupEventsByDate(filteredEvents)
  const sortedDates = sortDates(Array.from(groupedByDate.keys()))

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0085B7] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading schedule...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2">Practice Schedule</h1>
        <p className="text-sm sm:text-base md:text-lg text-gray-600">
          {filteredEvents.length} {filteredEvents.length === 1 ? 'practice' : 'practices'} in{' '}
          {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
        </p>
      </div>

      {/* Controls */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6 mb-6">
        {/* View Mode Toggle & Month Navigator */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
          {/* View Mode Toggle */}
          <div className="flex gap-1.5 sm:gap-2">
            <button
              onClick={() => {
                setViewMode("calendar")
                setSelectedDate(null)
              }}
              className={`flex items-center gap-1.5 sm:gap-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                viewMode === "calendar"
                  ? 'bg-[#0085B7] text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <LayoutGrid className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span className="hidden xs:inline">Calendar</span>
              <span className="xs:hidden">Cal</span>
            </button>
            <button
              onClick={() => {
                setViewMode("list")
                setSelectedDate(null)
              }}
              className={`flex items-center gap-1.5 sm:gap-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                viewMode === "list"
                  ? 'bg-[#0085B7] text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <List className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span>List</span>
            </button>
          </div>

          {/* Month Navigator */}
          <div className="flex items-center gap-2 sm:gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={previousMonth}
              className="px-2 py-2 sm:px-3 sm:py-2"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <h2 className="text-sm sm:text-base md:text-lg font-bold text-gray-900 min-w-[120px] sm:min-w-[160px] md:min-w-[180px] text-center">
              {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </h2>
            <Button
              variant="outline"
              size="sm"
              onClick={nextMonth}
              className="px-2 py-2 sm:px-3 sm:py-2"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className="space-y-3 border-t border-gray-200 pt-3 md:pt-4">
          {/* Student Filter - Toggle Buttons */}
          {students.length > 1 && (
            <div>
              <p className="text-xs sm:text-sm font-medium text-gray-700 mb-2">Filter by player:</p>
              <div className="flex flex-wrap gap-1.5 sm:gap-2">
                <button
                  onClick={() => setSelectedStudent("all")}
                  className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                    selectedStudent === "all"
                      ? 'bg-[#0085B7] text-white shadow-md'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  All Players
                </button>
                {students.map((student) => {
                  const color = getStudentColorById(student.id)
                  const isSelected = selectedStudent === student.id
                  return (
                    <button
                      key={student.id}
                      onClick={() => setSelectedStudent(student.id)}
                      className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                        isSelected
                          ? 'text-white shadow-md'
                          : 'text-gray-700 hover:opacity-80'
                      }`}
                      style={{
                        backgroundColor: isSelected ? color.primary : color.light,
                      }}
                    >
                      {student.name}
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* Upcoming Only Toggle */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowUpcomingOnly(!showUpcomingOnly)}
              className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                showUpcomingOnly
                  ? 'bg-green-100 text-green-800'
                  : 'bg-gray-100 text-gray-700'
              }`}
            >
              {showUpcomingOnly ? '✓ Upcoming only' : 'Show all'}
            </button>
          </div>
        </div>
      </div>

      {/* Calendar or List View */}
      {filteredEvents.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">No practices scheduled</h2>
          <p className="text-gray-600">
            No {showUpcomingOnly && 'upcoming '}practices for{' '}
            {currentMonth.toLocaleDateString('en-US', { month: 'long' })}.
          </p>
        </div>
      ) : (
        <>
          {/* Calendar View */}
          {viewMode === "calendar" && (
            <div className="space-y-6">
              <CalendarView
                events={filteredEvents}
                currentMonth={currentMonth}
                onDateClick={handleDateClick}
                selectedDate={selectedDate}
                students={students}
              />

              {/* Selected Date Details - Mobile Modal */}
              {selectedDate && selectedDateEvents.length > 0 && (
                <>
                  {/* Mobile Modal Overlay */}
                  <div 
                    className="sm:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-50 animate-in fade-in duration-200"
                    onClick={() => setSelectedDate(null)}
                  />
                  
                  {/* Mobile Modal Container */}
                  <div 
                    className="sm:hidden fixed bottom-0 inset-x-0 z-50 max-h-[70vh] bg-white rounded-t-2xl shadow-2xl animate-in slide-in-from-bottom duration-300"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {/* Modal Header */}
                    <div className="sticky top-0 px-4 py-3 bg-gradient-to-r from-[#0085B7] to-[#006B94] rounded-t-2xl flex items-center justify-between border-b-2 border-white/20">
                      <h3 className="text-base font-bold text-white">
                        {formatDate(selectedDate, 'full')}
                      </h3>
                      <button
                        onClick={() => setSelectedDate(null)}
                        className="p-1.5 hover:bg-white/20 rounded-lg transition-colors flex-shrink-0"
                      >
                        <X className="h-5 w-5 text-white" />
                      </button>
                    </div>

                    {/* Modal Content - Scrollable */}
                    <div className="overflow-y-auto max-h-[calc(70vh-60px)] p-3 space-y-2">
                      {selectedDateEvents.map(event => {
                        const studentColor = getStudentColorById(event.studentId)
                        const sportEmoji = getSportEmoji(event.sport)

                        return (
                          <div
                            key={event.id}
                            className="border-2 rounded-xl p-2.5 bg-white"
                            style={{ borderColor: `${studentColor.primary}30`, backgroundColor: `${studentColor.light}20` }}
                          >
                            <div className="flex gap-2">
                              <div className="text-lg flex-shrink-0">{sportEmoji}</div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-1.5 mb-1.5">
                                  <span
                                    className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold"
                                    style={{
                                      backgroundColor: studentColor.light,
                                      color: studentColor.dark,
                                    }}
                                  >
                                    {event.studentName}
                                  </span>
                                </div>
                                <h4 className="text-sm font-bold text-gray-900 mb-2">{event.teamName}</h4>
                                <div className="space-y-1.5 text-xs">
                                  <div className="flex items-center text-gray-700">
                                    <Clock className="h-3 w-3 mr-1.5 text-[#0085B7] flex-shrink-0" />
                                    <span className="font-medium">{formatTimeRange(event.startTime, event.endTime)}</span>
                                  </div>
                                  <div className="flex items-center text-gray-700">
                                    <MapPin className="h-3 w-3 mr-1.5 text-[#0085B7] flex-shrink-0" />
                                    <span className="truncate">{event.schoolName}</span>
                                  </div>
                                  <div className="flex items-center text-gray-600">
                                    <User className="h-3 w-3 mr-1.5 text-gray-400 flex-shrink-0" />
                                    <span>Coach: {event.coach.name}</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>

                  {/* Desktop Card - Same as before */}
                  <div className="hidden sm:block bg-white rounded-xl shadow-sm border-2 border-[#0085B7] overflow-hidden animate-in slide-in-from-top">
                    <div className="px-3 py-2.5 sm:px-4 sm:py-3 md:px-6 md:py-4 bg-gradient-to-r from-[#0085B7] to-[#006B94] flex items-center justify-between">
                      <h3 className="text-base sm:text-lg md:text-xl font-bold text-white">
                        {formatDate(selectedDate, 'full')}
                      </h3>
                      <button
                        onClick={() => setSelectedDate(null)}
                        className="p-1 hover:bg-white/20 rounded-lg transition-colors flex-shrink-0"
                      >
                        <X className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                      </button>
                    </div>
                    <div className="p-2.5 sm:p-3 md:p-4 space-y-2.5 sm:space-y-3 md:space-y-4">
                      {selectedDateEvents.map(event => {
                        const studentColor = getStudentColorById(event.studentId)
                        const sportEmoji = getSportEmoji(event.sport)

                        return (
                          <div
                            key={event.id}
                            className="border-2 rounded-xl p-2.5 sm:p-3 md:p-4"
                            style={{ borderColor: `${studentColor.primary}30`, backgroundColor: `${studentColor.light}20` }}
                          >
                            <div className="flex gap-2 sm:gap-2.5 md:gap-3">
                              <div className="text-xl sm:text-2xl md:text-3xl flex-shrink-0">{sportEmoji}</div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-1.5 sm:gap-2 mb-1.5 sm:mb-2">
                                  <span
                                    className="inline-flex items-center px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full text-xs sm:text-sm font-semibold"
                                    style={{
                                      backgroundColor: studentColor.light,
                                      color: studentColor.dark,
                                    }}
                                  >
                                    {event.studentName}
                                  </span>
                                </div>
                                <h4 className="text-base sm:text-lg font-bold text-gray-900 mb-2 sm:mb-2.5 md:mb-3">{event.teamName}</h4>
                                <div className="space-y-1.5 sm:space-y-0 sm:grid sm:grid-cols-2 sm:gap-2 text-xs sm:text-sm">
                                  <div className="flex items-center text-gray-700">
                                    <Clock className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2 text-[#0085B7] flex-shrink-0" />
                                    <span className="font-medium">{formatTimeRange(event.startTime, event.endTime)}</span>
                                  </div>
                                  <div className="flex items-center text-gray-700">
                                    <MapPin className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2 text-[#0085B7] flex-shrink-0" />
                                    <span className="truncate">{event.schoolName}</span>
                                  </div>
                                  <div className="flex items-center text-gray-600 sm:col-span-2">
                                    <User className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2 text-gray-400 flex-shrink-0" />
                                    <span>Coach: {event.coach.name}</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {/* List View */}
          {viewMode === "list" && (
            <div className="space-y-4">
              {sortedDates.map(date => {
                const dayEvents = groupedByDate.get(date) || []
                const dateLabel = getRelativeDateLabel(date)
                const dateDisplay = formatDate(date, 'long')

                return (
                  <div key={date} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="px-4 sm:px-6 py-3 bg-gradient-to-r from-gray-50 to-white border-b border-gray-200">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-sm font-bold text-[#0085B7]">{dateLabel}</span>
                          <span className="text-sm text-gray-600 ml-2">• {dateDisplay}</span>
                        </div>
                        <span className="text-xs font-medium px-2 py-1 bg-gray-100 text-gray-600 rounded-full">
                          {dayEvents.length} {dayEvents.length === 1 ? 'practice' : 'practices'}
                        </span>
                      </div>
                    </div>
                    <div className="divide-y divide-gray-100">
                      {dayEvents.map(event => {
                        const studentColor = getStudentColorById(event.studentId)
                        const sportEmoji = getSportEmoji(event.sport)
                        const countdown = getCountdownText(event.date, event.startTime)

                        return (
                          <div
                            key={event.id}
                            className={`px-3 sm:px-4 md:px-6 py-3 sm:py-4 hover:bg-gray-50 transition-colors ${
                              event.isPast ? 'opacity-50' : ''
                            }`}
                          >
                            <div className="flex gap-2 sm:gap-3 md:gap-4">
                              <div 
                                className="w-1 rounded-full flex-shrink-0"
                                style={{ backgroundColor: studentColor.primary }}
                              ></div>
                              <div className="flex-1 min-w-0">
                                <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mb-1.5 sm:mb-2">
                                  <span
                                    className="inline-flex items-center px-2 py-0.5 sm:px-3 sm:py-1 rounded-full text-xs sm:text-sm font-semibold"
                                    style={{
                                      backgroundColor: studentColor.light,
                                      color: studentColor.dark,
                                    }}
                                  >
                                    {event.studentName}
                                  </span>
                                  {!event.isPast && (
                                    <span className="text-[10px] sm:text-xs font-medium text-gray-500">
                                      {countdown}
                                    </span>
                                  )}
                                  {event.isPast && (
                                    <span className="text-[10px] sm:text-xs font-medium px-1.5 py-0.5 sm:px-2 sm:py-1 bg-gray-200 text-gray-600 rounded-full">
                                      Past
                                    </span>
                                  )}
                                </div>
                                <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-2 sm:mb-3 flex items-center gap-2">
                                  <span className="text-lg sm:text-xl md:text-2xl">{sportEmoji}</span>
                                  {event.teamName}
                                </h3>
                                <div className="space-y-1.5 sm:space-y-0 sm:grid sm:grid-cols-2 sm:gap-3 text-xs sm:text-sm">
                                  <div className="flex items-center text-gray-700">
                                    <Clock className="h-4 w-4 sm:h-5 sm:w-5 mr-1.5 sm:mr-2 flex-shrink-0 text-[#0085B7]" />
                                    <span className="font-semibold">{formatTimeRange(event.startTime, event.endTime)}</span>
                                  </div>
                                  <div className="flex items-center text-gray-700">
                                    <MapPin className="h-4 w-4 sm:h-5 sm:w-5 mr-1.5 sm:mr-2 flex-shrink-0 text-[#0085B7]" />
                                    <span className="truncate">{event.schoolName}</span>
                                  </div>
                                  <div className="flex items-center text-gray-600 sm:col-span-2">
                                    <User className="h-4 w-4 sm:h-5 sm:w-5 mr-1.5 sm:mr-2 flex-shrink-0 text-gray-400" />
                                    <span>Coach: {event.coach.name}</span>
                                  </div>
                                </div>
                                {!event.isPast && (
                                  <div className="mt-2 sm:mt-3">
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      disabled
                                      className="text-[10px] sm:text-xs h-7 sm:h-8"
                                      title="Coming soon"
                                    >
                                      Report Absence
                                    </Button>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </>
      )}
    </div>
  )
}
