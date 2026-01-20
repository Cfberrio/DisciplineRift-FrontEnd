'use client'

import { useEffect, useRef, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Message } from '@/lib/supabase'
import { Send, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface ChatPanelProps {
  teamId: string
  parentId: string
  coachId: string
  coachName: string
}

export default function ChatPanel({ teamId, parentId, coachId, coachName }: ChatPanelProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Carga inicial de mensajes
  useEffect(() => {
    loadMessages()
  }, [teamId, parentId, coachId])

  // Realtime subscription
  useEffect(() => {
    const channel = supabase
      .channel(`messages:team:${teamId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'message',
          filter: `teamid=eq.${teamId}`,
        },
        (payload: any) => {
          // Filtrar por parentId y coachId en el cliente
          const msg = payload.new || payload.old

          if (msg.parentid !== parentId || msg.coachid !== coachId) {
            return // Ignorar mensajes de otras conversaciones
          }

          if (payload.eventType === 'INSERT') {
            setMessages((prev) => {
              // Evitar duplicados (por optimistic update)
              const exists = prev.some((m) => m.id === payload.new.id)
              if (exists) return prev
              return [...prev, payload.new as Message]
            })
          } else if (payload.eventType === 'UPDATE') {
            setMessages((prev) =>
              prev.map((m) => (m.id === payload.new.id ? (payload.new as Message) : m))
            )
          } else if (payload.eventType === 'DELETE') {
            setMessages((prev) => prev.filter((m) => m.id !== payload.old.id))
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [teamId, parentId, coachId])

  // Auto-scroll al recibir nuevos mensajes
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages.length])

  const loadMessages = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('message')
        .select('*')
        .eq('teamid', teamId)
        .eq('parentid', parentId)
        .eq('coachid', coachId)
        .order('created_at', { ascending: true })
        .limit(50)

      if (!error && data) {
        setMessages(data as Message[])
      }
    } catch (error) {
      console.error('Error loading messages:', error)
    } finally {
      setLoading(false)
    }
  }

  const sendMessage = async () => {
    const body = text.trim()
    if (!body || sending) return

    setText('')
    setSending(true)

    // Optimistic update
    const tempMessage: Message = {
      id: `temp_${Date.now()}`,
      teamid: teamId,
      sender_role: 'parent',
      parentid: parentId,
      coachid: coachId,
      body,
      created_at: new Date().toISOString(),
    }

    setMessages((prev) => [...prev, tempMessage])

    try {
      const { error } = await supabase.from('message').insert({
        teamid: teamId,
        sender_role: 'parent',
        parentid: parentId,
        coachid: coachId,
        body,
      })

      if (error) {
        // Revertir optimistic update
        setMessages((prev) => prev.filter((m) => m.id !== tempMessage.id))
        alert('Error sending message. Please try again.')
        setText(body) // Restaurar el texto
      }
    } catch (error) {
      console.error('Error sending message:', error)
      setMessages((prev) => prev.filter((m) => m.id !== tempMessage.id))
      alert('Error sending message. Please try again.')
      setText(body)
    } finally {
      setSending(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-80 bg-gray-50 rounded-md">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-[#0085B7] mx-auto mb-2" />
          <p className="text-sm text-gray-600">Loading messages...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="border border-gray-200 rounded-md bg-white shadow-sm">
      {/* Header con nombre del coach */}
      <div className="border-b border-gray-200 bg-gray-50 px-4 py-3">
        <h2 className="text-lg font-semibold text-gray-900">Chat with Coach {coachName}</h2>
      </div>

      {/* Messages area */}
      <div className="h-80 overflow-y-auto p-4 space-y-3 bg-gray-50">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-sm text-gray-500">No messages yet. Start the conversation!</p>
          </div>
        ) : (
          <>
            {messages.map((message) => {
              const isParent = message.sender_role === 'parent'
              const isTemp = message.id.startsWith('temp_')

              return (
                <div
                  key={message.id}
                  className={`flex ${isParent ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg px-4 py-2 ${
                      isParent
                        ? 'bg-[#0085B7] text-white'
                        : 'bg-white border border-gray-200 text-gray-900'
                    } ${isTemp ? 'opacity-60' : ''}`}
                  >
                    <div className="text-xs mb-1 opacity-75">
                      {isParent ? 'You' : `Coach ${coachName}`} •{' '}
                      {new Date(message.created_at).toLocaleString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: 'numeric',
                        minute: '2-digit',
                      })}
                    </div>
                    <div className="text-sm whitespace-pre-wrap break-words">{message.body}</div>
                  </div>
                </div>
              )
            })}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Input area */}
      <div className="border-t border-gray-200 p-3 bg-white">
        <div className="flex gap-2">
          <input
            type="text"
            className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0085B7] focus:border-transparent"
            placeholder={`Write a message to Coach ${coachName}...`}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={sending}
          />
          <Button
            onClick={sendMessage}
            disabled={!text.trim() || sending}
            className="bg-[#0085B7] hover:bg-[#006a94] text-white px-4"
          >
            {sending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
