// ============================================================================
// VALIDATION HOOKS - Debounced Real-time Validation
// ============================================================================

import { useEffect, useCallback, useRef } from 'react'
import { useConfigStore } from '../../store/config-store'
import { useValidationStore } from '../../store/validation-store'

// ============================================================================
// CONSTANTS
// ============================================================================

/**
 * Debounce delay for validation (300ms as specified in PRP)
 */
const VALIDATION_DEBOUNCE_MS = 300

// ============================================================================
// HOOKS
// ============================================================================

/**
 * Hook for automatic validation with debouncing
 * Watches config changes and triggers validation after debounce period
 */
export function useAutoValidation() {
  const config = useConfigStore((state) => state.config)
  const validateConfig = useValidationStore((state) => state.validateConfig)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  const debouncedValidate = useCallback(() => {
    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    // Set new timeout
    timeoutRef.current = setTimeout(() => {
      validateConfig()
    }, VALIDATION_DEBOUNCE_MS)
  }, [validateConfig])

  // Trigger validation when config changes
  useEffect(() => {
    debouncedValidate()

    // Cleanup on unmount
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [config, debouncedValidate])
}

/**
 * Hook to manually trigger validation
 * Returns a function that triggers validation immediately
 */
export function useManualValidation() {
  const validateConfig = useValidationStore((state) => state.validateConfig)

  return useCallback(() => {
    validateConfig()
  }, [validateConfig])
}

/**
 * Hook to check if configuration is valid
 * Returns validation status and error/warning counts
 */
export function useValidationStatus() {
  const isValid = useValidationStore((state) => state.isValid)
  const isValidating = useValidationStore((state) => state.isValidating)
  const errors = useValidationStore((state) => state.errors)
  const warnings = useValidationStore((state) => state.warnings)

  const errorCount = Object.keys(errors).length
  const warningCount = Object.keys(warnings).length

  return {
    isValid,
    isValidating,
    errorCount,
    warningCount,
    hasErrors: errorCount > 0,
    hasWarnings: warningCount > 0,
  }
}

/**
 * Hook to get errors for a specific field path
 * Example: useFieldValidation('bars.0.config.height')
 */
export function useFieldValidation(fieldPath: string) {
  const errors = useValidationStore((state) => state.errors[fieldPath])
  const warnings = useValidationStore((state) => state.warnings[fieldPath])

  return {
    errors: errors || [],
    warnings: warnings || [],
    hasError: errors && errors.length > 0,
    hasWarning: warnings && warnings.length > 0,
  }
}
