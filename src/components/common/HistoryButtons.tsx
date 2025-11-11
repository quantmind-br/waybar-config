// ============================================================================
// HISTORY BUTTONS - Undo/Redo UI Controls
// ============================================================================

import { Undo2, Redo2 } from 'lucide-react'
import { useHistory } from '../../lib/hooks/useHistory'
import { Button } from './Button'

export interface HistoryButtonsProps {
  /** Show undo/redo counts in button labels */
  showCounts?: boolean
  /** Button size variant */
  size?: 'sm' | 'md' | 'lg'
  /** Button style variant */
  variant?: 'primary' | 'secondary' | 'ghost'
  /** Custom className for container */
  className?: string
}

/**
 * Undo/Redo button group with keyboard shortcut support
 *
 * Displays undo and redo buttons that are automatically enabled/disabled
 * based on history state. Supports keyboard shortcuts (Ctrl+Z, Ctrl+Shift+Z).
 *
 * @example
 * ```tsx
 * <HistoryButtons showCounts variant="ghost" />
 * ```
 */
export function HistoryButtons({
  showCounts = false,
  size = 'md',
  variant = 'ghost',
  className = '',
}: HistoryButtonsProps) {
  const { undo, redo, canUndo, canRedo, undoCount, redoCount } = useHistory()

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      <Button
        onClick={undo}
        disabled={!canUndo}
        variant={variant}
        size={size}
        title={`Undo${showCounts && undoCount > 0 ? ` (${undoCount})` : ''} - Ctrl+Z`}
        aria-label={`Undo${showCounts && undoCount > 0 ? ` (${undoCount} actions)` : ''}`}
      >
        <Undo2 className="w-4 h-4" />
        {showCounts && undoCount > 0 && (
          <span className="ml-1 text-xs opacity-70">{undoCount}</span>
        )}
      </Button>

      <Button
        onClick={redo}
        disabled={!canRedo}
        variant={variant}
        size={size}
        title={`Redo${showCounts && redoCount > 0 ? ` (${redoCount})` : ''} - Ctrl+Shift+Z`}
        aria-label={`Redo${showCounts && redoCount > 0 ? ` (${redoCount} actions)` : ''}`}
      >
        <Redo2 className="w-4 h-4" />
        {showCounts && redoCount > 0 && (
          <span className="ml-1 text-xs opacity-70">{redoCount}</span>
        )}
      </Button>
    </div>
  )
}

/**
 * Compact undo/redo buttons without icons (icon-only)
 */
export function CompactHistoryButtons({
  className = '',
}: {
  className?: string
}) {
  return <HistoryButtons showCounts={false} size="sm" variant="ghost" className={className} />
}

/**
 * Detailed undo/redo buttons with counts
 */
export function DetailedHistoryButtons({
  className = '',
}: {
  className?: string
}) {
  return <HistoryButtons showCounts size="md" variant="secondary" className={className} />
}

export default HistoryButtons
