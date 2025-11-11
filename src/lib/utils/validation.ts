// ============================================================================
// VALIDATION UTILITIES - Zod-based Configuration Validation
// ============================================================================

import { z } from 'zod'
import {
  BarConfigSchema,
  BarDefinitionSchema,
  StyleDefinitionSchema,
  WaybarConfigSchema,
} from '../schemas/bar-config'
import { ModuleInstanceSchema } from '../schemas/modules'
import { ModuleSchemas } from '../schemas/module-specific'
import type {
  ModuleInstance,
  StyleDefinition,
  WaybarConfig,
} from '../types/config'

// ============================================================================
// TYPES
// ============================================================================

/**
 * Flat error format for form display
 * Example: { "bars.0.config.height": ["Must be a positive integer"] }
 */
export type ValidationErrors = Record<string, string[]>

/**
 * Validation result with success status and errors
 */
export interface ValidationResult {
  success: boolean
  errors: ValidationErrors
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Flatten Zod errors into a simple object for form display
 * Converts Zod error format to { fieldPath: [errors] }
 */
function flattenZodErrors(error: z.ZodError): ValidationErrors {
  const errors: ValidationErrors = {}

  for (const issue of error.issues) {
    const path = issue.path.join('.')
    if (!errors[path]) {
      errors[path] = []
    }
    errors[path].push(issue.message)
  }

  return errors
}

// ============================================================================
// BAR CONFIGURATION VALIDATION
// ============================================================================

/**
 * Validate bar-level configuration
 * Checks positioning, dimensions, spacing, and behavior settings
 */
export function validateBarConfig(config: unknown): ValidationResult {
  const result = BarConfigSchema.safeParse(config)

  if (result.success) {
    return { success: true, errors: {} }
  }

  return {
    success: false,
    errors: flattenZodErrors(result.error),
  }
}

/**
 * Validate full bar definition including modules
 */
export function validateBarDefinition(bar: unknown): ValidationResult {
  const result = BarDefinitionSchema.safeParse(bar)

  if (result.success) {
    return { success: true, errors: {} }
  }

  return {
    success: false,
    errors: flattenZodErrors(result.error),
  }
}

// ============================================================================
// MODULE VALIDATION
// ============================================================================

/**
 * Validate module instance structure
 * Validates id, type, position, order, enabled fields
 */
export function validateModuleInstance(module: unknown): ValidationResult {
  const result = ModuleInstanceSchema.safeParse(module)

  if (result.success) {
    return { success: true, errors: {} }
  }

  return {
    success: false,
    errors: flattenZodErrors(result.error),
  }
}

/**
 * Validate module configuration based on module type
 * Uses module-specific schemas for detailed validation
 */
export function validateModule(module: ModuleInstance): ValidationResult {
  // First validate the module instance structure
  const instanceResult = validateModuleInstance(module)
  if (!instanceResult.success) {
    return instanceResult
  }

  // Then validate module-specific configuration
  const moduleSchema = ModuleSchemas[module.type]
  if (!moduleSchema) {
    return {
      success: false,
      errors: {
        type: [`Unknown module type: ${module.type}`],
      },
    }
  }

  const configResult = moduleSchema.safeParse(module.config)

  if (configResult.success) {
    return { success: true, errors: {} }
  }

  // Prefix errors with "config." to show they're in the config object
  const errors = flattenZodErrors(configResult.error)
  const prefixedErrors: ValidationErrors = {}
  for (const [path, messages] of Object.entries(errors)) {
    prefixedErrors[`config.${path}`] = messages
  }

  return {
    success: false,
    errors: prefixedErrors,
  }
}

// ============================================================================
// STYLE VALIDATION
// ============================================================================

/**
 * Validate CSS style definition
 * Checks selector, properties array, and CSS property structure
 */
export function validateStyle(style: unknown): ValidationResult {
  const result = StyleDefinitionSchema.safeParse(style)

  if (result.success) {
    return { success: true, errors: {} }
  }

  return {
    success: false,
    errors: flattenZodErrors(result.error),
  }
}

/**
 * Validate all styles in configuration
 */
export function validateStyles(styles: StyleDefinition[]): ValidationResult {
  const allErrors: ValidationErrors = {}
  let hasErrors = false

  for (let i = 0; i < styles.length; i++) {
    const result = validateStyle(styles[i])
    if (!result.success) {
      hasErrors = true
      // Prefix errors with "styles.{index}." to identify which style has errors
      for (const [path, messages] of Object.entries(result.errors)) {
        allErrors[`styles.${i}.${path}`] = messages
      }
    }
  }

  return {
    success: !hasErrors,
    errors: allErrors,
  }
}

// ============================================================================
// MODULE CONFLICT DETECTION
// ============================================================================

/**
 * Check for duplicate module IDs within a bar
 * Module IDs must be unique within a single bar
 * Example conflict: two modules with customName "bat0" for type "battery"
 */
export function detectModuleConflicts(
  modules: ModuleInstance[]
): ValidationResult {
  const errors: ValidationErrors = {}
  const seenIds = new Set<string>()
  let hasConflicts = false

  for (let i = 0; i < modules.length; i++) {
    const module = modules[i]
    // Generate Waybar module ID: type + customName (if exists)
    const waybarId = module.customName
      ? `${module.type}#${module.customName}`
      : module.type

    if (seenIds.has(waybarId)) {
      hasConflicts = true
      errors[`modules.${i}`] = [
        `Duplicate module ID: ${waybarId}. Module IDs must be unique within a bar.`,
      ]
    } else {
      seenIds.add(waybarId)
    }
  }

  return {
    success: !hasConflicts,
    errors,
  }
}

// ============================================================================
// FULL CONFIGURATION VALIDATION
// ============================================================================

/**
 * Validate complete Waybar configuration
 * Runs all validation checks including:
 * - Bar definitions and configurations
 * - Module instances and configurations
 * - Style definitions
 * - Module conflict detection
 */
export function validateFullConfig(config: WaybarConfig): ValidationResult {
  // Validate root config structure
  const rootResult = WaybarConfigSchema.safeParse(config)
  if (!rootResult.success) {
    return {
      success: false,
      errors: flattenZodErrors(rootResult.error),
    }
  }

  const allErrors: ValidationErrors = {}
  let hasErrors = false

  // Validate each bar
  for (let barIndex = 0; barIndex < config.bars.length; barIndex++) {
    const bar = config.bars[barIndex]

    // Validate bar definition
    const barResult = validateBarDefinition(bar)
    if (!barResult.success) {
      hasErrors = true
      for (const [path, messages] of Object.entries(barResult.errors)) {
        allErrors[`bars.${barIndex}.${path}`] = messages
      }
    }

    // Validate each module in the bar
    for (let modIndex = 0; modIndex < bar.modules.length; modIndex++) {
      const module = bar.modules[modIndex]
      const moduleResult = validateModule(module)
      if (!moduleResult.success) {
        hasErrors = true
        for (const [path, messages] of Object.entries(moduleResult.errors)) {
          allErrors[`bars.${barIndex}.modules.${modIndex}.${path}`] = messages
        }
      }
    }

    // Check for module conflicts within this bar
    const conflictResult = detectModuleConflicts(bar.modules)
    if (!conflictResult.success) {
      hasErrors = true
      for (const [path, messages] of Object.entries(conflictResult.errors)) {
        allErrors[`bars.${barIndex}.${path}`] = messages
      }
    }
  }

  // Validate styles
  const stylesResult = validateStyles(config.styles)
  if (!stylesResult.success) {
    hasErrors = true
    Object.assign(allErrors, stylesResult.errors)
  }

  return {
    success: !hasErrors,
    errors: allErrors,
  }
}

// ============================================================================
// CONVENIENCE EXPORTS
// ============================================================================

/**
 * Validate any configuration component and return user-friendly errors
 */
export const validate = {
  barConfig: validateBarConfig,
  barDefinition: validateBarDefinition,
  module: validateModule,
  moduleInstance: validateModuleInstance,
  style: validateStyle,
  styles: validateStyles,
  fullConfig: validateFullConfig,
  conflicts: detectModuleConflicts,
}
