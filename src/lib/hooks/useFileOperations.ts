// ============================================================================
// FILE OPERATIONS HOOKS - Config load/save with React integration
// ============================================================================

import { useState, useCallback } from 'react'
import { useConfigStore } from '../../store/config-store'
import {
  loadConfiguration,
  saveConfiguration,
  configExists,
  type LoadResult,
  type SaveResult,
  type LoadOptions,
  type SaveOptions,
} from '../utils/file-operations'

// ============================================================================
// TYPES
// ============================================================================

interface LoadState {
  isLoading: boolean
  error: string | null
  warnings: string[]
}

interface SaveState {
  isSaving: boolean
  error: string | null
  lastSaved: Date | null
}

// ============================================================================
// HOOKS
// ============================================================================

/**
 * Hook for loading Waybar configuration
 * Provides loading state and error handling
 *
 * Usage:
 * ```tsx
 * const { load, isLoading, error, warnings } = useLoadConfig()
 *
 * const handleLoad = async () => {
 *   const result = await load()
 *   if (result) {
 *     console.log('Config loaded:', result.config)
 *   }
 * }
 * ```
 */
export function useLoadConfig() {
  const loadConfig = useConfigStore((state) => state.loadConfig)
  const [state, setState] = useState<LoadState>({
    isLoading: false,
    error: null,
    warnings: [],
  })

  const load = useCallback(
    async (options?: LoadOptions): Promise<LoadResult | null> => {
      setState({ isLoading: true, error: null, warnings: [] })

      try {
        const result = await loadConfiguration(options)

        // Update config store with config and path
        loadConfig(result.config, result.paths.config_file)

        setState({
          isLoading: false,
          error: null,
          warnings: result.warnings,
        })

        return result
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error'
        setState({
          isLoading: false,
          error: errorMessage,
          warnings: [],
        })
        return null
      }
    },
    [loadConfig]
  )

  return {
    load,
    isLoading: state.isLoading,
    error: state.error,
    warnings: state.warnings,
  }
}

/**
 * Hook for saving Waybar configuration
 * Provides saving state and error handling
 *
 * Usage:
 * ```tsx
 * const { save, isSaving, error, lastSaved } = useSaveConfig()
 *
 * const handleSave = async () => {
 *   const result = await save()
 *   if (result) {
 *     console.log('Config saved to:', result.paths.config_file)
 *   }
 * }
 * ```
 */
export function useSaveConfig() {
  const config = useConfigStore((state) => state.config)
  const markClean = useConfigStore((state) => state.markClean)
  const [state, setState] = useState<SaveState>({
    isSaving: false,
    error: null,
    lastSaved: null,
  })

  const save = useCallback(
    async (options?: SaveOptions): Promise<SaveResult | null> => {
      setState(prev => ({ ...prev, isSaving: true, error: null }))

      try {
        const result = await saveConfiguration(config, options)

        // Mark config as clean (no unsaved changes)
        markClean()

        setState({
          isSaving: false,
          error: null,
          lastSaved: new Date(),
        })

        return result
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error'
        setState(prev => ({
          ...prev,
          isSaving: false,
          error: errorMessage,
        }))
        return null
      }
    },
    [config, markClean]
  )

  return {
    save,
    isSaving: state.isSaving,
    error: state.error,
    lastSaved: state.lastSaved,
  }
}

/**
 * Hook to check if Waybar config exists
 * Useful for onboarding flow
 *
 * Usage:
 * ```tsx
 * const { exists, isChecking, check } = useConfigExists()
 *
 * useEffect(() => {
 *   check()
 * }, [])
 *
 * if (isChecking) return <Loading />
 * if (!exists) return <OnboardingWizard />
 * ```
 */
export function useConfigExists() {
  const [exists, setExists] = useState<boolean | null>(null)
  const [isChecking, setIsChecking] = useState(false)

  const check = useCallback(async () => {
    setIsChecking(true)
    try {
      const result = await configExists()
      setExists(result)
    } catch {
      setExists(false)
    } finally {
      setIsChecking(false)
    }
  }, [])

  return {
    exists,
    isChecking,
    check,
  }
}

/**
 * Combined hook for load and save operations
 * Provides complete file operation interface
 *
 * Usage:
 * ```tsx
 * const { load, save, isLoading, isSaving, error } = useConfigFile()
 * ```
 */
export function useConfigFile() {
  const { load, isLoading, error: loadError, warnings } = useLoadConfig()
  const { save, isSaving, error: saveError, lastSaved } = useSaveConfig()

  return {
    // Load
    load,
    isLoading,
    loadError,
    warnings,

    // Save
    save,
    isSaving,
    saveError,
    lastSaved,

    // Combined
    isOperating: isLoading || isSaving,
    error: loadError || saveError,
  }
}
