// ============================================================================
// GLOBAL KEYBOARD SHORTCUTS - Application-wide keyboard shortcuts
// ============================================================================

import { useCallback } from 'react'
import { useHistory } from '../../lib/hooks/useHistory'
import { useConfigStore } from '../../store/config-store'
import { useSaveConfig } from '../../lib/hooks/useFileOperations'
import { useKeyboardShortcuts, type KeyboardShortcut } from '../../lib/hooks/useKeyboardShortcuts'

/**
 * Global keyboard shortcuts provider
 *
 * Registers all application-wide keyboard shortcuts:
 * - Ctrl+S: Save configuration
 * - Ctrl+Z: Undo
 * - Ctrl+Shift+Z / Ctrl+Y: Redo
 * - Escape: Close modals
 *
 * This component should be placed at the root level of the application.
 *
 * @example
 * Place at the root level of your application:
 * ```tsx
 * function App() {
 *   return (
 *     <>
 *       <GlobalKeyboardShortcuts />
 *       <MainContent />
 *     </>
 *   )
 * }
 * ```
 */
export function GlobalKeyboardShortcuts() {
  const { undo, redo, canUndo, canRedo } = useHistory()
  const { save } = useSaveConfig()
  const isDirty = useConfigStore((state) => state.isDirty)

  // Save handler
  const handleSave = useCallback(async () => {
    if (!isDirty) return
    try {
      await save()
      console.log('Configuration saved via Ctrl+S')
    } catch (error) {
      console.error('Failed to save configuration:', error)
    }
  }, [isDirty, save])

  // Undo handler
  const handleUndo = useCallback(() => {
    if (!canUndo) return
    undo()
    console.log('Undo via Ctrl+Z')
  }, [canUndo, undo])

  // Redo handler
  const handleRedo = useCallback(() => {
    if (!canRedo) return
    redo()
    console.log('Redo via Ctrl+Shift+Z')
  }, [canRedo, redo])

  // Escape handler (for closing modals)
  const handleEscape = useCallback(() => {
    // Emit custom event that modal components can listen to
    window.dispatchEvent(new CustomEvent('closeModal'))
    console.log('Escape pressed')
  }, [])

  const shortcuts: KeyboardShortcut[] = [
    // Save
    {
      key: 's',
      ctrl: true,
      callback: handleSave,
      description: 'Save configuration',
      category: 'File',
      disabled: !isDirty,
    },
    // Undo
    {
      key: 'z',
      ctrl: true,
      callback: handleUndo,
      description: 'Undo last action',
      category: 'Edit',
      disabled: !canUndo,
    },
    // Redo (Ctrl+Shift+Z)
    {
      key: 'z',
      ctrl: true,
      shift: true,
      callback: handleRedo,
      description: 'Redo last undone action',
      category: 'Edit',
      disabled: !canRedo,
    },
    // Redo alternative (Ctrl+Y)
    {
      key: 'y',
      ctrl: true,
      callback: handleRedo,
      description: 'Redo last undone action',
      category: 'Edit',
      disabled: !canRedo,
    },
    // Escape (close modals)
    {
      key: 'Escape',
      callback: handleEscape,
      description: 'Close modal or dialog',
      category: 'Navigation',
      preventDefault: false, // Allow default Escape behavior
    },
  ]

  useKeyboardShortcuts(shortcuts)

  return null // This component doesn't render anything
}

export default GlobalKeyboardShortcuts
