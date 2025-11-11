// ============================================================================
// THEME PROVIDER - Initialize and apply theme
// ============================================================================

import { useEffect } from 'react'
import { useTheme } from '../../lib/hooks/useTheme'

export interface ThemeProviderProps {
  children: React.ReactNode
}

/**
 * Theme provider component
 *
 * Initializes theme on app startup and applies it to the document.
 * Should be placed near the root of the application.
 *
 * @example
 * ```tsx
 * <ThemeProvider>
 *   <App />
 * </ThemeProvider>
 * ```
 */
export function ThemeProvider({ children }: ThemeProviderProps) {
  const { theme, actualTheme } = useTheme()

  // Log theme changes in development
  useEffect(() => {
    if (import.meta.env.DEV) {
      console.log(`[Theme] Applied: ${actualTheme} (preference: ${theme})`)
    }
  }, [theme, actualTheme])

  return <>{children}</>
}

export default ThemeProvider
