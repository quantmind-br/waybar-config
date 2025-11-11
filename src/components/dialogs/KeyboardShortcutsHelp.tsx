// ============================================================================
// KEYBOARD SHORTCUTS HELP - Display available keyboard shortcuts
// ============================================================================

import { useState, useEffect } from 'react'
import { Keyboard, X } from 'lucide-react'
import { useKeyboardShortcut } from '../../lib/hooks/useKeyboardShortcuts'
import { Button } from '../common/Button'

export interface ShortcutGroup {
  category: string
  shortcuts: Array<{
    keys: string
    description: string
  }>
}

const SHORTCUTS: ShortcutGroup[] = [
  {
    category: 'File',
    shortcuts: [
      { keys: 'Ctrl+S', description: 'Save configuration' },
      { keys: 'Ctrl+O', description: 'Open configuration' },
      { keys: 'Ctrl+N', description: 'New configuration' },
    ],
  },
  {
    category: 'Edit',
    shortcuts: [
      { keys: 'Ctrl+Z', description: 'Undo last action' },
      { keys: 'Ctrl+Shift+Z', description: 'Redo last undone action' },
      { keys: 'Ctrl+Y', description: 'Redo last undone action (alternative)' },
      { keys: 'Ctrl+C', description: 'Copy selected module' },
      { keys: 'Ctrl+V', description: 'Paste module' },
      { keys: 'Ctrl+D', description: 'Duplicate selected module' },
      { keys: 'Delete', description: 'Delete selected module' },
    ],
  },
  {
    category: 'Navigation',
    shortcuts: [
      { keys: 'Escape', description: 'Close modal or dialog' },
      { keys: 'Tab', description: 'Navigate to next field' },
      { keys: 'Shift+Tab', description: 'Navigate to previous field' },
    ],
  },
  {
    category: 'View',
    shortcuts: [
      { keys: 'Ctrl+B', description: 'Toggle sidebar' },
      { keys: 'Ctrl+/', description: 'Show keyboard shortcuts' },
      { keys: 'F11', description: 'Toggle fullscreen' },
    ],
  },
]

export interface KeyboardShortcutsHelpProps {
  isOpen?: boolean
  onClose?: () => void
}

/**
 * Keyboard shortcuts help dialog
 *
 * Displays all available keyboard shortcuts organized by category.
 * Can be opened with Ctrl+/ or by clicking a help button.
 *
 * @example
 * ```tsx
 * const [isOpen, setIsOpen] = useState(false)
 *
 * <KeyboardShortcutsHelp isOpen={isOpen} onClose={() => setIsOpen(false)} />
 * ```
 */
export function KeyboardShortcutsHelp({ isOpen = false, onClose }: KeyboardShortcutsHelpProps) {
  const [internalOpen, setInternalOpen] = useState(isOpen)

  // Sync with external state
  useEffect(() => {
    setInternalOpen(isOpen)
  }, [isOpen])

  // Toggle with Ctrl+/
  useKeyboardShortcut({
    key: '/',
    ctrl: true,
    callback: () => {
      const newState = !internalOpen
      setInternalOpen(newState)
      if (!newState && onClose) onClose()
    },
    description: 'Show keyboard shortcuts help',
    category: 'View',
  })

  // Close with Escape
  useKeyboardShortcut({
    key: 'Escape',
    callback: () => {
      if (internalOpen) {
        setInternalOpen(false)
        if (onClose) onClose()
      }
    },
    disabled: !internalOpen,
  })

  const handleClose = () => {
    setInternalOpen(false)
    if (onClose) onClose()
  }

  if (!internalOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2">
            <Keyboard className="w-5 h-5" />
            <h2 className="text-lg font-semibold">Keyboard Shortcuts</h2>
          </div>
          <Button variant="ghost" size="sm" onClick={handleClose} aria-label="Close">
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(80vh-80px)]">
          <div className="space-y-6">
            {SHORTCUTS.map((group) => (
              <div key={group.category}>
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                  {group.category}
                </h3>
                <div className="space-y-2">
                  {group.shortcuts.map((shortcut, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between py-2 px-3 rounded hover:bg-gray-50 dark:hover:bg-gray-700/50"
                    >
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {shortcut.description}
                      </span>
                      <kbd className="px-2 py-1 text-xs font-mono bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded">
                        {shortcut.keys}
                      </kbd>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
          <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
            Press <kbd className="px-1 py-0.5 text-xs font-mono bg-gray-200 dark:bg-gray-700 rounded">Ctrl+/</kbd> to toggle this help dialog
          </p>
        </div>
      </div>
    </div>
  )
}

/**
 * Button to open keyboard shortcuts help
 */
export function KeyboardShortcutsHelpButton() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(true)}
        title="Show keyboard shortcuts (Ctrl+/)"
        aria-label="Show keyboard shortcuts"
      >
        <Keyboard className="w-4 h-4" />
      </Button>
      <KeyboardShortcutsHelp isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  )
}

export default KeyboardShortcutsHelp
