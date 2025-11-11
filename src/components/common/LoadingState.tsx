// ============================================================================
// LOADING STATE - Component for managing loading/error/success states
// ============================================================================

import { ReactNode } from 'react'
import { AlertTriangle, CheckCircle } from 'lucide-react'
import { LoadingSpinner, SectionLoadingOverlay } from './LoadingSpinner'
import { Button } from './Button'

export interface LoadingStateProps {
  /** Whether data is currently loading */
  isLoading: boolean
  /** Error message if error occurred */
  error?: string | null
  /** Success message if operation succeeded */
  success?: string | null
  /** Content to render when loaded successfully */
  children: ReactNode
  /** Loading placeholder (skeleton or spinner) */
  loadingPlaceholder?: ReactNode
  /** Show loading overlay instead of placeholder */
  useOverlay?: boolean
  /** Retry callback for error state */
  onRetry?: () => void
  /** Custom loading message */
  loadingMessage?: string
  /** Empty state message */
  emptyMessage?: string
  /** Whether data is empty (optional) */
  isEmpty?: boolean
}

/**
 * Component for managing loading, error, and success states
 *
 * Handles different states of async operations with appropriate UI feedback.
 *
 * @example
 * ```tsx
 * <LoadingState
 *   isLoading={isLoading}
 *   error={error}
 *   onRetry={refetch}
 * >
 *   <YourContent />
 * </LoadingState>
 * ```
 */
export function LoadingState({
  isLoading,
  error,
  success,
  children,
  loadingPlaceholder,
  useOverlay = false,
  onRetry,
  loadingMessage,
  emptyMessage,
  isEmpty = false,
}: LoadingStateProps) {
  // Loading state
  if (isLoading) {
    if (useOverlay) {
      return (
        <div className="relative min-h-[200px]">
          {children}
          <SectionLoadingOverlay label={loadingMessage} />
        </div>
      )
    }

    if (loadingPlaceholder) {
      return <>{loadingPlaceholder}</>
    }

    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <LoadingSpinner size="lg" label={loadingMessage || 'Loading...'} />
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="text-center max-w-md">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 mb-4">
            <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
            Error
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            {error}
          </p>
          {onRetry && (
            <Button onClick={onRetry} variant="secondary">
              Try again
            </Button>
          )}
        </div>
      </div>
    )
  }

  // Success notification (transient)
  if (success) {
    return (
      <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg mb-4">
        <div className="flex items-center gap-2">
          <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
          <p className="text-sm text-green-900 dark:text-green-100">
            {success}
          </p>
        </div>
      </div>
    )
  }

  // Empty state
  if (isEmpty && emptyMessage) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="text-center max-w-md">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {emptyMessage}
          </p>
        </div>
      </div>
    )
  }

  // Success state - render children
  return <>{children}</>
}

/**
 * Simple loading wrapper that only handles loading state
 */
export function LoadingWrapper({
  isLoading,
  children,
  loadingMessage,
}: {
  isLoading: boolean
  children: ReactNode
  loadingMessage?: string
}) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <LoadingSpinner size="lg" label={loadingMessage || 'Loading...'} />
      </div>
    )
  }

  return <>{children}</>
}

/**
 * Loading state specifically for async data fetching
 */
export function AsyncLoadingState<T>({
  data,
  isLoading,
  error,
  onRetry,
  emptyMessage = 'No data available',
  children,
}: {
  data: T | null | undefined
  isLoading: boolean
  error?: string | null
  onRetry?: () => void
  emptyMessage?: string
  children: (data: T) => ReactNode
}) {
  return (
    <LoadingState
      isLoading={isLoading}
      error={error}
      onRetry={onRetry}
      isEmpty={!data}
      emptyMessage={emptyMessage}
    >
      {data && children(data)}
    </LoadingState>
  )
}

export default LoadingState
