// ============================================================================
// FILE OPERATIONS - High-level config load/save operations
// ============================================================================

import {
  detectConfigPaths,
  loadConfig as loadConfigFile,
  saveConfig as saveConfigFile,
  loadCSS as loadCSSFile,
  saveCSS as saveCSSFile,
  type ConfigPaths,
  type WaybarConfigFile,
} from '../tauri/commands'
import {
  jsonToWaybarConfig,
  waybarConfigToJSON,
  stylesToCSS,
  cssToStyles,
  type TransformResult,
} from './config-transform'
import { validateFullConfig, type ValidationResult } from './validation'
import type { WaybarConfig } from '../types/config'

// ============================================================================
// TYPES
// ============================================================================

/**
 * Result of loading configuration with validation and warnings
 */
export interface LoadResult {
  config: WaybarConfig
  paths: ConfigPaths
  validationResult: ValidationResult
  warnings: string[]
}

/**
 * Result of saving configuration
 */
export interface SaveResult {
  success: boolean
  paths: ConfigPaths
  backupCreated: boolean
}

/**
 * Load options
 */
export interface LoadOptions {
  /** If true, continues even if validation fails */
  ignoreValidationErrors?: boolean
  /** If true, merges with existing config instead of replacing */
  mergeWithExisting?: boolean
  /** Existing config to merge with (required if mergeWithExisting is true) */
  existingConfig?: WaybarConfig
}

/**
 * Save options
 */
export interface SaveOptions {
  /** If true, validates before saving and throws if invalid */
  validateBeforeSave?: boolean
  /** If true, adds helpful comments to generated JSON */
  addComments?: boolean
  /** Custom config paths (if not provided, will detect automatically) */
  paths?: ConfigPaths
}

// ============================================================================
// LOAD CONFIGURATION FLOW
// ============================================================================

/**
 * Load complete Waybar configuration from disk
 *
 * Flow:
 * 1. Detect config paths
 * 2. Load config JSON file
 * 3. Load CSS file
 * 4. Parse JSON to WaybarConfig
 * 5. Parse CSS to StyleDefinitions
 * 6. Validate complete config
 * 7. Return config with validation results
 *
 * @param options - Load options
 * @returns Complete configuration with validation results
 * @throws Error if loading fails or validation fails (when ignoreValidationErrors is false)
 */
export async function loadConfiguration(
  options: LoadOptions = {}
): Promise<LoadResult> {
  const warnings: string[] = []

  try {
    // Step 1: Detect config paths
    const paths = await detectConfigPaths()

    // Step 2: Load config JSON file
    let configFile: WaybarConfigFile
    try {
      configFile = await loadConfigFile(paths.config_file)
    } catch (error) {
      throw new Error(`Failed to load configuration file: ${error}`)
    }

    // Step 3: Load CSS file
    let cssContent = ''
    try {
      cssContent = await loadCSSFile(paths.style_file)
    } catch (error) {
      // CSS file is optional, so just warn
      warnings.push(`Failed to load CSS file: ${error}`)
    }

    // Step 4: Parse JSON to WaybarConfig
    let waybarJSON: any
    try {
      waybarJSON = JSON.parse(configFile.content)
    } catch (error) {
      throw new Error(`Failed to parse configuration JSON: ${error}`)
    }

    const configResult: TransformResult<WaybarConfig> = jsonToWaybarConfig(
      waybarJSON,
      options.existingConfig
    )

    warnings.push(...configResult.warnings)

    // Step 5: Parse CSS to StyleDefinitions
    if (cssContent) {
      const cssResult = cssToStyles(cssContent)
      warnings.push(...cssResult.warnings)

      // Merge parsed styles with config
      configResult.data.styles = cssResult.data
    }

    // Step 6: Validate complete config
    const validationResult = validateFullConfig(configResult.data)

    // Step 7: Check validation results
    if (!validationResult.success && !options.ignoreValidationErrors) {
      const errorCount = Object.keys(validationResult.errors).length
      throw new Error(
        `Configuration validation failed with ${errorCount} error(s). ` +
        `Use ignoreValidationErrors option to load anyway.`
      )
    }

    // Update metadata
    configResult.data.metadata.modifiedAt = new Date().toISOString()

    return {
      config: configResult.data,
      paths,
      validationResult,
      warnings,
    }
  } catch (error) {
    if (error instanceof Error) {
      throw error
    }
    throw new Error(`Unknown error while loading configuration: ${error}`)
  }
}

/**
 * Load configuration from specific paths
 * Useful for loading custom or backup configs
 *
 * @param configPath - Path to config JSON file
 * @param cssPath - Path to CSS file (optional)
 * @param options - Load options
 * @returns Complete configuration with validation results
 */
export async function loadConfigurationFromPaths(
  configPath: string,
  cssPath?: string,
  options: LoadOptions = {}
): Promise<LoadResult> {
  const warnings: string[] = []

  // Load config file
  const configFile = await loadConfigFile(configPath)

  // Load CSS file if provided
  let cssContent = ''
  if (cssPath) {
    try {
      cssContent = await loadCSSFile(cssPath)
    } catch (error) {
      warnings.push(`Failed to load CSS file: ${error}`)
    }
  }

  // Parse and transform
  const waybarJSON = JSON.parse(configFile.content)
  const configResult = jsonToWaybarConfig(waybarJSON, options.existingConfig)
  warnings.push(...configResult.warnings)

  if (cssContent) {
    const cssResult = cssToStyles(cssContent)
    warnings.push(...cssResult.warnings)
    configResult.data.styles = cssResult.data
  }

  // Validate
  const validationResult = validateFullConfig(configResult.data)

  if (!validationResult.success && !options.ignoreValidationErrors) {
    throw new Error(
      `Configuration validation failed. Use ignoreValidationErrors to load anyway.`
    )
  }

  // Create pseudo paths for result
  const paths: ConfigPaths = {
    config_dir: configPath.substring(0, configPath.lastIndexOf('/')),
    config_file: configPath,
    style_file: cssPath || '',
  }

  return {
    config: configResult.data,
    paths,
    validationResult,
    warnings,
  }
}

// ============================================================================
// SAVE CONFIGURATION FLOW
// ============================================================================

/**
 * Save complete Waybar configuration to disk
 *
 * Flow:
 * 1. Validate config (if validateBeforeSave is true)
 * 2. Convert WaybarConfig to Waybar JSON
 * 3. Convert StyleDefinitions to CSS
 * 4. Detect or use provided config paths
 * 5. Save config JSON (creates backup automatically)
 * 6. Save CSS file (creates backup automatically)
 * 7. Return save result
 *
 * @param config - Complete configuration to save
 * @param options - Save options
 * @returns Save result with paths
 * @throws Error if validation fails or save fails
 */
export async function saveConfiguration(
  config: WaybarConfig,
  options: SaveOptions = {}
): Promise<SaveResult> {
  try {
    // Step 1: Validate if requested
    if (options.validateBeforeSave !== false) {
      const validationResult = validateFullConfig(config)

      if (!validationResult.success) {
        const errorCount = Object.keys(validationResult.errors).length
        const errorList = Object.entries(validationResult.errors)
          .slice(0, 3)
          .map(([path, messages]) => `${path}: ${messages.join(', ')}`)
          .join('\n')

        throw new Error(
          `Cannot save invalid configuration. Found ${errorCount} error(s):\n${errorList}` +
          (errorCount > 3 ? `\n... and ${errorCount - 3} more` : '')
        )
      }
    }

    // Step 2: Convert to Waybar JSON
    const waybarJSON = waybarConfigToJSON(config)
    const jsonString = JSON.stringify(waybarJSON, null, 2)

    // Step 3: Convert styles to CSS
    const cssString = stylesToCSS(config.styles)

    // Step 4: Get config paths
    const paths = options.paths || await detectConfigPaths()

    // Step 5: Save config JSON (backend creates backup automatically)
    try {
      await saveConfigFile(paths.config_file, jsonString)
    } catch (error) {
      throw new Error(`Failed to save configuration file: ${error}`)
    }

    // Step 6: Save CSS file (backend creates backup automatically)
    if (cssString.trim()) {
      try {
        await saveCSSFile(paths.style_file, cssString)
      } catch (error) {
        // CSS save failure is not critical
        console.error(`Warning: Failed to save CSS file: ${error}`)
      }
    }

    return {
      success: true,
      paths,
      backupCreated: true,
    }
  } catch (error) {
    if (error instanceof Error) {
      throw error
    }
    throw new Error(`Unknown error while saving configuration: ${error}`)
  }
}

/**
 * Save configuration to specific paths
 * Useful for exporting configs to custom locations
 *
 * @param config - Complete configuration to save
 * @param configPath - Path to save config JSON
 * @param cssPath - Path to save CSS
 * @param options - Save options
 * @returns Save result
 */
export async function saveConfigurationToPaths(
  config: WaybarConfig,
  configPath: string,
  cssPath: string,
  options: Omit<SaveOptions, 'paths'> = {}
): Promise<SaveResult> {
  const paths: ConfigPaths = {
    config_dir: configPath.substring(0, configPath.lastIndexOf('/')),
    config_file: configPath,
    style_file: cssPath,
  }

  return saveConfiguration(config, {
    ...options,
    paths,
  })
}

// ============================================================================
// CONVENIENCE FUNCTIONS
// ============================================================================

/**
 * Quick load with default options
 * Ignores validation errors and loads existing config
 */
export async function quickLoad(): Promise<WaybarConfig> {
  const result = await loadConfiguration({
    ignoreValidationErrors: true,
  })
  return result.config
}

/**
 * Quick save with default options
 * Validates before saving
 */
export async function quickSave(config: WaybarConfig): Promise<void> {
  await saveConfiguration(config, {
    validateBeforeSave: true,
  })
}

/**
 * Check if Waybar config exists at standard location
 */
export async function configExists(): Promise<boolean> {
  try {
    await detectConfigPaths()
    return true
  } catch {
    return false
  }
}

// ============================================================================
// EXPORTS
// ============================================================================

export const fileOps = {
  load: loadConfiguration,
  loadFrom: loadConfigurationFromPaths,
  save: saveConfiguration,
  saveTo: saveConfigurationToPaths,
  quickLoad,
  quickSave,
  configExists,
}
