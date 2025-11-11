// ============================================================================
// SELECT - Base Select Component
// ============================================================================

import { SelectHTMLAttributes, forwardRef } from 'react'
import { AlertCircle, ChevronDown } from 'lucide-react'

// ============================================================================
// TYPES
// ============================================================================

export interface SelectOption {
  value: string
  label: string
  disabled?: boolean
}

export interface SelectProps
  extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'children'> {
  label?: string
  error?: string
  helperText?: string
  fullWidth?: boolean
  options: SelectOption[]
  placeholder?: string
}

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * Base select component with label, error, and helper text
 *
 * Features:
 * - Label support
 * - Error state with message
 * - Helper text
 * - Full width option
 * - Placeholder option
 * - Custom chevron icon
 * - Keyboard accessible
 * - Proper ARIA attributes
 */
export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      label,
      error,
      helperText,
      fullWidth = false,
      options,
      placeholder,
      id,
      className = '',
      disabled,
      ...props
    },
    ref
  ) => {
    const selectId = id || `select-${Math.random().toString(36).substr(2, 9)}`
    const errorId = error ? `${selectId}-error` : undefined
    const helperId = helperText ? `${selectId}-helper` : undefined

    const baseSelectStyles = `
      block
      appearance-none
      rounded
      border
      bg-gray-800
      px-3
      py-2
      pr-10
      text-sm
      text-gray-100
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
            htmlFor={selectId}
            className="mb-1 block text-sm font-medium text-gray-300"
          >
            {label}
          </label>
        )}

        {/* Select Container (for custom chevron) */}
        <div className="relative">
          <select
            ref={ref}
            id={selectId}
            disabled={disabled}
            aria-invalid={error ? 'true' : 'false'}
            aria-describedby={
              error ? errorId : helperText ? helperId : undefined
            }
            className={`
              ${baseSelectStyles}
              ${borderStyles}
              ${widthStyles}
              ${className}
            `}
            {...props}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options.map((option) => (
              <option
                key={option.value}
                value={option.value}
                disabled={option.disabled}
              >
                {option.label}
              </option>
            ))}
          </select>

          {/* Custom Chevron Icon */}
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500">
            <ChevronDown className="h-4 w-4" />
          </div>
        </div>

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

Select.displayName = 'Select'
