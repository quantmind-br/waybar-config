// ============================================================================
// HISTORY HOOK - Undo/Redo functionality using Zundo
// ============================================================================

import { useCallback } from 'react'
import { useConfigStore } from '../../store/config-store'

export interface HistoryState {
  canUndo: boolean
  canRedo: boolean
  undoCount: number
  redoCount: number
  undo: () => void
  redo: () => void
  clear: () => void
  pause: () => void
  resume: () => void
}

/**
 * Hook for undo/redo functionality
 *
 * Uses Zundo temporal middleware to provide history navigation.
 *
 * @example
 * ```tsx
 * const { undo, redo, canUndo, canRedo, undoCount, redoCount } = useHistory()
 *
 * return (
 *   <>
 *     <button onClick={undo} disabled={!canUndo}>
 *       Undo ({undoCount})
 *     </button>
 *     <button onClick={redo} disabled={!canRedo}>
 *       Redo ({redoCount})
 *     </button>
 *   </>
 * )
 * ```
 */
export function useHistory(): HistoryState {
  const temporal = useConfigStore.temporal

  if (!temporal) {
    throw new Error('Temporal state not found. Ensure Zundo is configured in config-store.')
  }

  const pastStates = temporal.getState().pastStates
  const futureStates = temporal.getState().futureStates

  const undo = useCallback(() => {
    temporal.getState().undo()
  }, [temporal])

  const redo = useCallback(() => {
    temporal.getState().redo()
  }, [temporal])

  const clear = useCallback(() => {
    temporal.getState().clear()
  }, [temporal])

  const pause = useCallback(() => {
    temporal.getState().pause()
  }, [temporal])

  const resume = useCallback(() => {
    temporal.getState().resume()
  }, [temporal])

  return {
    canUndo: pastStates.length > 0,
    canRedo: futureStates.length > 0,
    undoCount: pastStates.length,
    redoCount: futureStates.length,
    undo,
    redo,
    clear,
    pause,
    resume,
  }
}

/**
 * Hook for pausing history tracking during bulk operations
 *
 * Useful when performing multiple state updates that should be treated as a single undo/redo action.
 *
 * @example
 * ```tsx
 * const { pauseHistory, resumeHistory } = usePauseHistory()
 *
 * const importConfig = async () => {
 *   pauseHistory()
 *   // Perform multiple state updates
 *   await loadBars()
 *   await loadModules()
 *   await loadStyles()
 *   resumeHistory()
 * }
 * ```
 */
export function usePauseHistory() {
  const temporal = useConfigStore.temporal

  if (!temporal) {
    throw new Error('Temporal state not found. Ensure Zundo is configured in config-store.')
  }

  const pauseHistory = useCallback(() => {
    temporal.getState().pause()
  }, [temporal])

  const resumeHistory = useCallback(() => {
    temporal.getState().resume()
  }, [temporal])

  return {
    pauseHistory,
    resumeHistory,
  }
}

export default useHistory
