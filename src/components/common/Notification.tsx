// ============================================================================
// NOTIFICATION SYSTEM (Toast)
// Displays toast notifications in the top-right corner of the app
// ============================================================================

import { useEffect, type ReactNode } from 'react'
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react'
import { useUIStore } from '../../store/ui-store'

// ============================================================================
// TYPES
// ============================================================================

export type NotificationType = 'success' | 'error' | 'warning' | 'info'

export interface Notification {
  id: string
  type: NotificationType
  title: string
  message: string
  duration?: number
}

// ============================================================================
// NOTIFICATION CONTAINER
// ============================================================================

/**
 * Notification container - renders at top-right of screen
 * Displays all active notifications in a stack
 */
export function NotificationContainer() {
  const notifications = useUIStore((state) => state.notifications)
  const removeNotification = useUIStore((state) => state.removeNotification)

  return (
    <div className="fixed right-4 top-4 z-50 flex flex-col gap-2">
      {notifications.map((notification) => (
        <NotificationItem
          key={notification.id}
          notification={notification}
          onClose={() => removeNotification(notification.id)}
        />
      ))}
    </div>
  )
}

// ============================================================================
// NOTIFICATION ITEM
// ============================================================================

/**
 * Single notification item
 * Auto-dismisses after duration (default: 5 seconds)
 */
function NotificationItem({
  notification,
  onClose,
}: {
  notification: Notification
  onClose: () => void
}) {
  const { type, title, message, duration = 5000 } = notification

  // Auto-dismiss after duration
  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(onClose, duration)
      return () => clearTimeout(timer)
    }
  }, [duration, onClose])

  const styles = getNotificationStyles(type)
  const Icon = getNotificationIcon(type)

  return (
    <div
      className={`flex min-w-[320px] max-w-md items-start gap-3 rounded-lg border p-4 shadow-lg ${styles.container}`}
      role="alert"
    >
      <Icon className={`mt-0.5 h-5 w-5 flex-shrink-0 ${styles.icon}`} aria-hidden="true" />

      <div className="flex-1">
        <h4 className={`mb-1 font-semibold ${styles.title}`}>{title}</h4>
        <p className={`text-sm ${styles.message}`}>{message}</p>
      </div>

      <button
        onClick={onClose}
        className={`flex-shrink-0 rounded p-1 transition-colors ${styles.closeButton}`}
        aria-label="Close notification"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  )
}

// ============================================================================
// STYLING HELPERS
// ============================================================================

/**
 * Get Tailwind CSS classes for notification type
 */
function getNotificationStyles(type: NotificationType) {
  switch (type) {
    case 'success':
      return {
        container: 'border-green-800 bg-green-950',
        icon: 'text-green-500',
        title: 'text-green-100',
        message: 'text-green-200',
        closeButton: 'hover:bg-green-900 text-green-400',
      }
    case 'error':
      return {
        container: 'border-red-800 bg-red-950',
        icon: 'text-red-500',
        title: 'text-red-100',
        message: 'text-red-200',
        closeButton: 'hover:bg-red-900 text-red-400',
      }
    case 'warning':
      return {
        container: 'border-yellow-800 bg-yellow-950',
        icon: 'text-yellow-500',
        title: 'text-yellow-100',
        message: 'text-yellow-200',
        closeButton: 'hover:bg-yellow-900 text-yellow-400',
      }
    case 'info':
      return {
        container: 'border-blue-800 bg-blue-950',
        icon: 'text-blue-500',
        title: 'text-blue-100',
        message: 'text-blue-200',
        closeButton: 'hover:bg-blue-900 text-blue-400',
      }
  }
}

/**
 * Get Lucide icon component for notification type
 */
function getNotificationIcon(type: NotificationType) {
  switch (type) {
    case 'success':
      return CheckCircle
    case 'error':
      return AlertCircle
    case 'warning':
      return AlertTriangle
    case 'info':
      return Info
  }
}
