// ============================================================================
// INPUT - Base Input Component
// ============================================================================

import { InputHTMLAttributes, forwardRef } from 'react'
import { AlertCircle } from 'lucide-react'

// ============================================================================
// TYPES
// ============================================================================

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  helperText?: string
  fullWidth?: boolean
}

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * Base input component with label, error, and helper text
 *
 * Features:
 * - Label support
 * - Error state with message
 * - Helper text
 * - Full width option
 * - Keyboard accessible
 * - Proper ARIA attributes
 */
export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      helperText,
      fullWidth = false,
      id,
      className = '',
      disabled,
      ...props
    },
    ref
  ) => {
    const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`
    const errorId = error ? `${inputId}-error` : undefined
    const helperId = helperText ? `${inputId}-helper` : undefined

    const baseInputStyles = `
      block
      rounded
      border
      bg-gray-800
      px-3
      py-2
      text-sm
      text-gray-100
      placeholder-gray-500
      transition-colors
      focus:outline-none
      focus:ring-2
      focus:ring-offset-2
      focus:ring-offset-gray-900
      disabled:cursor-not-allowed
      disabled:bg-gray-900
      disabled:text-gray-600
    `

    const borderStyles = error
      ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
      : 'border-gray-700 focus:border-blue-500 focus:ring-blue-500'

    const widthStyles = fullWidth ? 'w-full' : ''

    return (
      <div className={fullWidth ? 'w-full' : ''}>
        {/* Label */}
        {label && (
          <label
            htmlFor={inputId}
            className="mb-1 block text-sm font-medium text-gray-300"
          >
            {label}
          </label>
        )}

        {/* Input */}
        <input
          ref={ref}
          id={inputId}
          disabled={disabled}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={
            error ? errorId : helperText ? helperId : undefined
          }
          className={`
            ${baseInputStyles}
            ${borderStyles}
            ${widthStyles}
            ${className}
          `}
          {...props}
        />

        {/* Error Message */}
        {error && (
          <div
            id={errorId}
            className="mt-1 flex items-center gap-1 text-xs text-red-500"
            role="alert"
          >
            <AlertCircle className="h-3 w-3" />
            <span>{error}</span>
          </div>
        )}

        {/* Helper Text */}
        {!error && helperText && (
          <div id={helperId} className="mt-1 text-xs text-gray-500">
            {helperText}
          </div>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'
