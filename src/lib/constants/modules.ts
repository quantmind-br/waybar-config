// ============================================================================
// MODULE METADATA CONSTANTS
// ============================================================================

import type { ModuleMetadata, ModuleType } from '../types/config'

/**
 * Comprehensive metadata for all Waybar modules
 * Used by the UI to display module information, icons, and categories
 */
export const MODULE_METADATA: ModuleMetadata[] = [
  // ============================================================================
  // SYSTEM MODULES
  // ============================================================================
  {
    type: 'battery',
    displayName: 'Battery',
    description: 'Display battery status and percentage',
    category: 'system',
    icon: '🔋',
  },
  {
    type: 'cpu',
    displayName: 'CPU',
    description: 'Display CPU usage percentage',
    category: 'system',
    icon: '💻',
  },
  {
    type: 'memory',
    displayName: 'Memory',
    description: 'Display RAM usage information',
    category: 'system',
    icon: '🧠',
  },
  {
    type: 'disk',
    displayName: 'Disk',
    description: 'Display disk space usage',
    category: 'system',
    icon: '💾',
  },
  {
    type: 'temperature',
    displayName: 'Temperature',
    description: 'Display system temperature sensors',
    category: 'system',
    icon: '🌡️',
  },
  {
    type: 'network',
    displayName: 'Network',
    description: 'Display network connection status',
    category: 'system',
    icon: '🌐',
  },
  {
    type: 'load',
    displayName: 'Load',
    description: 'Display system load average',
    category: 'system',
    icon: '📊',
  },
  {
    type: 'upower',
    displayName: 'UPower',
    description: 'Display UPower device information',
    category: 'system',
    icon: '⚡',
  },

  // ============================================================================
  // HARDWARE MODULES
  // ============================================================================
  {
    type: 'backlight',
    displayName: 'Backlight',
    description: 'Display and control screen brightness',
    category: 'hardware',
    icon: '☀️',
  },
  {
    type: 'pulseaudio',
    displayName: 'PulseAudio',
    description: 'Display and control audio volume',
    category: 'hardware',
    icon: '🔊',
  },
  {
    type: 'bluetooth',
    displayName: 'Bluetooth',
    description: 'Display Bluetooth connection status',
    category: 'hardware',
    icon: '🔵',
  },
  {
    type: 'keyboard-state',
    displayName: 'Keyboard State',
    description: 'Display keyboard lock states (Caps Lock, Num Lock)',
    category: 'hardware',
    icon: '⌨️',
  },

  // ============================================================================
  // WINDOW MANAGER MODULES - GENERIC
  // ============================================================================
  {
    type: 'workspaces',
    displayName: 'Workspaces',
    description: 'Display and switch between workspaces',
    category: 'wm',
    icon: '🗂️',
  },
  {
    type: 'taskbar',
    displayName: 'Taskbar',
    description: 'Display open windows as a taskbar',
    category: 'wm',
    icon: '📋',
  },
  {
    type: 'window',
    displayName: 'Window Title',
    description: 'Display the active window title',
    category: 'wm',
    icon: '🪟',
  },
  {
    type: 'mode',
    displayName: 'Mode',
    description: 'Display the current window manager mode',
    category: 'wm',
    icon: '🎯',
  },
  {
    type: 'language',
    displayName: 'Language',
    description: 'Display the current keyboard layout',
    category: 'wm',
    icon: '🌍',
  },

  // ============================================================================
  // WINDOW MANAGER MODULES - HYPRLAND
  // ============================================================================
  {
    type: 'hyprland/workspaces',
    displayName: 'Hyprland Workspaces',
    description: 'Display Hyprland workspaces with enhanced features',
    category: 'wm',
    icon: '🗂️',
    requiresWM: 'hyprland',
  },
  {
    type: 'hyprland/window',
    displayName: 'Hyprland Window',
    description: 'Display Hyprland active window title',
    category: 'wm',
    icon: '🪟',
    requiresWM: 'hyprland',
  },
  {
    type: 'hyprland/language',
    displayName: 'Hyprland Language',
    description: 'Display Hyprland keyboard layout',
    category: 'wm',
    icon: '🌍',
    requiresWM: 'hyprland',
  },
  {
    type: 'hyprland/submap',
    displayName: 'Hyprland Submap',
    description: 'Display Hyprland submap mode',
    category: 'wm',
    icon: '🎯',
    requiresWM: 'hyprland',
  },

  // ============================================================================
  // WINDOW MANAGER MODULES - SWAY
  // ============================================================================
  {
    type: 'sway/workspaces',
    displayName: 'Sway Workspaces',
    description: 'Display Sway workspaces',
    category: 'wm',
    icon: '🗂️',
    requiresWM: 'sway',
  },
  {
    type: 'sway/window',
    displayName: 'Sway Window',
    description: 'Display Sway active window title',
    category: 'wm',
    icon: '🪟',
    requiresWM: 'sway',
  },
  {
    type: 'sway/mode',
    displayName: 'Sway Mode',
    description: 'Display Sway mode',
    category: 'wm',
    icon: '🎯',
    requiresWM: 'sway',
  },
  {
    type: 'sway/language',
    displayName: 'Sway Language',
    description: 'Display Sway keyboard layout',
    category: 'wm',
    icon: '🌍',
    requiresWM: 'sway',
  },

  // ============================================================================
  // WINDOW MANAGER MODULES - RIVER
  // ============================================================================
  {
    type: 'river/tags',
    displayName: 'River Tags',
    description: 'Display River window manager tags',
    category: 'wm',
    icon: '🏷️',
    requiresWM: 'river',
  },

  // ============================================================================
  // WINDOW MANAGER MODULES - DWL
  // ============================================================================
  {
    type: 'dwl/tags',
    displayName: 'DWL Tags',
    description: 'Display DWL window manager tags',
    category: 'wm',
    icon: '🏷️',
    requiresWM: 'dwl',
  },

  // ============================================================================
  // MEDIA MODULES
  // ============================================================================
  {
    type: 'mpd',
    displayName: 'MPD',
    description: 'Display Music Player Daemon status',
    category: 'media',
    icon: '🎵',
  },
  {
    type: 'mpris',
    displayName: 'MPRIS',
    description: 'Display media player status via MPRIS',
    category: 'media',
    icon: '🎶',
  },
  {
    type: 'cava',
    displayName: 'Cava',
    description: 'Display audio visualizer',
    category: 'media',
    icon: '📊',
  },

  // ============================================================================
  // UTILITY MODULES
  // ============================================================================
  {
    type: 'clock',
    displayName: 'Clock',
    description: 'Display date and time',
    category: 'utility',
    icon: '🕐',
  },
  {
    type: 'tray',
    displayName: 'System Tray',
    description: 'Display system tray icons',
    category: 'utility',
    icon: '📍',
  },
  {
    type: 'idle_inhibitor',
    displayName: 'Idle Inhibitor',
    description: 'Control idle inhibition',
    category: 'utility',
    icon: '👁️',
  },
  {
    type: 'user',
    displayName: 'User',
    description: 'Display current user information',
    category: 'utility',
    icon: '👤',
  },
  {
    type: 'gamemode',
    displayName: 'GameMode',
    description: 'Display GameMode status',
    category: 'utility',
    icon: '🎮',
  },
  {
    type: 'privacy',
    displayName: 'Privacy',
    description: 'Display privacy indicators (camera, microphone)',
    category: 'utility',
    icon: '🔒',
  },
  {
    type: 'power-profiles-daemon',
    displayName: 'Power Profiles',
    description: 'Display and control power profiles',
    category: 'utility',
    icon: '⚙️',
  },
  {
    type: 'systemd-failed-units',
    displayName: 'Failed Systemd Units',
    description: 'Display failed systemd units',
    category: 'utility',
    icon: '⚠️',
  },
  {
    type: 'image',
    displayName: 'Image',
    description: 'Display a static image',
    category: 'utility',
    icon: '🖼️',
  },
  {
    type: 'group',
    displayName: 'Group',
    description: 'Group multiple modules together',
    category: 'utility',
    icon: '📦',
  },
  {
    type: 'custom',
    displayName: 'Custom',
    description: 'Create a custom module with a script',
    category: 'utility',
    icon: '🔧',
  },
]

/**
 * Map of module types to their metadata for quick lookup
 */
export const MODULE_METADATA_MAP = new Map<ModuleType, ModuleMetadata>(
  MODULE_METADATA.map(m => [m.type, m])
)

/**
 * Get metadata for a specific module type
 */
export function getModuleMetadata(type: ModuleType): ModuleMetadata | undefined {
  return MODULE_METADATA_MAP.get(type)
}

/**
 * Get all modules by category
 */
export function getModulesByCategory(category: string): ModuleMetadata[] {
  return MODULE_METADATA.filter(m => m.category === category)
}

/**
 * Get all available module categories
 */
export const MODULE_CATEGORIES = [
  { id: 'system', label: 'System', icon: '💻' },
  { id: 'hardware', label: 'Hardware', icon: '🔧' },
  { id: 'wm', label: 'Window Manager', icon: '🪟' },
  { id: 'media', label: 'Media', icon: '🎵' },
  { id: 'utility', label: 'Utilities', icon: '🛠️' },
] as const
