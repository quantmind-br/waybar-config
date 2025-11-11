// ============================================================================
// CORE TYPE DEFINITIONS
// ============================================================================

/**
 * Root configuration object containing all bars, styles, and metadata
 */
export interface WaybarConfig {
  bars: BarDefinition[]
  styles: StyleDefinition[]
  metadata: ConfigMetadata
}

/**
 * A complete bar definition with configuration and modules
 */
export interface BarDefinition {
  id: string
  name?: string
  enabled: boolean
  order: number
  config: BarConfig
  modules: ModuleInstance[]
}

/**
 * Waybar bar-level configuration properties
 * Maps directly to Waybar's JSON configuration
 */
export interface BarConfig {
  // Positioning
  layer?: 'top' | 'bottom'
  position?: 'top' | 'bottom' | 'left' | 'right'
  output?: string | string[]

  // Dimensions
  height?: number
  width?: number

  // Spacing
  margin?: string
  'margin-top'?: number
  'margin-bottom'?: number
  'margin-left'?: number
  'margin-right'?: number
  spacing?: number

  // Behavior
  mode?: 'dock' | 'hide' | 'invisible' | 'overlay'
  exclusive?: boolean
  passthrough?: boolean
  'gtk-layer-shell'?: boolean
  ipc?: boolean

  // Customization
  name?: string
  'reload_style_on_change'?: boolean

  // Module layout (automatically generated from ModuleInstance[])
  'modules-left'?: string[]
  'modules-center'?: string[]
  'modules-right'?: string[]
}

/**
 * A module instance within a bar
 */
export interface ModuleInstance {
  id: string // UUID for internal tracking
  type: ModuleType
  customName?: string // For #battery#bat0 naming
  position: 'left' | 'center' | 'right'
  order: number
  config: ModuleConfig
  enabled: boolean
}

/**
 * All supported Waybar module types
 */
export type ModuleType =
  // System
  | 'battery' | 'cpu' | 'memory' | 'disk' | 'temperature'
  | 'network' | 'load' | 'upower'
  // Hardware
  | 'backlight' | 'pulseaudio' | 'bluetooth' | 'keyboard-state'
  // Window Manager
  | 'workspaces' | 'taskbar' | 'window' | 'mode' | 'language'
  | 'hyprland/workspaces' | 'hyprland/window' | 'hyprland/language'
  | 'hyprland/submap' | 'sway/workspaces' | 'sway/window'
  | 'sway/mode' | 'sway/language' | 'river/tags' | 'dwl/tags'
  // Media
  | 'mpd' | 'mpris' | 'cava'
  // Utilities
  | 'clock' | 'tray' | 'idle_inhibitor' | 'user' | 'gamemode'
  | 'privacy' | 'power-profiles-daemon' | 'systemd-failed-units'
  | 'image' | 'group' | 'custom'

/**
 * Module configuration properties
 * Contains common properties and module-specific properties
 */
export interface ModuleConfig {
  // Common to all modules
  format?: string
  'format-icons'?: string[] | Record<string, string>
  'max-length'?: number
  rotate?: number
  tooltip?: boolean
  'tooltip-format'?: string

  // Interactive actions
  'on-click'?: string
  'on-click-middle'?: string
  'on-click-right'?: string
  'on-scroll-up'?: string
  'on-scroll-down'?: string

  // States
  states?: Record<string, number>

  // Module-specific config (use discriminated union or Record<string, any>)
  [key: string]: any
}

/**
 * A CSS style definition
 */
export interface StyleDefinition {
  id: string
  name: string
  selector: string
  properties: CSSProperty[]
  enabled: boolean
}

/**
 * A single CSS property
 */
export interface CSSProperty {
  property: string
  value: string
  important: boolean
}

/**
 * Configuration metadata for tracking versions and timestamps
 */
export interface ConfigMetadata {
  version: string
  createdAt: string
  modifiedAt: string
  appVersion: string
}

/**
 * Module categories for organization
 */
export type ModuleCategory = 'system' | 'hardware' | 'wm' | 'media' | 'utility'

/**
 * Metadata about a module type for UI display
 */
export interface ModuleMetadata {
  type: ModuleType
  displayName: string
  description: string
  category: ModuleCategory
  icon: string
  requiresWM?: string // 'hyprland' | 'sway' | 'river' | 'dwl'
}
