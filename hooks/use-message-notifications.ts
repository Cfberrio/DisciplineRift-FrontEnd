'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

interface UnreadCount {
  teamid: string
  coachid: string
  count: number
}

export interface NotificationItem {
  teamid: string
  teamname: string
  coachid: string
  coachname: string
  count: number
}

export function useMessageNotifications(parentId: string | null) {
  const [unreadCounts, setUnreadCounts] = useState<UnreadCount[]>([])
  const [totalUnread, setTotalUnread] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!parentId) {
      setLoading(false)
      return
    }

    loadUnreadCounts()

    // Realtime: escuchar nuevos mensajes
    const messageChannel = supabase
      .channel('unread-messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'message',
        },
        (payload: any) => {
          // Si el mensaje NO es del parent (es del coach), recargar contadores
          if (payload.new.parentid === parentId && payload.new.sender_role === 'coach') {
            loadUnreadCounts()
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'message_read_status',
          filter: `parentid=eq.${parentId}`,
        },
        () => {
          loadUnreadCounts() // Recargar cuando se marca como leído
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(messageChannel)
    }
  }, [parentId])

  const loadUnreadCounts = async () => {
    if (!parentId) return

    try {
      // Llamar a la función RPC
      const { data, error } = await supabase.rpc('get_unread_counts', {
        p_parentid: parentId,
      })

      if (error) {
        console.error('Error loading unread counts:', error)
        return
      }

      if (data) {
        setUnreadCounts(data)
        const total = data.reduce((sum: number, item: any) => sum + (parseInt(item.count) || 0), 0)
        setTotalUnread(total)
      }
    } catch (error) {
      console.error('Error in loadUnreadCounts:', error)
    } finally {
      setLoading(false)
    }
  }

  const markAsRead = async (teamId: string, coachId: string) => {
    if (!parentId) return

    try {
      // Obtener todos los mensajes no leídos de esta conversación
      const { data: unreadMessages, error: fetchError } = await supabase
        .from('message')
        .select('id')
        .eq('teamid', teamId)
        .eq('coachid', coachId)
        .eq('parentid', parentId)
        .eq('sender_role', 'coach')

      if (fetchError) {
        console.error('Error fetching unread messages:', fetchError)
        return
      }

      if (!unreadMessages || unreadMessages.length === 0) {
        return
      }

      // Filtrar los que ya no están en message_read_status
      const { data: alreadyRead } = await supabase
        .from('message_read_status')
        .select('messageid')
        .eq('parentid', parentId)
        .in(
          'messageid',
          unreadMessages.map((m) => m.id)
        )

      const alreadyReadIds = new Set(alreadyRead?.map((r) => r.messageid) || [])
      const toMarkAsRead = unreadMessages.filter((m) => !alreadyReadIds.has(m.id))

      if (toMarkAsRead.length > 0) {
        // Marcar todos como leídos
        const readRecords = toMarkAsRead.map((msg) => ({
          messageid: msg.id,
          parentid: parentId,
        }))

        const { error: insertError } = await supabase
          .from('message_read_status')
          .insert(readRecords)

        if (insertError) {
          console.error('Error marking messages as read:', insertError)
          return
        }

        // Recargar contadores
        await loadUnreadCounts()
      }
    } catch (error) {
      console.error('Error marking messages as read:', error)
    }
  }

  const getUnreadCount = (teamId: string, coachId: string): number => {
    const found = unreadCounts.find(
      (item) => item.teamid === teamId && item.coachid === coachId
    )
    return found ? parseInt(String(found.count)) : 0
  }

  const getNotificationDetails = async (): Promise<NotificationItem[]> => {
    if (!parentId || unreadCounts.length === 0) return []

    const notificationItems: NotificationItem[] = []

    for (const count of unreadCounts) {
      // Obtener info del team
      const { data: teamData } = await supabase
        .from('team')
        .select('name')
        .eq('teamid', count.teamid)
        .single()

      // Obtener info del coach
      const { data: coachData } = await supabase
        .from('staff')
        .select('name')
        .eq('id', count.coachid)
        .single()

      if (teamData && coachData) {
        notificationItems.push({
          teamid: count.teamid,
          teamname: teamData.name,
          coachid: count.coachid,
          coachname: coachData.name,
          count: parseInt(String(count.count)),
        })
      }
    }

    return notificationItems
  }

  return {
    unreadCounts,
    totalUnread,
    loading,
    markAsRead,
    getUnreadCount,
    refreshCounts: loadUnreadCounts,
    getNotificationDetails,
  }
}
