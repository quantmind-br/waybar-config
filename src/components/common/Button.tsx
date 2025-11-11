// ============================================================================
// BUTTON - Base Button Component
// ============================================================================

import { ButtonHTMLAttributes, forwardRef } from 'react'

// ============================================================================
// TYPES
// ============================================================================

export type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost'
export type ButtonSize = 'sm' | 'md' | 'lg'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  fullWidth?: boolean
  loading?: boolean
}

// ============================================================================
// VARIANT STYLES
// ============================================================================

const variantStyles: Record<ButtonVariant, string> = {
  primary: `
    bg-blue-600
    text-white
    hover:bg-blue-700
    active:bg-blue-800
    disabled:bg-blue-900
    disabled:text-blue-700
  `,
  secondary: `
    bg-gray-700
    text-gray-100
    hover:bg-gray-600
    active:bg-gray-800
    disabled:bg-gray-900
    disabled:text-gray-700
  `,
  danger: `
    bg-red-600
    text-white
    hover:bg-red-700
    active:bg-red-800
    disabled:bg-red-900
    disabled:text-red-700
  `,
  ghost: `
    bg-transparent
    text-gray-300
    hover:bg-gray-800
    active:bg-gray-700
    disabled:text-gray-700
  `,
}

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'px-2 py-1 text-xs',
  md: 'px-4 py-2 text-sm',
  lg: 'px-6 py-3 text-base',
}

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * Base button component with variants and sizes
 *
 * Variants:
 * - primary: Main action button (blue)
 * - secondary: Secondary actions (gray)
 * - danger: Destructive actions (red)
 * - ghost: Minimal styling
 *
 * Features:
 * - Keyboard accessible
 * - Loading state support
 * - Disabled state styling
 * - Full width option
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      fullWidth = false,
      loading = false,
      disabled,
      className = '',
      children,
      ...props
    },
    ref
  ) => {
    const baseStyles = `
      inline-flex
      items-center
      justify-center
      gap-2
      rounded
      font-medium
      transition-colors
      focus:outline-none
      focus:ring-2
      focus:ring-blue-500
      focus:ring-offset-2
      focus:ring-offset-gray-900
      disabled:cursor-not-allowed
    `

    const widthStyles = fullWidth ? 'w-full' : ''

    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={`
          ${baseStyles}
          ${variantStyles[variant]}
          ${sizeStyles[size]}
          ${widthStyles}
          ${className}
        `}
        {...props}
      >
        {loading && (
          <svg
            className="h-4 w-4 animate-spin"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        )}
        {children}
      </button>
    )
  }
)

Button.displayName = 'Button'
