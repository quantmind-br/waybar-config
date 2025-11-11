// ============================================================================
// TAURI COMMAND WRAPPERS
// Type-safe wrappers for all Tauri backend commands
// ============================================================================

import { invoke } from '@tauri-apps/api/core'

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

/**
 * Waybar configuration file paths
 */
export interface ConfigPaths {
  config_dir: string
  config_file: string
  style_file: string
}

/**
 * Waybar configuration file with content and path
 */
export interface WaybarConfigFile {
  content: string
  path: string
}

/**
 * Error result from Tauri commands
 */
export interface TauriError {
  type: 'Io' | 'Config' | 'Parse' | 'Validation' | 'NotFound' | 'Internal'
  message: string
}

// ============================================================================
// CONFIG PATH COMMANDS
// ============================================================================

/**
 * Detect Waybar configuration paths
 * Checks for config directory and files at standard locations
 *
 * @returns Configuration paths or throws error if not found
 * @throws TauriError if Waybar config directory not found
 */
export async function detectConfigPaths(): Promise<ConfigPaths> {
  try {
    return await invoke<ConfigPaths>('detect_config_paths')
  } catch (error) {
    throw new Error(`Failed to detect config paths: ${error}`)
  }
}

// ============================================================================
// CONFIG FILE COMMANDS
// ============================================================================

/**
 * Load Waybar configuration file
 * Handles JSONC format (strips comments)
 *
 * @param path - Path to config file
 * @returns Configuration file content and path
 * @throws TauriError if file not found or invalid
 */
export async function loadConfig(path: string): Promise<WaybarConfigFile> {
  try {
    return await invoke<WaybarConfigFile>('load_config', { path })
  } catch (error) {
    throw new Error(`Failed to load config: ${error}`)
  }
}

/**
 * Save Waybar configuration file
 * Creates automatic backup before writing
 * Validates JSON before saving
 *
 * @param path - Path to save config file
 * @param content - JSON configuration content
 * @throws TauriError if validation fails or write fails
 */
export async function saveConfig(path: string, content: string): Promise<void> {
  try {
    await invoke<void>('save_config', { path, content })
  } catch (error) {
    throw new Error(`Failed to save config: ${error}`)
  }
}

// ============================================================================
// CSS FILE COMMANDS
// ============================================================================

/**
 * Load CSS style file
 *
 * @param path - Path to CSS file
 * @returns CSS content as string
 * @throws TauriError if file not found
 */
export async function loadCSS(path: string): Promise<string> {
  try {
    return await invoke<string>('load_css', { path })
  } catch (error) {
    throw new Error(`Failed to load CSS: ${error}`)
  }
}

/**
 * Save CSS style file
 * Creates automatic backup before writing
 *
 * @param path - Path to save CSS file
 * @param content - CSS content
 * @throws TauriError if content empty or write fails
 */
export async function saveCSS(path: string, content: string): Promise<void> {
  try {
    await invoke<void>('save_css', { path, content })
  } catch (error) {
    throw new Error(`Failed to save CSS: ${error}`)
  }
}

// ============================================================================
// BACKUP COMMANDS
// ============================================================================

/**
 * List all backup files in config directory
 * Returns backups sorted by timestamp (newest first)
 *
 * @param configDir - Path to config directory
 * @returns Array of backup filenames
 * @throws TauriError if directory cannot be read
 */
export async function listBackups(configDir: string): Promise<string[]> {
  try {
    return await invoke<string[]>('list_backups', { configDir })
  } catch (error) {
    throw new Error(`Failed to list backups: ${error}`)
  }
}

/**
 * Restore a backup file
 * Creates backup of current file before restoring
 *
 * @param backupPath - Path to backup file to restore
 * @param targetPath - Path to restore to
 * @throws TauriError if restore fails
 */
export async function restoreBackup(
  backupPath: string,
  targetPath: string
): Promise<void> {
  try {
    await invoke<void>('restore_backup', { backupPath, targetPath })
  } catch (error) {
    throw new Error(`Failed to restore backup: ${error}`)
  }
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Check if a Tauri error is of a specific type
 */
export function isTauriError(error: unknown, type: TauriError['type']): boolean {
  if (typeof error === 'object' && error !== null) {
    const tauriError = error as Partial<TauriError>
    return tauriError.type === type
  }
  return false
}

/**
 * Extract error message from Tauri error
 */
export function getTauriErrorMessage(error: unknown): string {
  if (typeof error === 'object' && error !== null) {
    const tauriError = error as Partial<TauriError>
    return tauriError.message || 'Unknown error'
  }
  if (typeof error === 'string') {
    return error
  }
  return 'Unknown error'
}

// ============================================================================
// WAYBAR PROCESS COMMANDS
// ============================================================================

/**
 * Reload Waybar configuration
 * Sends SIGUSR2 signal to Waybar process
 *
 * @throws TauriError if reload fails
 */
export async function reloadWaybar(): Promise<void> {
  try {
    await invoke<void>('reload_waybar')
  } catch (error) {
    throw new Error(`Failed to reload Waybar: ${error}`)
  }
}

/**
 * Check if Waybar is currently running
 *
 * @returns true if Waybar is running, false otherwise
 * @throws TauriError if check fails
 */
export async function isWaybarRunning(): Promise<boolean> {
  try {
    return await invoke<boolean>('is_waybar_running')
  } catch (error) {
    throw new Error(`Failed to check Waybar status: ${error}`)
  }
}

/**
 * Get Waybar process ID(s)
 *
 * @returns Array of process IDs (empty if not running)
 * @throws TauriError if command fails
 */
export async function getWaybarPids(): Promise<number[]> {
  try {
    return await invoke<number[]>('get_waybar_pids')
  } catch (error) {
    throw new Error(`Failed to get Waybar PIDs: ${error}`)
  }
}

/**
 * Start Waybar process
 * Does nothing if already running
 *
 * @throws TauriError if start fails
 */
export async function startWaybar(): Promise<void> {
  try {
    await invoke<void>('start_waybar')
  } catch (error) {
    throw new Error(`Failed to start Waybar: ${error}`)
  }
}

/**
 * Stop Waybar process
 * Does nothing if not running
 *
 * @throws TauriError if stop fails
 */
export async function stopWaybar(): Promise<void> {
  try {
    await invoke<void>('stop_waybar')
  } catch (error) {
    throw new Error(`Failed to stop Waybar: ${error}`)
  }
}

/**
 * Restart Waybar process
 * Stops and starts Waybar with a brief delay
 *
 * @throws TauriError if restart fails
 */
export async function restartWaybar(): Promise<void> {
  try {
    await invoke<void>('restart_waybar')
  } catch (error) {
    throw new Error(`Failed to restart Waybar: ${error}`)
  }
}

// ============================================================================
// COMPOSITOR DETECTION COMMANDS
// ============================================================================

/**
 * Compositor information
 */
export interface CompositorInfo {
  name: string
  version?: string
  session_type: string
}

/**
 * Detect currently running Wayland compositor
 *
 * @returns Compositor name (lowercase) or "unknown"
 * @throws TauriError if detection fails
 */
export async function detectCompositor(): Promise<string> {
  try {
    return await invoke<string>('detect_compositor')
  } catch (error) {
    throw new Error(`Failed to detect compositor: ${error}`)
  }
}

/**
 * Get detailed compositor information
 *
 * @returns Compositor info including name, version, and session type
 * @throws TauriError if command fails
 */
export async function getCompositorInfo(): Promise<CompositorInfo> {
  try {
    return await invoke<CompositorInfo>('get_compositor_info')
  } catch (error) {
    throw new Error(`Failed to get compositor info: ${error}`)
  }
}

/**
 * Check if a specific compositor is running
 *
 * @param compositorName - Name of compositor to check (e.g. "hyprland", "sway")
 * @returns true if the specified compositor is running
 * @throws TauriError if check fails
 */
export async function isCompositorRunning(compositorName: string): Promise<boolean> {
  try {
    return await invoke<boolean>('is_compositor_running', { compositorName })
  } catch (error) {
    throw new Error(`Failed to check compositor: ${error}`)
  }
}
