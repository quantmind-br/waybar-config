// ============================================================================
// LOADING SPINNER - Animated loading indicator
// ============================================================================

import { Loader2 } from 'lucide-react'

export interface LoadingSpinnerProps {
  /** Size of the spinner */
  size?: 'sm' | 'md' | 'lg' | 'xl'
  /** Custom className */
  className?: string
  /** Optional label */
  label?: string
}

const sizes = {
  sm: 'w-4 h-4',
  md: 'w-6 h-6',
  lg: 'w-8 h-8',
  xl: 'w-12 h-12',
}

/**
 * Animated loading spinner
 *
 * @example
 * ```tsx
 * <LoadingSpinner size="lg" label="Loading..." />
 * ```
 */
export function LoadingSpinner({
  size = 'md',
  className = '',
  label,
}: LoadingSpinnerProps) {
  return (
    <div className={`flex flex-col items-center justify-center gap-2 ${className}`}>
      <Loader2 className={`${sizes[size]} animate-spin text-blue-600 dark:text-blue-400`} />
      {label && (
        <p className="text-sm text-gray-600 dark:text-gray-400">{label}</p>
      )}
    </div>
  )
}

/**
 * Inline loading spinner (small, for buttons)
 */
export function InlineLoadingSpinner() {
  return <Loader2 className="w-4 h-4 animate-spin" />
}

/**
 * Full-screen loading overlay
 */
export function LoadingOverlay({
  label = 'Loading...',
  show = true,
}: {
  label?: string
  show?: boolean
}) {
  if (!show) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6">
        <LoadingSpinner size="lg" label={label} />
      </div>
    </div>
  )
}

/**
 * Loading overlay for a specific section
 */
export function SectionLoadingOverlay({
  label,
  show = true,
}: {
  label?: string
  show?: boolean
}) {
  if (!show) return null

  return (
    <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded">
      <LoadingSpinner size="md" label={label} />
    </div>
  )
}

export default LoadingSpinner
