// ============================================================================
// TOGGLE - Toggle Switch Component
// ============================================================================

import { forwardRef, InputHTMLAttributes } from 'react'

// ============================================================================
// TYPES
// ============================================================================

export interface ToggleProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string
  description?: string
}

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * Toggle switch component (checkbox-based)
 *
 * Features:
 * - Label support
 * - Optional description
 * - Smooth animation
 * - Keyboard accessible (Space/Enter)
 * - Proper ARIA attributes
 * - Disabled state styling
 */
export const Toggle = forwardRef<HTMLInputElement, ToggleProps>(
  (
    {
      label,
      description,
      id,
      checked,
      disabled,
      className = '',
      ...props
    },
    ref
  ) => {
    const toggleId = id || `toggle-${Math.random().toString(36).substr(2, 9)}`

    return (
      <div className={`flex items-start gap-3 ${className}`}>
        {/* Toggle Switch */}
        <button
          type="button"
          role="switch"
          aria-checked={checked}
          aria-labelledby={label ? `${toggleId}-label` : undefined}
          aria-describedby={description ? `${toggleId}-description` : undefined}
          disabled={disabled}
          onClick={() => {
            const input = document.getElementById(toggleId) as HTMLInputElement
            if (input) {
              input.click()
            }
          }}
          className={`
            relative
            inline-flex
            h-6
            w-11
            flex-shrink-0
            cursor-pointer
            rounded-full
            border-2
            border-transparent
            transition-colors
            duration-200
            ease-in-out
            focus:outline-none
            focus:ring-2
            focus:ring-blue-500
            focus:ring-offset-2
            focus:ring-offset-gray-900
            disabled:cursor-not-allowed
            disabled:opacity-50
            ${
              checked
                ? 'bg-blue-600'
                : 'bg-gray-700'
            }
          `}
        >
          <span
            className={`
              pointer-events-none
              inline-block
              h-5
              w-5
              transform
              rounded-full
              bg-white
              shadow
              ring-0
              transition
              duration-200
              ease-in-out
              ${
                checked
                  ? 'translate-x-5'
                  : 'translate-x-0'
              }
            `}
          />
        </button>

        {/* Hidden Checkbox (for form integration) */}
        <input
          ref={ref}
          type="checkbox"
          id={toggleId}
          checked={checked}
          disabled={disabled}
          className="sr-only"
          {...props}
        />

        {/* Label and Description */}
        {(label || description) && (
          <div className="flex flex-col">
            {label && (
              <label
                id={`${toggleId}-label`}
                htmlFor={toggleId}
                className={`
                  text-sm
                  font-medium
                  ${
                    disabled
                      ? 'cursor-not-allowed text-gray-600'
                      : 'cursor-pointer text-gray-300'
                  }
                `}
              >
                {label}
              </label>
            )}
            {description && (
              <span
                id={`${toggleId}-description`}
                className="text-xs text-gray-500"
              >
                {description}
              </span>
            )}
          </div>
        )}
      </div>
    )
  }
)

Toggle.displayName = 'Toggle'
