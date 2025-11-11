// ============================================================================
// TAURI COMMAND MOCKS
// Mock implementations for Tauri backend commands
// ============================================================================

import { vi } from 'vitest'
import type { ConfigPaths, WaybarConfigFile, CompositorInfo } from '../../lib/tauri/commands'

// ============================================================================
// MOCK DATA
// ============================================================================

export const mockConfigPaths: ConfigPaths = {
  config_dir: '/home/user/.config/waybar',
  config_file: '/home/user/.config/waybar/config',
  style_file: '/home/user/.config/waybar/style.css',
}

export const mockWaybarConfig: WaybarConfigFile = {
  content: JSON.stringify({
    layer: 'top',
    position: 'top',
    height: 30,
    spacing: 4,
    'modules-left': ['clock', 'battery'],
    'modules-center': ['hyprland/workspaces'],
    'modules-right': ['network', 'pulseaudio', 'tray'],
    clock: {
      format: '{:%H:%M}',
      tooltip: true,
      'tooltip-format': '{:%Y-%m-%d}',
    },
    battery: {
      format: '{capacity}% {icon}',
      'format-icons': ['', '', '', '', ''],
      states: {
        warning: 30,
        critical: 15,
      },
    },
  }, null, 2),
  path: mockConfigPaths.config_file,
}

export const mockCSS = `
* {
  border: none;
  font-family: "JetBrainsMono Nerd Font";
  font-size: 13px;
}

window#waybar {
  background-color: rgba(30, 30, 46, 0.9);
  color: #cdd6f4;
}

#clock {
  color: #89b4fa;
  padding: 0 10px;
}

#battery {
  color: #a6e3a1;
  padding: 0 10px;
}
`

export const mockCompositorInfo: CompositorInfo = {
  name: 'hyprland',
  version: '0.35.0',
  session_type: 'wayland',
}

export const mockBackups = [
  'config.backup.2024-01-15-14-30-00',
  'config.backup.2024-01-14-10-15-00',
  'config.backup.2024-01-13-16-45-00',
]

// ============================================================================
// MOCK IMPLEMENTATION
// ============================================================================

/**
 * Mock Tauri invoke function
 * Simulates backend command calls
 */
export const mockInvoke = vi.fn((command: string, args?: Record<string, unknown>) => {
  switch (command) {
    // Config path detection
    case 'detect_config_paths':
      return Promise.resolve(mockConfigPaths)

    // Config file operations
    case 'load_config':
      return Promise.resolve(mockWaybarConfig)

    case 'save_config':
      return Promise.resolve()

    // CSS file operations
    case 'load_css':
      return Promise.resolve(mockCSS)

    case 'save_css':
      return Promise.resolve()

    // Backup operations
    case 'list_backups':
      return Promise.resolve(mockBackups)

    case 'restore_backup':
      return Promise.resolve()

    // Waybar process operations
    case 'reload_waybar':
      return Promise.resolve()

    case 'is_waybar_running':
      return Promise.resolve(true)

    case 'get_waybar_pids':
      return Promise.resolve([12345])

    case 'start_waybar':
      return Promise.resolve()

    case 'stop_waybar':
      return Promise.resolve()

    case 'restart_waybar':
      return Promise.resolve()

    // Compositor detection
    case 'detect_compositor':
      return Promise.resolve('hyprland')

    case 'get_compositor_info':
      return Promise.resolve(mockCompositorInfo)

    case 'is_compositor_running':
      if (args?.compositorName === 'hyprland') {
        return Promise.resolve(true)
      }
      return Promise.resolve(false)

    default:
      return Promise.reject(new Error(`Unknown command: ${command}`))
  }
})

/**
 * Mock Tauri API
 */
export const mockTauriAPI = {
  core: {
    invoke: mockInvoke,
  },
}

/**
 * Setup Tauri mocks for tests
 */
export function setupTauriMocks() {
  vi.mock('@tauri-apps/api/core', () => ({
    invoke: mockInvoke,
  }))
}

/**
 * Reset Tauri mocks to default state
 */
export function resetTauriMocks() {
  mockInvoke.mockClear()
}

/**
 * Make a specific Tauri command fail
 */
export function mockTauriError(command: string, errorMessage: string) {
  const originalImpl = mockInvoke.getMockImplementation()
  ;(mockInvoke.mockImplementation as any)((cmd: string) => {
    if (cmd === command) {
      return Promise.reject(new Error(errorMessage))
    }
    return originalImpl ? originalImpl(cmd) : Promise.resolve()
  })
}
