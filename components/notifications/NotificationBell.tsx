'use client'

import { useState, useRef, useEffect } from 'react'
import { Bell } from 'lucide-react'
import { useRouter, usePathname } from 'next/navigation'
import { useMessageNotifications, NotificationItem } from '@/hooks/use-message-notifications'

interface NotificationBellProps {
  parentId: string | null
  size?: 'sm' | 'md' | 'lg'
  showLabel?: boolean
}

export default function NotificationBell({
  parentId,
  size = 'md',
  showLabel = false,
}: NotificationBellProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [notifications, setNotifications] = useState<NotificationItem[]>([])
  const dropdownRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const pathname = usePathname()

  const { totalUnread, unreadCounts, markAsRead, getNotificationDetails } =
    useMessageNotifications(parentId)

  // Ocultar badge cuando estamos en la página de messages
  const isMessagesPage = pathname === '/dashboard/messages'
  const displayBadge = totalUnread > 0 && !isMessagesPage

  // Cerrar dropdown al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  // Transformar unreadCounts en NotificationItems
  useEffect(() => {
    loadNotifications()
  }, [unreadCounts])

  const loadNotifications = async () => {
    const items = await getNotificationDetails()
    setNotifications(items)
  }

  const handleNotificationClick = async (item: NotificationItem) => {
    // Marcar como leído
    await markAsRead(item.teamid, item.coachid)

    // Cerrar dropdown
    setIsOpen(false)

    // Navegar al chat con query params para seleccionar automáticamente
    router.push(`/dashboard/messages?team=${item.teamid}&coach=${item.coachid}`)
  }

  const iconSize = size === 'sm' ? 'h-5 w-5' : size === 'lg' ? 'h-7 w-7' : 'h-6 w-6'

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-full hover:bg-gray-100 transition-colors"
        aria-label="Notifications"
      >
        <Bell className={iconSize} />
        {displayBadge && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
            {totalUnread > 9 ? '9+' : totalUnread}
          </span>
        )}
      </button>

      {showLabel && <span className="ml-2 text-sm font-medium">Notifications</span>}

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
          <div className="p-4 border-b border-gray-200">
            <h3 className="text-sm font-semibold text-gray-900">
              Notifications {totalUnread > 0 && `(${totalUnread})`}
            </h3>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {totalUnread === 0 ? (
              <div className="p-4 text-center text-sm text-gray-500">No new messages</div>
            ) : (
              <ul className="divide-y divide-gray-100">
                {notifications.map((item) => (
                  <li key={`${item.teamid}-${item.coachid}`}>
                    <button
                      onClick={() => handleNotificationClick(item)}
                      className="w-full p-4 hover:bg-gray-50 transition-colors text-left"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">
                            Coach {item.coachname}
                          </p>
                          <p className="text-xs text-gray-500 mt-0.5">{item.teamname}</p>
                        </div>
                        <span className="ml-2 inline-flex items-center rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800">
                          {item.count}
                        </span>
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {totalUnread > 0 && (
            <div className="p-3 border-t border-gray-200">
              <button
                onClick={() => {
                  setIsOpen(false)
                  router.push('/dashboard/messages')
                }}
                className="w-full text-center text-sm font-medium text-[#0085B7] hover:text-[#006a94]"
              >
                View all messages
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
