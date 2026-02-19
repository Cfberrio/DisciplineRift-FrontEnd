'use client'

import { useEffect, useRef, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Message } from '@/lib/supabase'
import { Send, Loader2, Paperclip } from 'lucide-react'

// Helper function to format file sizes
function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

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
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

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

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) {
      alert('Please select an image or video file');
      return;
    }

    // Validate file size (25MB = 25 * 1024 * 1024 bytes)
    const MAX_FILE_SIZE = 25 * 1024 * 1024;
    if (file.size > MAX_FILE_SIZE) {
      alert('File size must be less than 25MB');
      return;
    }

    setSelectedFile(file);
  };

  const uploadFileAndSend = async () => {
    if (!selectedFile) {
      await sendMessage();
      return;
    }

    setUploading(true);
    setSending(true);

    try {
      // Upload to Supabase Storage
      const timestamp = Date.now();
      const fileName = `${timestamp}_${selectedFile.name}`;
      const filePath = `messages/${parentId}/${fileName}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('attachements')
        .upload(filePath, selectedFile);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('attachements')
        .getPublicUrl(filePath);

      const attachment_url = urlData.publicUrl;
      const attachment_name = selectedFile.name;
      const attachment_type = selectedFile.type;
      const attachment_size = selectedFile.size;

      // Send message with attachment
      const messageBody = text.trim();
      const tempMessage: Message = {
        id: `temp_${Date.now()}`,
        teamid: teamId,
        sender_role: 'parent',
        parentid: parentId,
        coachid: coachId,
        body: messageBody,
        created_at: new Date().toISOString(),
        attachment_url,
        attachment_name,
        attachment_type,
        attachment_size,
      };

      setMessages((prev) => [...prev, tempMessage]);
      setText('');
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';

      const { error } = await supabase.from('message').insert({
        teamid: teamId,
        sender_role: 'parent',
        parentid: parentId,
        coachid: coachId,
        body: messageBody,
        attachment_url,
        attachment_name,
        attachment_type,
        attachment_size,
      });

      if (error) {
        setMessages((prev) => prev.filter((m) => m.id !== tempMessage.id));
        alert('Error sending message with attachment');
        console.error(error);
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('Failed to upload attachment');
    } finally {
      setUploading(false);
      setSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      uploadFileAndSend()
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
                    {message.body && (
                      <div className="text-sm whitespace-pre-wrap break-words">{message.body}</div>
                    )}

                    {/* Render attachment if present */}
                    {message.attachment_url && (
                      <div className="mt-2">
                        {message.attachment_type?.startsWith('image/') ? (
                          <a 
                            href={message.attachment_url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="block"
                          >
                            <img
                              src={message.attachment_url}
                              alt={message.attachment_name || 'Attachment'}
                              className="max-w-[300px] rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                            />
                          </a>
                        ) : message.attachment_type?.startsWith('video/') ? (
                          <video
                            src={message.attachment_url}
                            controls
                            className="max-w-[300px] rounded-lg"
                          >
                            Your browser does not support the video tag.
                          </video>
                        ) : (
                          <a
                            href={message.attachment_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 text-xs underline hover:no-underline"
                          >
                            📎 {message.attachment_name} ({formatFileSize(message.attachment_size || 0)})
                          </a>
                        )}
                      </div>
                    )}
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
        <div className="flex flex-col gap-2">
          {/* File preview if selected */}
          {selectedFile && (
            <div className="flex items-center gap-2 text-xs text-gray-600 bg-gray-50 p-2 rounded">
              <span>📎 {selectedFile.name} ({formatFileSize(selectedFile.size)})</span>
              <button
                onClick={() => {
                  setSelectedFile(null);
                  if (fileInputRef.current) fileInputRef.current.value = '';
                }}
                className="text-red-500 hover:text-red-700"
              >
                ✕
              </button>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,video/*"
              onChange={handleFileSelect}
              className="hidden"
            />

            {/* Attachment button */}
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={sending || uploading}
              className="sm:order-first bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed text-gray-700 rounded-md py-2.5 sm:py-2 sm:px-3 sm:h-10 flex items-center justify-center gap-2 transition-colors"
              title="Attach photo or video"
            >
              <Paperclip className="h-4 w-4" />
              <span className="sm:hidden text-sm">Attach File</span>
            </button>

            {/* Text input */}
            <input
              type="text"
              className="w-full sm:flex-1 border border-gray-300 rounded-md px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#0085B7] focus:border-transparent"
              placeholder={`Write a message to Coach ${coachName}...`}
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={sending || uploading}
            />

            {/* Send button */}
            <button
              onClick={uploadFileAndSend}
              disabled={(!text.trim() && !selectedFile) || sending || uploading}
              className="w-full sm:w-auto bg-[#0085B7] hover:bg-[#006a94] disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-md py-2.5 sm:py-2 sm:px-3 sm:h-10 sm:w-10 flex items-center justify-center gap-2 transition-colors focus:outline-none focus:ring-2 focus:ring-[#0085B7] focus:ring-offset-2"
            >
              {uploading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="sm:hidden text-sm">Uploading...</span>
                </>
              ) : sending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="sm:hidden text-sm">Sending...</span>
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  <span className="sm:hidden text-sm">Send Message</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
