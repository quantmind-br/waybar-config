// ============================================================================
// ERROR BOUNDARY - React error boundary for graceful error handling
// ============================================================================

import { Component, ErrorInfo, ReactNode } from 'react'
import { AlertTriangle, RefreshCw, Home } from 'lucide-react'
import { Button } from './Button'

export interface ErrorBoundaryProps {
  children: ReactNode
  /** Fallback UI to render when error occurs */
  fallback?: (error: Error, errorInfo: ErrorInfo, reset: () => void) => ReactNode
  /** Callback when error is caught */
  onError?: (error: Error, errorInfo: ErrorInfo) => void
  /** Custom error message */
  errorMessage?: string
  /** Show error details in UI */
  showDetails?: boolean
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
  errorInfo: ErrorInfo | null
}

/**
 * Error boundary component for catching React render errors
 *
 * Catches JavaScript errors anywhere in the child component tree,
 * logs those errors, and displays a fallback UI instead of crashing.
 *
 * @example
 * ```tsx
 * <ErrorBoundary>
 *   <YourComponent />
 * </ErrorBoundary>
 * ```
 *
 * @example With custom fallback:
 * ```tsx
 * <ErrorBoundary
 *   fallback={(error, errorInfo, reset) => (
 *     <div>
 *       <h1>Oops! Something went wrong</h1>
 *       <button onClick={reset}>Try again</button>
 *     </div>
 *   )}
 * >
 *   <YourComponent />
 * </ErrorBoundary>
 * ```
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    }
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      error,
    }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Log error to console
    console.error('ErrorBoundary caught an error:', error, errorInfo)

    // Update state with error info
    this.setState({
      error,
      errorInfo,
    })

    // Call onError callback if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo)
    }

    // In production, you might want to log to an error reporting service
    if (import.meta.env.PROD) {
      // Example: logErrorToService(error, errorInfo)
    }
  }

  handleReset = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    })
  }

  handleReload = (): void => {
    window.location.reload()
  }

  handleGoHome = (): void => {
    window.location.href = '/'
  }

  render(): ReactNode {
    const { hasError, error, errorInfo } = this.state
    const { children, fallback, errorMessage, showDetails = import.meta.env.DEV } = this.props

    if (hasError && error) {
      // Use custom fallback if provided
      if (fallback && errorInfo) {
        return fallback(error, errorInfo, this.handleReset)
      }

      // Default fallback UI
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
          <div className="max-w-lg w-full bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6">
            {/* Icon and title */}
            <div className="flex items-center gap-3 mb-4">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  Something went wrong
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {errorMessage || 'An unexpected error occurred in the application'}
                </p>
              </div>
            </div>

            {/* Error details (only in development or if explicitly enabled) */}
            {showDetails && (
              <div className="mb-4 p-4 bg-gray-100 dark:bg-gray-900 rounded border border-gray-200 dark:border-gray-700">
                <p className="text-xs font-mono text-red-600 dark:text-red-400 mb-2">
                  {error.toString()}
                </p>
                {errorInfo?.componentStack && (
                  <details className="text-xs font-mono text-gray-600 dark:text-gray-400">
                    <summary className="cursor-pointer hover:text-gray-900 dark:hover:text-gray-200">
                      Component stack
                    </summary>
                    <pre className="mt-2 overflow-auto max-h-48 text-[10px]">
                      {errorInfo.componentStack}
                    </pre>
                  </details>
                )}
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-2">
              <Button
                onClick={this.handleReset}
                variant="primary"
                className="flex-1"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Try again
              </Button>
              <Button
                onClick={this.handleReload}
                variant="secondary"
                className="flex-1"
              >
                Reload page
              </Button>
              <Button
                onClick={this.handleGoHome}
                variant="ghost"
                className="flex-1"
              >
                <Home className="w-4 h-4 mr-2" />
                Go home
              </Button>
            </div>

            {/* Additional help */}
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                If this problem persists, please try clearing your browser cache or contact support.
              </p>
            </div>
          </div>
        </div>
      )
    }

    return children
  }
}

/**
 * Error boundary for specific sections of the app
 *
 * Shows a simpler inline error message instead of full-screen.
 *
 * @example
 * ```tsx
 * <SectionErrorBoundary sectionName="Module Editor">
 *   <ModuleEditor />
 * </SectionErrorBoundary>
 * ```
 */
export function SectionErrorBoundary({
  children,
  sectionName = 'this section',
}: {
  children: ReactNode
  sectionName?: string
}) {
  return (
    <ErrorBoundary
      errorMessage={`An error occurred in ${sectionName}`}
      fallback={(error, _, reset) => (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-semibold text-red-900 dark:text-red-100 mb-1">
                Error in {sectionName}
              </h3>
              <p className="text-xs text-red-700 dark:text-red-300 mb-2">
                {error.message}
              </p>
              <Button
                onClick={reset}
                variant="secondary"
                size="sm"
              >
                <RefreshCw className="w-3 h-3 mr-1" />
                Retry
              </Button>
            </div>
          </div>
        </div>
      )}
    >
      {children}
    </ErrorBoundary>
  )
}

export default ErrorBoundary
