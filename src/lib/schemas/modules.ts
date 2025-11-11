// ============================================================================
// MODULE VALIDATION SCHEMAS
// ============================================================================

import { z } from 'zod'

/**
 * All supported module types
 */
export const ModuleTypeSchema = z.enum([
  // System
  'battery', 'cpu', 'memory', 'disk', 'temperature',
  'network', 'load', 'upower',
  // Hardware
  'backlight', 'pulseaudio', 'bluetooth', 'keyboard-state',
  // Window Manager - Generic
  'workspaces', 'taskbar', 'window', 'mode', 'language',
  // Window Manager - Hyprland
  'hyprland/workspaces', 'hyprland/window', 'hyprland/language',
  'hyprland/submap',
  // Window Manager - Sway
  'sway/workspaces', 'sway/window', 'sway/mode', 'sway/language',
  // Window Manager - River
  'river/tags',
  // Window Manager - DWL
  'dwl/tags',
  // Media
  'mpd', 'mpris', 'cava',
  // Utilities
  'clock', 'tray', 'idle_inhibitor', 'user', 'gamemode',
  'privacy', 'power-profiles-daemon', 'systemd-failed-units',
  'image', 'group', 'custom',
])

/**
 * Interactive actions schema (reused from bar-config)
 */
export const InteractiveActionsSchema = z.object({
  'on-click': z.string().optional(),
  'on-click-release': z.string().optional(),
  'on-double-click': z.string().optional(),
  'on-triple-click': z.string().optional(),
  'on-click-middle': z.string().optional(),
  'on-click-right': z.string().optional(),
  'on-scroll-up': z.string().optional(),
  'on-scroll-down': z.string().optional(),
  'on-update': z.string().optional(),
})

/**
 * Common module configuration properties shared by all modules
 */
export const CommonModuleConfigSchema = InteractiveActionsSchema.extend({
  // Formatting
  format: z.string().optional(),
  'format-icons': z.union([
    z.array(z.string()),
    z.record(z.string(), z.string())
  ]).optional(),
  'max-length': z.number().int().positive().optional(),
  'min-length': z.number().int().positive().optional(),
  'align': z.number().min(0).max(1).optional(),
  rotate: z.number().optional(),

  // Tooltip
  tooltip: z.boolean().default(true),
  'tooltip-format': z.string().optional(),

  // States (for conditional styling)
  states: z.record(z.string(), z.number()).optional(),

  // Module visibility
  'return-type': z.enum(['', 'json']).optional(),
})

/**
 * Module instance schema
 */
export const ModuleInstanceSchema = z.object({
  id: z.string().uuid(),
  type: ModuleTypeSchema,
  customName: z.string().optional(),
  position: z.enum(['left', 'center', 'right']),
  order: z.number().int().nonnegative(),
  config: z.record(z.string(), z.any()), // Validated dynamically based on type
  enabled: z.boolean().default(true),
})

// Type inference
export type ModuleTypeSchemaType = z.infer<typeof ModuleTypeSchema>
export type CommonModuleConfigSchemaType = z.infer<typeof CommonModuleConfigSchema>
export type ModuleInstanceSchemaType = z.infer<typeof ModuleInstanceSchema>
