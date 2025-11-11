// ============================================================================
// VALIDATION STATE STORE
// ============================================================================

import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

// ============================================================================
// STATE INTERFACES
// ============================================================================

/**
 * Validation error for a specific field
 */
export interface ValidationError {
  field: string
  message: string
}

/**
 * Validation warning (non-blocking)
 */
export interface ValidationWarning {
  field: string
  message: string
}

interface ValidationState {
  // Errors by field path (e.g., "bars.0.config.height")
  errors: Record<string, string[]>

  // Warnings by field path
  warnings: Record<string, string[]>

  // Validation in progress
  isValidating: boolean

  // Overall validation status
  isValid: boolean
}

interface ValidationActions {
  // Error management
  setErrors: (errors: Record<string, string[]>) => void
  addError: (field: string, message: string) => void
  clearError: (field: string) => void
  clearAllErrors: () => void

  // Warning management
  setWarnings: (warnings: Record<string, string[]>) => void
  addWarning: (field: string, message: string) => void
  clearWarning: (field: string) => void
  clearAllWarnings: () => void

  // Validation status
  setValidating: (isValidating: boolean) => void
  setValid: (isValid: boolean) => void

  // Validate config
  validateConfig: () => Promise<void>
}

type ValidationStore = ValidationState & ValidationActions

// ============================================================================
// STORE IMPLEMENTATION
// ============================================================================

export const useValidationStore = create<ValidationStore>()(
  devtools(
    (set) => ({
      // ============================================================================
      // INITIAL STATE
      // ============================================================================
      errors: {},
      warnings: {},
      isValidating: false,
      isValid: true,

      // ============================================================================
      // ERROR ACTIONS
      // ============================================================================

      setErrors: (errors) =>
        set({
          errors,
          isValid: Object.keys(errors).length === 0,
        }),

      addError: (field, message) =>
        set((state) => {
          const fieldErrors = state.errors[field] || []
          return {
            errors: {
              ...state.errors,
              [field]: [...fieldErrors, message],
            },
            isValid: false,
          }
        }),

      clearError: (field) =>
        set((state) => {
          const { [field]: _, ...rest } = state.errors
          return {
            errors: rest,
            isValid: Object.keys(rest).length === 0,
          }
        }),

      clearAllErrors: () =>
        set({
          errors: {},
          isValid: true,
        }),

      // ============================================================================
      // WARNING ACTIONS
      // ============================================================================

      setWarnings: (warnings) => set({ warnings }),

      addWarning: (field, message) =>
        set((state) => {
          const fieldWarnings = state.warnings[field] || []
          return {
            warnings: {
              ...state.warnings,
              [field]: [...fieldWarnings, message],
            },
          }
        }),

      clearWarning: (field) =>
        set((state) => {
          const { [field]: _, ...rest } = state.warnings
          return { warnings: rest }
        }),

      clearAllWarnings: () => set({ warnings: {} }),

      // ============================================================================
      // VALIDATION STATUS
      // ============================================================================

      setValidating: (isValidating) => set({ isValidating }),

      setValid: (isValid) => set({ isValid }),

      // ============================================================================
      // CONFIG VALIDATION
      // ============================================================================

      validateConfig: async () => {
        set({ isValidating: true })

        try {
          // TODO: Implement actual validation using Zod schemas
          // This is a placeholder that will be implemented in Phase 10

          // Simulate validation delay
          await new Promise((resolve) => setTimeout(resolve, 100))

          // For now, mark as valid
          set({
            errors: {},
            warnings: {},
            isValid: true,
            isValidating: false,
          })
        } catch (error) {
          set({
            isValidating: false,
            isValid: false,
          })
        }
      },
    }),
    { name: 'ValidationStore' }
  )
)

// ============================================================================
// SELECTOR HOOKS
// ============================================================================

/**
 * Get errors for a specific field
 */
export const useFieldErrors = (field: string) =>
  useValidationStore((state) => state.errors[field] || [])

/**
 * Get warnings for a specific field
 */
export const useFieldWarnings = (field: string) =>
  useValidationStore((state) => state.warnings[field] || [])

/**
 * Check if a field has errors
 */
export const useHasFieldError = (field: string) =>
  useValidationStore((state) => {
    const errors = state.errors[field]
    return errors && errors.length > 0
  })

/**
 * Get total error count
 */
export const useErrorCount = () =>
  useValidationStore((state) => Object.keys(state.errors).length)

/**
 * Get total warning count
 */
export const useWarningCount = () =>
  useValidationStore((state) => Object.keys(state.warnings).length)
