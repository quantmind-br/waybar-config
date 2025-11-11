// ============================================================================
// KEYBOARD SHORTCUTS HOOK - Global keyboard shortcut management
// ============================================================================

import { useEffect, useCallback, useRef } from 'react'

export interface KeyboardShortcut {
  /** Shortcut key (e.g., 's', 'z', 'Escape') */
  key: string
  /** Requires Ctrl modifier */
  ctrl?: boolean
  /** Requires Shift modifier */
  shift?: boolean
  /** Requires Alt modifier */
  alt?: boolean
  /** Requires Meta/Command modifier */
  meta?: boolean
  /** Callback function to execute */
  callback: (event: KeyboardEvent) => void
  /** Prevent default browser behavior */
  preventDefault?: boolean
  /** Description for help dialog */
  description?: string
  /** Shortcut category for grouping */
  category?: string
  /** Disable shortcut */
  disabled?: boolean
}

/**
 * Parse a shortcut string like "Ctrl+S" or "Ctrl+Shift+Z" into components
 */
export function parseShortcutString(shortcut: string): Omit<KeyboardShortcut, 'callback'> {
  const parts = shortcut.toLowerCase().split('+').map(p => p.trim())
  const key = parts[parts.length - 1]

  return {
    key,
    ctrl: parts.includes('ctrl') || parts.includes('control'),
    shift: parts.includes('shift'),
    alt: parts.includes('alt'),
    meta: parts.includes('meta') || parts.includes('cmd') || parts.includes('command'),
  }
}

/**
 * Check if a keyboard event matches a shortcut definition
 */
export function matchesShortcut(event: KeyboardEvent, shortcut: KeyboardShortcut): boolean {
  if (shortcut.disabled) return false

  const keyMatch = event.key.toLowerCase() === shortcut.key.toLowerCase()
  const ctrlMatch = shortcut.ctrl ? event.ctrlKey || event.metaKey : !event.ctrlKey && !event.metaKey
  const shiftMatch = shortcut.shift ? event.shiftKey : !event.shiftKey
  const altMatch = shortcut.alt ? event.altKey : !event.altKey
  const metaMatch = shortcut.meta ? event.metaKey : true // Meta is optional

  return keyMatch && ctrlMatch && shiftMatch && altMatch && metaMatch
}

/**
 * Format shortcut for display (e.g., "Ctrl+S", "Ctrl+Shift+Z")
 */
export function formatShortcut(shortcut: KeyboardShortcut): string {
  const parts: string[] = []

  if (shortcut.ctrl) parts.push('Ctrl')
  if (shortcut.shift) parts.push('Shift')
  if (shortcut.alt) parts.push('Alt')
  if (shortcut.meta) parts.push('Cmd')

  parts.push(shortcut.key.toUpperCase())

  return parts.join('+')
}

/**
 * Hook for registering a single keyboard shortcut
 *
 * @example
 * ```tsx
 * useKeyboardShortcut({
 *   key: 's',
 *   ctrl: true,
 *   callback: handleSave,
 *   description: 'Save configuration',
 * })
 * ```
 */
export function useKeyboardShortcut(shortcut: KeyboardShortcut) {
  const shortcutRef = useRef(shortcut)
  shortcutRef.current = shortcut

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const current = shortcutRef.current

      // Skip if typing in an input/textarea
      const target = event.target as HTMLElement
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
        // Allow Escape even in inputs
        if (current.key !== 'Escape') return
      }

      if (matchesShortcut(event, current)) {
        if (current.preventDefault !== false) {
          event.preventDefault()
        }
        current.callback(event)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])
}

/**
 * Hook for registering multiple keyboard shortcuts
 *
 * @example
 * ```tsx
 * useKeyboardShortcuts([
 *   { key: 's', ctrl: true, callback: handleSave, description: 'Save' },
 *   { key: 'z', ctrl: true, callback: handleUndo, description: 'Undo' },
 * ])
 * ```
 */
export function useKeyboardShortcuts(shortcuts: KeyboardShortcut[]) {
  const shortcutsRef = useRef(shortcuts)
  shortcutsRef.current = shortcuts

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const current = shortcutsRef.current

      // Skip if typing in an input/textarea (except Escape)
      const target = event.target as HTMLElement
      const isInputElement =
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable

      for (const shortcut of current) {
        // Skip if in input and not Escape
        if (isInputElement && shortcut.key !== 'Escape') continue

        if (matchesShortcut(event, shortcut)) {
          if (shortcut.preventDefault !== false) {
            event.preventDefault()
          }
          shortcut.callback(event)
          break // Only trigger first matching shortcut
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])
}

/**
 * Hook that provides a shortcut registration API
 *
 * Useful when shortcuts need to be registered dynamically.
 *
 * @example
 * ```tsx
 * const { registerShortcut, unregisterShortcut } = useShortcutRegistry()
 *
 * useEffect(() => {
 *   const id = registerShortcut({
 *     key: 's',
 *     ctrl: true,
 *     callback: handleSave,
 *   })
 *   return () => unregisterShortcut(id)
 * }, [])
 * ```
 */
export function useShortcutRegistry() {
  const shortcutsRef = useRef<Map<string, KeyboardShortcut>>(new Map())

  const registerShortcut = useCallback((shortcut: KeyboardShortcut): string => {
    const id = Math.random().toString(36).substring(2, 9)
    shortcutsRef.current.set(id, shortcut)
    return id
  }, [])

  const unregisterShortcut = useCallback((id: string) => {
    shortcutsRef.current.delete(id)
  }, [])

  const getShortcuts = useCallback((): KeyboardShortcut[] => {
    return Array.from(shortcutsRef.current.values())
  }, [])

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const shortcuts = Array.from(shortcutsRef.current.values())

      // Skip if typing in an input/textarea (except Escape)
      const target = event.target as HTMLElement
      const isInputElement =
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable

      for (const shortcut of shortcuts) {
        if (isInputElement && shortcut.key !== 'Escape') continue

        if (matchesShortcut(event, shortcut)) {
          if (shortcut.preventDefault !== false) {
            event.preventDefault()
          }
          shortcut.callback(event)
          break
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  return {
    registerShortcut,
    unregisterShortcut,
    getShortcuts,
  }
}

export default useKeyboardShortcuts
