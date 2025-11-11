// ============================================================================
// THEME TOGGLE - UI control for theme switching
// ============================================================================

import { Sun, Moon, Monitor } from 'lucide-react'
import { useTheme, type Theme } from '../../lib/hooks/useTheme'
import { Button } from './Button'

export interface ThemeToggleProps {
  /** Show theme label */
  showLabel?: boolean
  /** Button size */
  size?: 'sm' | 'md' | 'lg'
  /** Button variant */
  variant?: 'primary' | 'secondary' | 'ghost'
  /** Custom className */
  className?: string
}

/**
 * Theme toggle button with icon
 *
 * Displays current theme icon and cycles through light/dark/system on click.
 *
 * @example
 * ```tsx
 * <ThemeToggle showLabel variant="ghost" />
 * ```
 */
export function ThemeToggle({
  showLabel = false,
  size = 'md',
  variant = 'ghost',
  className = '',
}: ThemeToggleProps) {
  const { theme, cycleTheme, actualTheme } = useTheme()

  const getIcon = () => {
    switch (theme) {
      case 'light':
        return <Sun className="w-4 h-4" />
      case 'dark':
        return <Moon className="w-4 h-4" />
      case 'system':
        return <Monitor className="w-4 h-4" />
    }
  }

  const getLabel = () => {
    switch (theme) {
      case 'light':
        return 'Light'
      case 'dark':
        return 'Dark'
      case 'system':
        return 'System'
    }
  }

  const getNextTheme = (): Theme => {
    const order: Theme[] = ['light', 'dark', 'system']
    const currentIndex = order.indexOf(theme)
    const nextIndex = (currentIndex + 1) % order.length
    return order[nextIndex]
  }

  return (
    <Button
      onClick={cycleTheme}
      variant={variant}
      size={size}
      className={className}
      title={`Current: ${getLabel()}, Click to switch to ${getNextTheme()}`}
      aria-label={`Theme: ${getLabel()}, Actual: ${actualTheme}`}
    >
      {getIcon()}
      {showLabel && <span className="ml-2">{getLabel()}</span>}
    </Button>
  )
}

/**
 * Theme toggle with dropdown menu showing all options
 */
export function ThemeToggleMenu({
  className = '',
}: {
  className?: string
}) {
  const { theme, setTheme } = useTheme()

  const themes: Array<{ value: Theme; label: string; icon: React.ReactNode }> = [
    { value: 'light', label: 'Light', icon: <Sun className="w-4 h-4" /> },
    { value: 'dark', label: 'Dark', icon: <Moon className="w-4 h-4" /> },
    { value: 'system', label: 'System', icon: <Monitor className="w-4 h-4" /> },
  ]

  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      {themes.map((t) => (
        <button
          key={t.value}
          onClick={() => setTheme(t.value)}
          className={`flex items-center gap-2 px-3 py-2 rounded text-sm transition-colors ${
            theme === t.value
              ? 'bg-blue-100 dark:bg-blue-900 text-blue-900 dark:text-blue-100'
              : 'hover:bg-gray-100 dark:hover:bg-gray-700'
          }`}
          aria-label={`Set theme to ${t.label}`}
        >
          {t.icon}
          <span>{t.label}</span>
          {theme === t.value && (
            <span className="ml-auto text-xs text-blue-600 dark:text-blue-400">✓</span>
          )}
        </button>
      ))}
    </div>
  )
}

/**
 * Compact theme toggle (icon only)
 */
export function CompactThemeToggle() {
  return <ThemeToggle size="sm" variant="ghost" />
}

/**
 * Theme toggle with label
 */
export function LabeledThemeToggle() {
  return <ThemeToggle showLabel size="md" variant="secondary" />
}

export default ThemeToggle
