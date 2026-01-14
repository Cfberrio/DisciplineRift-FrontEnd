"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Calendar, Clock, MapPin, User, ChevronLeft, ChevronRight, Filter } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ScheduleEvent {
  id: string
  sessionId: string
  studentId: string
  studentName: string
  teamId: string
  teamName: string
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

export default function SchedulePage() {
  const [events, setEvents] = useState<ScheduleEvent[]>([])
  const [filteredEvents, setFilteredEvents] = useState<ScheduleEvent[]>([])
  const [students, setStudents] = useState<Student[]>([])
  const [selectedStudent, setSelectedStudent] = useState<string>("all")
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    fetchSchedule()
  }, [currentMonth])

  useEffect(() => {
    filterEvents()
  }, [events, selectedStudent])

  const fetchSchedule = async () => {
    setLoading(true)
    try {
      const monthStr = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}`
      const response = await fetch(`/api/schedule?month=${monthStr}`)
      
      if (!response.ok) {
        if (response.status === 401) {
          router.push("/register")
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
    if (selectedStudent === "all") {
      setFilteredEvents(events)
    } else {
      setFilteredEvents(events.filter(e => e.studentId === selectedStudent))
    }
  }

  const previousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))
  }

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-US', { 
      weekday: 'short',
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    })
  }

  const formatTime = (timeStr: string) => {
    return timeStr.slice(0, 5) // HH:MM
  }

  // Group events by week
  const groupByWeek = (events: ScheduleEvent[]) => {
    const weeks: { [key: string]: ScheduleEvent[] } = {}
    
    events.forEach(event => {
      const date = new Date(event.date)
      const weekStart = new Date(date)
      weekStart.setDate(date.getDate() - date.getDay()) // Start of week (Sunday)
      const weekKey = weekStart.toISOString().split('T')[0]
      
      if (!weeks[weekKey]) {
        weeks[weekKey] = []
      }
      weeks[weekKey].push(event)
    })

    return Object.entries(weeks).sort(([a], [b]) => a.localeCompare(b))
  }

  const groupedEvents = groupByWeek(filteredEvents)

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
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Practice Schedule</h1>
        <p className="mt-2 text-gray-600">View all upcoming practices and events.</p>
      </div>

      {/* Controls */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 mb-6">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          {/* Month Navigator */}
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={previousMonth}
              className="p-2"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="min-w-[180px] text-center">
              <h2 className="text-xl font-bold text-gray-900">
                {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </h2>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={nextMonth}
              className="p-2"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          {/* Student Filter */}
          {students.length > 1 && (
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Filter className="h-4 w-4 text-gray-600" />
              <select
                value={selectedStudent}
                onChange={(e) => setSelectedStudent(e.target.value)}
                className="flex-1 sm:flex-none px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#0085B7] focus:border-[#0085B7]"
              >
                <option value="all">All Players</option>
                {students.map(student => (
                  <option key={student.id} value={student.id}>
                    {student.name}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Events List */}
      {filteredEvents.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-12 text-center">
          <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">No Practices Scheduled</h2>
          <p className="text-gray-600">
            There are no practices scheduled for {currentMonth.toLocaleDateString('en-US', { month: 'long' })}.
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {groupedEvents.map(([weekStart, weekEvents]) => {
            const weekDate = new Date(weekStart)
            const weekEnd = new Date(weekDate)
            weekEnd.setDate(weekDate.getDate() + 6)

            return (
              <div key={weekStart} className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                  <h3 className="font-semibold text-gray-900">
                    Week of {weekDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - {weekEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </h3>
                </div>
                <div className="divide-y divide-gray-200">
                  {weekEvents.map(event => (
                    <div 
                      key={event.id} 
                      className={`px-6 py-4 hover:bg-gray-50 transition-colors ${event.isPast ? 'opacity-60' : ''}`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-start gap-3">
                            <div 
                              className="w-2 h-2 rounded-full mt-2 flex-shrink-0"
                              style={{ backgroundColor: '#0085B7' }}
                            ></div>
                            <div className="flex-1">
                              <h4 className="font-semibold text-gray-900">{event.studentName}</h4>
                              <p className="text-sm text-gray-600">{event.teamName}</p>
                              <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-gray-600">
                                <div className="flex items-center">
                                  <Calendar className="h-4 w-4 mr-2 flex-shrink-0" />
                                  {formatDate(event.date)}
                                </div>
                                <div className="flex items-center">
                                  <Clock className="h-4 w-4 mr-2 flex-shrink-0" />
                                  {formatTime(event.startTime)} - {formatTime(event.endTime)}
                                </div>
                                <div className="flex items-center">
                                  <MapPin className="h-4 w-4 mr-2 flex-shrink-0" />
                                  {event.schoolName}
                                </div>
                                <div className="flex items-center">
                                  <User className="h-4 w-4 mr-2 flex-shrink-0" />
                                  {event.coach.name}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="flex sm:flex-col gap-2 sm:items-end">
                          {event.isPast && (
                            <span className="px-3 py-1 bg-gray-200 text-gray-600 text-xs font-medium rounded-full">
                              Past
                            </span>
                          )}
                          <Button
                            variant="outline"
                            size="sm"
                            disabled
                            title="Coming in Phase 2"
                            className="text-xs"
                          >
                            Report Absence
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
