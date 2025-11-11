// ============================================================================
// MODULE-SPECIFIC VALIDATION SCHEMAS
// ============================================================================

import { z } from 'zod'
import { CommonModuleConfigSchema } from './modules'
import type { ModuleType } from '../types/config'

/**
 * Battery module schema
 * CRITICAL: Battery states are <= threshold (reversed from other modules)
 */
export const BatteryModuleSchema = CommonModuleConfigSchema.extend({
  bat: z.string().optional(),
  adapter: z.string().optional(),
  interval: z.number().int().positive().default(60),
  'full-at': z.number().int().min(0).max(100).default(99),
  'design-capacity': z.boolean().default(false),
  'format-time': z.string().optional(),
  'format-charging': z.string().optional(),
  'format-plugged': z.string().optional(),
  'format-full': z.string().optional(),
  'format-discharging': z.string().optional(),
  'format-alt': z.string().optional(),
  'weighted-average': z.boolean().default(false),
})

/**
 * Clock module schema
 */
export const ClockModuleSchema = CommonModuleConfigSchema.extend({
  interval: z.number().int().positive().default(60),
  timezone: z.string().optional(),
  timezones: z.array(z.string()).optional(),
  locale: z.string().optional(),
  'format-alt': z.string().optional(),
  calendar: z.object({
    mode: z.enum(['year', 'month']).default('month'),
    'mode-mon-col': z.number().int().default(3),
    'weeks-pos': z.string().optional(),
    'on-scroll': z.number().int().default(1),
    format: z.object({
      months: z.string().optional(),
      days: z.string().optional(),
      weeks: z.string().optional(),
      weekdays: z.string().optional(),
      today: z.string().optional(),
    }).optional(),
  }).optional(),
  actions: z.object({
    'on-click-right': z.enum(['mode', 'tz_up', 'tz_down', 'shift_up', 'shift_down']).optional(),
    'on-click-forward': z.enum(['tz_up', 'tz_down', 'shift_up', 'shift_down']).optional(),
    'on-click-backward': z.enum(['tz_up', 'tz_down', 'shift_up', 'shift_down']).optional(),
    'on-scroll-up': z.enum(['tz_up', 'tz_down', 'shift_up', 'shift_down']).optional(),
    'on-scroll-down': z.enum(['tz_up', 'tz_down', 'shift_up', 'shift_down']).optional(),
  }).optional(),
})

/**
 * CPU module schema
 */
export const CPUModuleSchema = CommonModuleConfigSchema.extend({
  interval: z.number().int().positive().default(10),
  'format-alt': z.string().optional(),
  'format-alt-click': z.enum(['click', 'click-right', 'click-middle', 'click-backward', 'click-forward']).optional(),
})

/**
 * Memory module schema
 */
export const MemoryModuleSchema = CommonModuleConfigSchema.extend({
  interval: z.number().int().positive().default(30),
  'format-alt': z.string().optional(),
  'format-alt-click': z.enum(['click', 'click-right', 'click-middle', 'click-backward', 'click-forward']).optional(),
})

/**
 * Network module schema
 */
export const NetworkModuleSchema = CommonModuleConfigSchema.extend({
  interface: z.string().optional(),
  'interface-type': z.enum(['ethernet', 'wifi']).optional(),
  interval: z.number().int().positive().default(60),
  'format-ethernet': z.string().optional(),
  'format-wifi': z.string().optional(),
  'format-linked': z.string().optional(),
  'format-disconnected': z.string().optional(),
  'format-disabled': z.string().optional(),
  'format-alt': z.string().optional(),
  'tooltip-format': z.string().optional(),
  'tooltip-format-wifi': z.string().optional(),
  'tooltip-format-ethernet': z.string().optional(),
  'tooltip-format-disconnected': z.string().optional(),
  'min-length': z.number().int().positive().optional(),
  'max-length': z.number().int().positive().optional(),
})

/**
 * Disk module schema
 */
export const DiskModuleSchema = CommonModuleConfigSchema.extend({
  interval: z.number().int().positive().default(30),
  path: z.string().default('/'),
  'format-alt': z.string().optional(),
})

/**
 * Temperature module schema
 */
export const TemperatureModuleSchema = CommonModuleConfigSchema.extend({
  interval: z.number().int().positive().default(10),
  'thermal-zone': z.number().int().nonnegative().optional(),
  'hwmon-path': z.string().optional(),
  'hwmon-path-abs': z.string().optional(),
  'input-filename': z.string().optional(),
  'critical-threshold': z.number().default(80),
  'format-critical': z.string().optional(),
})

/**
 * Backlight module schema
 */
export const BacklightModuleSchema = CommonModuleConfigSchema.extend({
  device: z.string().optional(),
  interval: z.number().int().positive().optional(),
  'format-alt': z.string().optional(),
  'scroll-step': z.number().positive().default(1.0),
  'reverse-scrolling': z.boolean().default(false),
})

/**
 * Pulseaudio module schema
 */
export const PulseaudioModuleSchema = CommonModuleConfigSchema.extend({
  'format-bluetooth': z.string().optional(),
  'format-bluetooth-muted': z.string().optional(),
  'format-muted': z.string().optional(),
  'format-source': z.string().optional(),
  'format-source-muted': z.string().optional(),
  'scroll-step': z.number().positive().default(1.0),
  'reverse-scrolling': z.boolean().default(false),
  'smooth-scrolling-threshold': z.number().positive().optional(),
  'max-volume': z.number().positive().default(100),
  'ignored-sinks': z.array(z.string()).optional(),
})

/**
 * Hyprland Workspaces module schema
 */
export const HyprlandWorkspacesModuleSchema = CommonModuleConfigSchema.extend({
  'all-outputs': z.boolean().default(false),
  'active-only': z.boolean().default(false),
  'move-to-monitor': z.boolean().default(false),
  'format-window-separator': z.string().optional(),
  'window-rewrite-default': z.string().optional(),
  'window-rewrite': z.record(z.string(), z.string()).optional(),
  'show-special': z.boolean().default(false),
  'special-only': z.boolean().default(false),
  'sort-by-number': z.boolean().default(false),
  'sort-by-name': z.boolean().default(false),
})

/**
 * Custom module schema
 */
export const CustomModuleSchema = CommonModuleConfigSchema.extend({
  exec: z.string().optional(),
  'exec-if': z.string().optional(),
  'exec-on-event': z.boolean().default(true),
  interval: z.union([z.number().int().positive(), z.literal('once')]).optional(),
  restart: z.number().int().positive().optional(),
  'signal': z.number().int().positive().optional(),
  'return-type': z.enum(['', 'json']).default(''),
  escape: z.boolean().default(false),
})

/**
 * Tray module schema
 */
export const TrayModuleSchema = CommonModuleConfigSchema.extend({
  'icon-size': z.number().int().positive().default(16),
  spacing: z.number().int().nonnegative().default(10),
  'show-passive-items': z.boolean().default(true),
  'reverse-direction': z.boolean().default(false),
})

/**
 * Registry of all module-specific schemas
 * Used for dynamic validation based on module type
 */
export const ModuleSchemas: Record<ModuleType, z.ZodSchema> = {
  // System
  battery: BatteryModuleSchema,
  cpu: CPUModuleSchema,
  memory: MemoryModuleSchema,
  disk: DiskModuleSchema,
  temperature: TemperatureModuleSchema,
  network: NetworkModuleSchema,
  load: CommonModuleConfigSchema, // Uses only common config
  upower: CommonModuleConfigSchema,

  // Hardware
  backlight: BacklightModuleSchema,
  pulseaudio: PulseaudioModuleSchema,
  bluetooth: CommonModuleConfigSchema,
  'keyboard-state': CommonModuleConfigSchema,

  // Window Manager - Generic
  workspaces: CommonModuleConfigSchema,
  taskbar: CommonModuleConfigSchema,
  window: CommonModuleConfigSchema,
  mode: CommonModuleConfigSchema,
  language: CommonModuleConfigSchema,

  // Window Manager - Hyprland
  'hyprland/workspaces': HyprlandWorkspacesModuleSchema,
  'hyprland/window': CommonModuleConfigSchema,
  'hyprland/language': CommonModuleConfigSchema,
  'hyprland/submap': CommonModuleConfigSchema,

  // Window Manager - Sway
  'sway/workspaces': CommonModuleConfigSchema,
  'sway/window': CommonModuleConfigSchema,
  'sway/mode': CommonModuleConfigSchema,
  'sway/language': CommonModuleConfigSchema,

  // Window Manager - River
  'river/tags': CommonModuleConfigSchema,

  // Window Manager - DWL
  'dwl/tags': CommonModuleConfigSchema,

  // Media
  mpd: CommonModuleConfigSchema,
  mpris: CommonModuleConfigSchema,
  cava: CommonModuleConfigSchema,

  // Utilities
  clock: ClockModuleSchema,
  tray: TrayModuleSchema,
  idle_inhibitor: CommonModuleConfigSchema,
  user: CommonModuleConfigSchema,
  gamemode: CommonModuleConfigSchema,
  privacy: CommonModuleConfigSchema,
  'power-profiles-daemon': CommonModuleConfigSchema,
  'systemd-failed-units': CommonModuleConfigSchema,
  image: CommonModuleConfigSchema,
  group: CommonModuleConfigSchema,
  custom: CustomModuleSchema,
}

/**
 * Helper function to get schema for a specific module type
 */
export function getModuleSchema(moduleType: ModuleType): z.ZodSchema {
  return ModuleSchemas[moduleType] || CommonModuleConfigSchema
}

/**
 * Helper function to validate module configuration
 */
export function validateModuleConfig(moduleType: ModuleType, config: unknown) {
  const schema = getModuleSchema(moduleType)
  return schema.safeParse(config)
}
