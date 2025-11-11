// ============================================================================
// HISTORY STATUS - Display current history state
// ============================================================================

import { useHistory } from '../../lib/hooks/useHistory'

export interface HistoryStatusProps {
  /** Show detailed state information */
  detailed?: boolean
  /** Custom className */
  className?: string
}

/**
 * Display current undo/redo state
 *
 * Shows available undo/redo actions count. Useful for status bars.
 *
 * @example
 * ```tsx
 * <HistoryStatus detailed />
 * ```
 */
export function HistoryStatus({ detailed = false, className = '' }: HistoryStatusProps) {
  const { canUndo, canRedo, undoCount, redoCount } = useHistory()

  if (!canUndo && !canRedo && !detailed) {
    return null
  }

  return (
    <div className={`flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400 ${className}`}>
      {detailed ? (
        <>
          <span>History:</span>
          <span className={canUndo ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400'}>
            {undoCount} undo
          </span>
          <span className="text-gray-400">|</span>
          <span className={canRedo ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400'}>
            {redoCount} redo
          </span>
        </>
      ) : (
        <>
          {canUndo && <span title="Undo available">{undoCount} undo</span>}
          {canUndo && canRedo && <span className="text-gray-400">|</span>}
          {canRedo && <span title="Redo available">{redoCount} redo</span>}
        </>
      )}
    </div>
  )
}

export default HistoryStatus
