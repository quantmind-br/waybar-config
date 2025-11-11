// ============================================================================
// VALIDATION MESSAGE - Error/Warning/Info Display Component
// ============================================================================

import { AlertCircle, AlertTriangle, Info, CheckCircle } from 'lucide-react'

// ============================================================================
// TYPES
// ============================================================================

export type ValidationMessageType = 'error' | 'warning' | 'info' | 'success'

export interface ValidationMessageProps {
  type: ValidationMessageType
  messages: string | string[]
  className?: string
  showIcon?: boolean
  compact?: boolean
}

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * ValidationMessage - Display validation errors, warnings, info, or success messages
 *
 * Features:
 * - Color-coded by message type (red/yellow/blue/green)
 * - Icons for visual identification
 * - Supports single or multiple messages
 * - Compact mode for inline display
 * - Customizable via className prop
 *
 * Usage:
 * ```tsx
 * <ValidationMessage
 *   type="error"
 *   messages="Height must be a positive integer"
 * />
 *
 * <ValidationMessage
 *   type="warning"
 *   messages={["Module may not work without PulseAudio", "High CPU usage expected"]}
 *   compact
 * />
 * ```
 */
export function ValidationMessage({
  type,
  messages,
  className = '',
  showIcon = true,
  compact = false,
}: ValidationMessageProps) {
  // Normalize messages to array
  const messageArray = Array.isArray(messages) ? messages : [messages]

  // Don't render if no messages
  if (messageArray.length === 0) {
    return null
  }

  // Get styling based on message type
  const styles = getStyles(type)

  return (
    <div className={`${styles.container} ${compact ? 'py-1' : 'py-2'} ${className}`}>
      <div className="flex items-start gap-2">
        {/* Icon */}
        {showIcon && (
          <div className={`${styles.icon} ${compact ? 'mt-0.5' : 'mt-1'} flex-shrink-0`}>
            {styles.IconComponent && (
              <styles.IconComponent className={compact ? 'h-3.5 w-3.5' : 'h-4 w-4'} />
            )}
          </div>
        )}

        {/* Messages */}
        <div className="flex-1">
          {messageArray.length === 1 ? (
            // Single message
            <p className={`${styles.text} ${compact ? 'text-xs' : 'text-sm'}`}>
              {messageArray[0]}
            </p>
          ) : (
            // Multiple messages as list
            <ul className={`${styles.text} ${compact ? 'space-y-0.5' : 'space-y-1'} list-inside list-disc`}>
              {messageArray.map((message, index) => (
                <li key={index} className={compact ? 'text-xs' : 'text-sm'}>
                  {message}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}

// ============================================================================
// STYLE HELPERS
// ============================================================================

interface StyleConfig {
  container: string
  icon: string
  text: string
  IconComponent: typeof AlertCircle | typeof AlertTriangle | typeof Info | typeof CheckCircle
}

function getStyles(type: ValidationMessageType): StyleConfig {
  switch (type) {
    case 'error':
      return {
        container: 'rounded-md bg-red-950/30 border border-red-900/50 px-3',
        icon: 'text-red-400',
        text: 'text-red-300',
        IconComponent: AlertCircle,
      }

    case 'warning':
      return {
        container: 'rounded-md bg-yellow-950/30 border border-yellow-900/50 px-3',
        icon: 'text-yellow-400',
        text: 'text-yellow-300',
        IconComponent: AlertTriangle,
      }

    case 'info':
      return {
        container: 'rounded-md bg-blue-950/30 border border-blue-900/50 px-3',
        icon: 'text-blue-400',
        text: 'text-blue-300',
        IconComponent: Info,
      }

    case 'success':
      return {
        container: 'rounded-md bg-green-950/30 border border-green-900/50 px-3',
        icon: 'text-green-400',
        text: 'text-green-300',
        IconComponent: CheckCircle,
      }
  }
}

// ============================================================================
// CONVENIENCE COMPONENTS
// ============================================================================

/**
 * Shorthand for error messages
 */
export function ErrorMessage(props: Omit<ValidationMessageProps, 'type'>) {
  return <ValidationMessage {...props} type="error" />
}

/**
 * Shorthand for warning messages
 */
export function WarningMessage(props: Omit<ValidationMessageProps, 'type'>) {
  return <ValidationMessage {...props} type="warning" />
}

/**
 * Shorthand for info messages
 */
export function InfoMessage(props: Omit<ValidationMessageProps, 'type'>) {
  return <ValidationMessage {...props} type="info" />
}

/**
 * Shorthand for success messages
 */
export function SuccessMessage(props: Omit<ValidationMessageProps, 'type'>) {
  return <ValidationMessage {...props} type="success" />
}
