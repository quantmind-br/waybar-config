// ============================================================================
// THEME HOOK - Dark/Light theme management
// ============================================================================

import { useEffect, useCallback } from 'react'
import { useUIStore } from '../../store/ui-store'

export type Theme = 'light' | 'dark' | 'system'

/**
 * Hook for managing application theme
 *
 * Handles theme switching between light, dark, and system modes.
 * Applies theme to document element and syncs with system preferences.
 *
 * @example
 * ```tsx
 * const { theme, setTheme, actualTheme } = useTheme()
 *
 * <button onClick={() => setTheme('dark')}>
 *   Dark Mode
 * </button>
 * ```
 */
export function useTheme() {
  const theme = useUIStore((state) => state.theme)
  const setThemeStore = useUIStore((state) => state.setTheme)

  /**
   * Get the actual theme being applied (resolves 'system' to 'light' or 'dark')
   */
  const getActualTheme = useCallback((): 'light' | 'dark' => {
    if (theme === 'system') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
    }
    return theme
  }, [theme])

  /**
   * Apply theme to document
   */
  const applyTheme = useCallback((appliedTheme: 'light' | 'dark') => {
    const root = document.documentElement

    if (appliedTheme === 'dark') {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }

    // Update meta theme-color for mobile browsers
    const metaThemeColor = document.querySelector('meta[name="theme-color"]')
    if (metaThemeColor) {
      metaThemeColor.setAttribute(
        'content',
        appliedTheme === 'dark' ? '#1f2937' : '#ffffff'
      )
    }
  }, [])

  /**
   * Set theme preference
   */
  const setTheme = useCallback(
    (newTheme: Theme) => {
      setThemeStore(newTheme)
    },
    [setThemeStore]
  )

  /**
   * Toggle between light and dark (respecting system preference)
   */
  const toggleTheme = useCallback(() => {
    const actualTheme = getActualTheme()
    setTheme(actualTheme === 'dark' ? 'light' : 'dark')
  }, [getActualTheme, setTheme])

  /**
   * Cycle through all theme options
   */
  const cycleTheme = useCallback(() => {
    const order: Theme[] = ['light', 'dark', 'system']
    const currentIndex = order.indexOf(theme)
    const nextIndex = (currentIndex + 1) % order.length
    setTheme(order[nextIndex])
  }, [theme, setTheme])

  // Apply theme on mount and when theme changes
  useEffect(() => {
    const actualTheme = getActualTheme()
    applyTheme(actualTheme)
  }, [theme, getActualTheme, applyTheme])

  // Listen for system theme changes when theme is 'system'
  useEffect(() => {
    if (theme !== 'system') return

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')

    const handleChange = (e: MediaQueryListEvent) => {
      applyTheme(e.matches ? 'dark' : 'light')
    }

    // Modern browsers
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange)
      return () => mediaQuery.removeEventListener('change', handleChange)
    }
    // Legacy browsers
    else if (mediaQuery.addListener) {
      mediaQuery.addListener(handleChange)
      return () => mediaQuery.removeListener(handleChange)
    }
  }, [theme, applyTheme])

  return {
    /** Current theme preference ('light', 'dark', or 'system') */
    theme,
    /** Set theme preference */
    setTheme,
    /** Toggle between light and dark */
    toggleTheme,
    /** Cycle through all theme options */
    cycleTheme,
    /** Actual theme being applied (resolves 'system' to 'light' or 'dark') */
    actualTheme: getActualTheme(),
    /** Whether dark mode is currently active */
    isDark: getActualTheme() === 'dark',
  }
}

export default useTheme
