'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import TeamSelector from '@/components/messages/TeamSelector'
import ChatPanel from '@/components/messages/ChatPanel'
import { Loader2, MessageSquare } from 'lucide-react'
import { useMessageNotifications } from '@/hooks/use-message-notifications'

interface TeamWithCoach {
  teamid: string
  teamname: string
  coachid: string
  coachname: string
}

export default function MessagesClient() {
  const [teams, setTeams] = useState<TeamWithCoach[]>([])
  const [selectedTeam, setSelectedTeam] = useState<TeamWithCoach | null>(null)
  const [parentId, setParentId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const searchParams = useSearchParams()

  // Hook de notificaciones
  const { getUnreadCount, markAsRead } = useMessageNotifications(parentId)

  useEffect(() => {
    loadParentAndTeams()
  }, [])

  // Handle query params for direct navigation from notifications
  useEffect(() => {
    const teamParam = searchParams.get('team')
    const coachParam = searchParams.get('coach')

    if (teamParam && coachParam && teams.length > 0) {
      const targetTeam = teams.find(
        (t) => t.teamid === teamParam && t.coachid === coachParam
      )
      if (targetTeam && parentId) {
        setSelectedTeam(targetTeam)
        // Marcar como leído
        markAsRead(targetTeam.teamid, targetTeam.coachid)
      }
    }
  }, [teams, searchParams, parentId, markAsRead])

  const handleTeamChange = async (team: TeamWithCoach) => {
    setSelectedTeam(team)
    // Marcar mensajes como leídos al cambiar de conversación
    if (parentId) {
      await markAsRead(team.teamid, team.coachid)
    }
  }

  const loadParentAndTeams = async () => {
    setLoading(true)
    setError(null)

    try {
      // Obtener el usuario autenticado
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser()

      if (authError || !user) {
        setError('Please log in to access messages')
        setLoading(false)
        return
      }

      setParentId(user.id)

      // 1. Obtener enrollments activos del parent
      const { data: studentData, error: studentError } = await supabase
        .from('student')
        .select('studentid')
        .eq('parentid', user.id)

      if (studentError || !studentData || studentData.length === 0) {
        console.error('Error fetching students:', studentError)
        setError('No students found for this parent')
        setLoading(false)
        return
      }

      const studentIds = studentData.map((s: any) => s.studentid)

      const { data: enrollments, error: enrollmentsError } = await supabase
        .from('enrollment')
        .select('teamid')
        .in('studentid', studentIds)
        .eq('isactive', true)

      if (enrollmentsError || !enrollments || enrollments.length === 0) {
        console.error('Error fetching enrollments:', enrollmentsError)
        setError('No active teams found')
        setLoading(false)
        return
      }

      const teamIds = [...new Set(enrollments.map((e: any) => e.teamid))]

      if (teamIds.length === 0) {
        setError('No teams found')
        setLoading(false)
        return
      }

      // 2. Obtener teams con sus coaches via sessions
      const { data: sessions, error: sessionsError } = await supabase
        .from('session')
        .select(`
          teamid,
          coachid,
          cancel,
          team:teamid(teamid, name, status),
          staff:coachid(id, name)
        `)
        .in('teamid', teamIds)
        .not('coachid', 'is', null)

      if (sessionsError) {
        console.error('Error fetching sessions:', sessionsError)
        setError('Error loading coaches')
        setLoading(false)
        return
      }

      if (!sessions || sessions.length === 0) {
        setError('No coaches assigned to your teams yet')
        setLoading(false)
        return
      }

      // 3. Crear una entrada por cada combinación de team + coach
      const teamMap = new Map<string, TeamWithCoach>()

      sessions?.forEach((session: any) => {
        // Filtrar sessions canceladas (cancel es TEXT, puede ser null o string)
        const isCancelled = session.cancel && session.cancel.toLowerCase() === 'true'
        
        if (
          !isCancelled &&
          session.team &&
          session.staff &&
          ['open', 'ongoing', 'closed'].includes(session.team.status)
        ) {
          // Key única por combinación de teamid + coachid
          const key = `${session.team.teamid}-${session.staff.id}`
          if (!teamMap.has(key)) {
            teamMap.set(key, {
              teamid: session.team.teamid,
              teamname: session.team.name,
              coachid: session.staff.id,
              coachname: session.staff.name,
            })
          }
        }
      })

      const teamsList = Array.from(teamMap.values())
      
      if (teamsList.length === 0) {
        setError('No coaches available for your teams')
        setLoading(false)
        return
      }

      setTeams(teamsList)

      // Seleccionar el primer team por defecto
      if (teamsList.length > 0 && !selectedTeam) {
        setSelectedTeam(teamsList[0])
      }
    } catch (error) {
      console.error('Error in loadParentAndTeams:', error)
      setError('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-[#0085B7] mx-auto mb-4" />
          <p className="text-gray-600">Loading messages...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 text-lg font-medium mb-2">{error}</p>
          <p className="text-sm text-gray-500">Please try again or contact support</p>
        </div>
      </div>
    )
  }

  if (!parentId) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 text-lg font-medium">Please log in to access messages</p>
        </div>
      </div>
    )
  }

  if (teams.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 text-lg font-medium mb-2">No teams available</p>
          <p className="text-sm text-gray-500">
            You need to have active enrollments to access messages
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <MessageSquare className="h-8 w-8 text-[#0085B7]" />
        <h1 className="text-3xl font-bold text-gray-900">Messages</h1>
      </div>

      {/* Team Selector */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <TeamSelector 
          teams={teams} 
          selected={selectedTeam} 
          onChange={handleTeamChange}
          getUnreadCount={getUnreadCount}
        />
      </div>

      {/* Chat Panel */}
      {selectedTeam && parentId && (
        <div>
          <ChatPanel
            teamId={selectedTeam.teamid}
            parentId={parentId}
            coachId={selectedTeam.coachid}
            coachName={selectedTeam.coachname}
          />
        </div>
      )}
    </div>
  )
}
