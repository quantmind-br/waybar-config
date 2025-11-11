// ============================================================================
// WAYBAR CONTROL HOOKS - Waybar process management with React integration
// ============================================================================

import { useState, useCallback, useEffect } from 'react'
import {
  reloadWaybar,
  isWaybarRunning,
  getWaybarPids,
  startWaybar,
  stopWaybar,
  restartWaybar,
  detectCompositor,
  getCompositorInfo,
  type CompositorInfo,
} from '../tauri/commands'

// ============================================================================
// TYPES
// ============================================================================

interface WaybarState {
  isRunning: boolean
  pids: number[]
  isChecking: boolean
  error: string | null
}

interface CompositorState {
  compositor: string | null
  info: CompositorInfo | null
  isDetecting: boolean
  error: string | null
}

// ============================================================================
// WAYBAR CONTROL HOOKS
// ============================================================================

/**
 * Hook for Waybar process control
 * Provides functions to reload, start, stop, and restart Waybar
 *
 * Usage:
 * ```tsx
 * const { reload, isRunning, isOperating, error } = useWaybarControl()
 *
 * const handleReload = async () => {
 *   const success = await reload()
 *   if (success) {
 *     toast.success('Waybar reloaded successfully')
 *   }
 * }
 * ```
 */
export function useWaybarControl() {
  const [isOperating, setIsOperating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isRunning, setIsRunning] = useState(false)

  // Check if Waybar is running
  const checkStatus = useCallback(async () => {
    try {
      const running = await isWaybarRunning()
      setIsRunning(running)
      return running
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error'
      setError(message)
      return false
    }
  }, [])

  // Reload Waybar configuration
  const reload = useCallback(async (): Promise<boolean> => {
    setIsOperating(true)
    setError(null)

    try {
      await reloadWaybar()
      setIsOperating(false)
      return true
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error'
      setError(message)
      setIsOperating(false)
      return false
    }
  }, [])

  // Start Waybar
  const start = useCallback(async (): Promise<boolean> => {
    setIsOperating(true)
    setError(null)

    try {
      await startWaybar()
      await checkStatus()
      setIsOperating(false)
      return true
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error'
      setError(message)
      setIsOperating(false)
      return false
    }
  }, [checkStatus])

  // Stop Waybar
  const stop = useCallback(async (): Promise<boolean> => {
    setIsOperating(true)
    setError(null)

    try {
      await stopWaybar()
      await checkStatus()
      setIsOperating(false)
      return true
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error'
      setError(message)
      setIsOperating(false)
      return false
    }
  }, [checkStatus])

  // Restart Waybar
  const restart = useCallback(async (): Promise<boolean> => {
    setIsOperating(true)
    setError(null)

    try {
      await restartWaybar()
      await checkStatus()
      setIsOperating(false)
      return true
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error'
      setError(message)
      setIsOperating(false)
      return false
    }
  }, [checkStatus])

  // Check status on mount
  useEffect(() => {
    checkStatus()
  }, [checkStatus])

  return {
    reload,
    start,
    stop,
    restart,
    checkStatus,
    isRunning,
    isOperating,
    error,
  }
}

/**
 * Hook for checking Waybar status
 * Auto-refreshes at specified interval
 *
 * Usage:
 * ```tsx
 * const { isRunning, pids, refresh } = useWaybarStatus({ refreshInterval: 5000 })
 *
 * return (
 *   <div>
 *     Waybar: {isRunning ? 'Running' : 'Stopped'}
 *     {pids.length > 0 && <span>(PIDs: {pids.join(', ')})</span>}
 *   </div>
 * )
 * ```
 */
export function useWaybarStatus(options?: { refreshInterval?: number }) {
  const { refreshInterval = 0 } = options || {}
  const [state, setState] = useState<WaybarState>({
    isRunning: false,
    pids: [],
    isChecking: false,
    error: null,
  })

  const refresh = useCallback(async () => {
    setState(prev => ({ ...prev, isChecking: true, error: null }))

    try {
      const [running, pids] = await Promise.all([
        isWaybarRunning(),
        getWaybarPids(),
      ])

      setState({
        isRunning: running,
        pids,
        isChecking: false,
        error: null,
      })
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error'
      setState(prev => ({
        ...prev,
        isChecking: false,
        error: message,
      }))
    }
  }, [])

  // Initial check
  useEffect(() => {
    refresh()
  }, [refresh])

  // Auto-refresh
  useEffect(() => {
    if (refreshInterval <= 0) return

    const interval = setInterval(refresh, refreshInterval)
    return () => clearInterval(interval)
  }, [refreshInterval, refresh])

  return {
    ...state,
    refresh,
  }
}

// ============================================================================
// COMPOSITOR DETECTION HOOKS
// ============================================================================

/**
 * Hook for compositor detection
 * Detects and provides information about the running Wayland compositor
 *
 * Usage:
 * ```tsx
 * const { compositor, info, detect } = useCompositor()
 *
 * useEffect(() => {
 *   detect()
 * }, [])
 *
 * return (
 *   <div>
 *     Running on: {compositor || 'Unknown'}
 *     {info?.version && <span>Version: {info.version}</span>}
 *   </div>
 * )
 * ```
 */
export function useCompositor() {
  const [state, setState] = useState<CompositorState>({
    compositor: null,
    info: null,
    isDetecting: false,
    error: null,
  })

  const detect = useCallback(async () => {
    setState(prev => ({ ...prev, isDetecting: true, error: null }))

    try {
      const [compositorName, compositorInfo] = await Promise.all([
        detectCompositor(),
        getCompositorInfo(),
      ])

      setState({
        compositor: compositorName,
        info: compositorInfo,
        isDetecting: false,
        error: null,
      })
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error'
      setState(prev => ({
        ...prev,
        isDetecting: false,
        error: message,
      }))
    }
  }, [])

  // Detect on mount
  useEffect(() => {
    detect()
  }, [detect])

  return {
    ...state,
    detect,
  }
}

/**
 * Combined hook for Waybar control and status
 * Provides complete interface for Waybar management
 *
 * Usage:
 * ```tsx
 * const waybar = useWaybar({ refreshInterval: 5000 })
 *
 * return (
 *   <div>
 *     <p>Status: {waybar.isRunning ? 'Running' : 'Stopped'}</p>
 *     <button onClick={waybar.reload}>Reload</button>
 *     <button onClick={waybar.restart}>Restart</button>
 *   </div>
 * )
 * ```
 */
export function useWaybar(options?: { refreshInterval?: number }) {
  const control = useWaybarControl()
  const status = useWaybarStatus(options)

  return {
    // Control
    reload: control.reload,
    start: control.start,
    stop: control.stop,
    restart: control.restart,

    // Status
    isRunning: status.isRunning,
    pids: status.pids,
    refresh: status.refresh,

    // State
    isOperating: control.isOperating,
    isChecking: status.isChecking,
    error: control.error || status.error,
  }
}
