// ============================================================================
// BAR CONFIGURATION VALIDATION SCHEMAS
// ============================================================================

import { z } from 'zod'

/**
 * Interactive action schemas for click and scroll handlers
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
 * Waybar bar-level configuration schema
 * Validates bar positioning, dimensions, spacing, and behavior
 */
export const BarConfigSchema = z.object({
  // Positioning
  layer: z.enum(['top', 'bottom']).optional(),
  position: z.enum(['top', 'bottom', 'left', 'right']).optional(),
  output: z.union([z.string(), z.array(z.string())]).optional(),

  // Dimensions
  height: z.number().int().positive().optional(),
  width: z.number().int().positive().optional(),

  // Spacing
  margin: z.string().optional(),
  'margin-top': z.number().optional(),
  'margin-bottom': z.number().optional(),
  'margin-left': z.number().optional(),
  'margin-right': z.number().optional(),
  spacing: z.number().default(4),

  // Behavior
  mode: z.enum(['dock', 'hide', 'invisible', 'overlay']).optional(),
  exclusive: z.boolean().default(true),
  passthrough: z.boolean().default(false),
  'gtk-layer-shell': z.boolean().default(true),
  ipc: z.boolean().default(false),

  // Customization
  name: z.string().optional(),
  'reload_style_on_change': z.boolean().default(true),

  // Module layout arrays (auto-generated from ModuleInstance[])
  'modules-left': z.array(z.string()).optional(),
  'modules-center': z.array(z.string()).optional(),
  'modules-right': z.array(z.string()).optional(),
})

/**
 * Bar definition schema including modules
 */
export const BarDefinitionSchema = z.object({
  id: z.string().uuid(),
  name: z.string().optional(),
  enabled: z.boolean().default(true),
  order: z.number().int().nonnegative(),
  config: BarConfigSchema,
  modules: z.array(z.any()), // Will be validated with ModuleInstanceSchema
})

/**
 * Configuration metadata schema
 */
export const ConfigMetadataSchema = z.object({
  version: z.string(),
  createdAt: z.string().datetime(),
  modifiedAt: z.string().datetime(),
  appVersion: z.string(),
})

/**
 * Style definition schema
 */
export const CSSPropertySchema = z.object({
  property: z.string(),
  value: z.string(),
  important: z.boolean().default(false),
})

export const StyleDefinitionSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  selector: z.string(),
  properties: z.array(CSSPropertySchema),
  enabled: z.boolean().default(true),
})

/**
 * Root Waybar configuration schema
 */
export const WaybarConfigSchema = z.object({
  bars: z.array(BarDefinitionSchema),
  styles: z.array(StyleDefinitionSchema),
  metadata: ConfigMetadataSchema,
})

// Type inference from schemas
export type BarConfigSchemaType = z.infer<typeof BarConfigSchema>
export type BarDefinitionSchemaType = z.infer<typeof BarDefinitionSchema>
export type WaybarConfigSchemaType = z.infer<typeof WaybarConfigSchema>
