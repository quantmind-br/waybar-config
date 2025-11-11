// ============================================================================
// CONFIG TRANSFORMATION - Convert between internal and Waybar formats
// ============================================================================

import type {
  WaybarConfig,
  BarDefinition,
  BarConfig,
  ModuleInstance,
  StyleDefinition,
  CSSProperty,
} from '../types/config'

// ============================================================================
// TYPES
// ============================================================================

/**
 * Waybar's native JSON configuration format
 * Each bar is a separate JSON object
 */
export interface WaybarJSON {
  // Bar-level configuration
  layer?: string
  position?: string
  output?: string | string[]
  height?: number
  width?: number
  margin?: string
  'margin-top'?: number
  'margin-bottom'?: number
  'margin-left'?: number
  'margin-right'?: number
  spacing?: number
  mode?: string
  exclusive?: boolean
  passthrough?: boolean
  'gtk-layer-shell'?: boolean
  ipc?: boolean
  name?: string
  reload_style_on_change?: boolean

  // Module arrays
  'modules-left'?: string[]
  'modules-center'?: string[]
  'modules-right'?: string[]

  // Module configurations (key is module ID)
  [moduleId: string]: any
}

/**
 * Parse result with potential warnings
 */
export interface TransformResult<T> {
  data: T
  warnings: string[]
}

// ============================================================================
// WAYBAR CONFIG → WAYBAR JSON
// ============================================================================

/**
 * Generate Waybar module ID from type and custom name
 * Examples:
 * - battery → "battery"
 * - battery + "bat0" → "battery#bat0"
 * - hyprland/workspaces → "hyprland/workspaces"
 * - hyprland/workspaces + "ws1" → "hyprland/workspaces#ws1"
 */
export function generateModuleId(type: string, customName?: string): string {
  if (customName) {
    return `${type}#${customName}`
  }
  return type
}

/**
 * Parse Waybar module ID into type and custom name
 * Examples:
 * - "battery" → { type: "battery", customName: undefined }
 * - "battery#bat0" → { type: "battery", customName: "bat0" }
 * - "hyprland/workspaces#ws1" → { type: "hyprland/workspaces", customName: "ws1" }
 */
export function parseModuleId(moduleId: string): { type: string; customName?: string } {
  const hashIndex = moduleId.indexOf('#')

  if (hashIndex === -1) {
    return { type: moduleId }
  }

  return {
    type: moduleId.substring(0, hashIndex),
    customName: moduleId.substring(hashIndex + 1),
  }
}

/**
 * Convert a BarDefinition to Waybar's JSON format
 */
export function barToWaybarJSON(bar: BarDefinition): WaybarJSON {
  const waybarJSON: WaybarJSON = {
    // Copy bar-level configuration
    ...bar.config,
  }

  // Filter enabled modules and sort by order
  const enabledModules = bar.modules
    .filter(m => m.enabled)
    .sort((a, b) => a.order - b.order)

  // Group modules by position
  const modulesLeft: string[] = []
  const modulesCenter: string[] = []
  const modulesRight: string[] = []

  for (const module of enabledModules) {
    const moduleId = generateModuleId(module.type, module.customName)

    // Add to appropriate position array
    switch (module.position) {
      case 'left':
        modulesLeft.push(moduleId)
        break
      case 'center':
        modulesCenter.push(moduleId)
        break
      case 'right':
        modulesRight.push(moduleId)
        break
    }

    // Add module configuration
    waybarJSON[moduleId] = module.config
  }

  // Set module arrays (only if not empty)
  if (modulesLeft.length > 0) {
    waybarJSON['modules-left'] = modulesLeft
  }
  if (modulesCenter.length > 0) {
    waybarJSON['modules-center'] = modulesCenter
  }
  if (modulesRight.length > 0) {
    waybarJSON['modules-right'] = modulesRight
  }

  return waybarJSON
}

/**
 * Convert full WaybarConfig to Waybar JSON format
 * Returns first enabled bar or first bar if none are enabled
 */
export function waybarConfigToJSON(config: WaybarConfig): WaybarJSON {
  // Find first enabled bar
  const enabledBar = config.bars.find(b => b.enabled)
  const bar = enabledBar || config.bars[0]

  if (!bar) {
    // Return empty config if no bars
    return {}
  }

  return barToWaybarJSON(bar)
}

/**
 * Convert multiple bars to named Waybar configs
 * Returns object where keys are bar names/IDs and values are Waybar JSON
 */
export function waybarConfigToMultiJSON(
  config: WaybarConfig
): Record<string, WaybarJSON> {
  const result: Record<string, WaybarJSON> = {}

  for (const bar of config.bars) {
    if (!bar.enabled) continue

    const barName = bar.name || bar.id
    result[barName] = barToWaybarJSON(bar)
  }

  return result
}

// ============================================================================
// WAYBAR JSON → WAYBAR CONFIG
// ============================================================================

/**
 * Parse Waybar JSON into BarDefinition
 */
export function waybarJSONToBar(
  json: WaybarJSON,
  barId?: string,
  barName?: string
): TransformResult<BarDefinition> {
  const warnings: string[] = []

  // Extract bar-level config
  const config: BarConfig = {}
  const moduleConfigs: Record<string, any> = {}

  // Known bar-level properties
  const barLevelProps = new Set([
    'layer', 'position', 'output', 'height', 'width',
    'margin', 'margin-top', 'margin-bottom', 'margin-left', 'margin-right',
    'spacing', 'mode', 'exclusive', 'passthrough', 'gtk-layer-shell',
    'ipc', 'name', 'reload_style_on_change',
    'modules-left', 'modules-center', 'modules-right',
  ])

  // Separate bar config from module configs
  for (const [key, value] of Object.entries(json)) {
    if (barLevelProps.has(key)) {
      if (key !== 'modules-left' && key !== 'modules-center' && key !== 'modules-right') {
        (config as any)[key] = value
      }
    } else {
      moduleConfigs[key] = value
    }
  }

  // Parse modules from position arrays
  const modules: ModuleInstance[] = []
  let order = 0

  // Helper to add modules from position array
  const addModules = (position: 'left' | 'center' | 'right', moduleIds?: string[]) => {
    if (!moduleIds) return

    for (const moduleId of moduleIds) {
      const { type, customName } = parseModuleId(moduleId)
      const moduleConfig = moduleConfigs[moduleId] || {}

      modules.push({
        id: crypto.randomUUID(),
        type: type as any, // Type will be validated by Zod
        customName,
        position,
        order: order++,
        config: moduleConfig,
        enabled: true,
      })
    }
  }

  addModules('left', json['modules-left'])
  addModules('center', json['modules-center'])
  addModules('right', json['modules-right'])

  // Check for orphaned module configs (not in any position array)
  const referencedModules = new Set([
    ...(json['modules-left'] || []),
    ...(json['modules-center'] || []),
    ...(json['modules-right'] || []),
  ])

  for (const moduleId of Object.keys(moduleConfigs)) {
    if (!referencedModules.has(moduleId)) {
      warnings.push(
        `Module configuration "${moduleId}" exists but is not referenced in any modules-left/center/right array`
      )
    }
  }

  return {
    data: {
      id: barId || crypto.randomUUID(),
      name: barName || config.name || 'Imported Bar',
      enabled: true,
      order: 0,
      config,
      modules,
    },
    warnings,
  }
}

/**
 * Convert Waybar JSON to WaybarConfig
 */
export function jsonToWaybarConfig(
  json: WaybarJSON,
  existingConfig?: WaybarConfig
): TransformResult<WaybarConfig> {
  const barResult = waybarJSONToBar(json)

  return {
    data: {
      bars: [barResult.data],
      styles: existingConfig?.styles || [],
      metadata: existingConfig?.metadata || {
        version: '1.0.0',
        createdAt: new Date().toISOString(),
        modifiedAt: new Date().toISOString(),
        appVersion: '1.0.0',
      },
    },
    warnings: barResult.warnings,
  }
}

/**
 * Merge imported bar with existing config
 */
export function mergeBarIntoConfig(
  config: WaybarConfig,
  newBar: BarDefinition
): WaybarConfig {
  // Check if bar with same name exists
  const existingIndex = config.bars.findIndex(
    b => b.name === newBar.name || b.id === newBar.id
  )

  if (existingIndex !== -1) {
    // Replace existing bar
    const updatedBars = [...config.bars]
    updatedBars[existingIndex] = {
      ...newBar,
      order: config.bars[existingIndex].order, // Preserve original order
    }

    return {
      ...config,
      bars: updatedBars,
      metadata: {
        ...config.metadata,
        modifiedAt: new Date().toISOString(),
      },
    }
  } else {
    // Add new bar
    return {
      ...config,
      bars: [
        ...config.bars,
        {
          ...newBar,
          order: config.bars.length,
        },
      ],
      metadata: {
        ...config.metadata,
        modifiedAt: new Date().toISOString(),
      },
    }
  }
}

// ============================================================================
// CSS TRANSFORMATION
// ============================================================================

/**
 * Convert StyleDefinition array to CSS string
 */
export function stylesToCSS(styles: StyleDefinition[]): string {
  const cssBlocks: string[] = []

  for (const style of styles) {
    if (!style.enabled) continue
    if (style.properties.length === 0) continue

    // Build CSS rule
    const properties = style.properties
      .map(prop => {
        const important = prop.important ? ' !important' : ''
        return `  ${prop.property}: ${prop.value}${important};`
      })
      .join('\n')

    const block = `${style.selector} {\n${properties}\n}`
    cssBlocks.push(block)
  }

  return cssBlocks.join('\n\n')
}

/**
 * Parse CSS string into StyleDefinition array
 * Basic parser - handles simple rules, may not cover all edge cases
 */
export function cssToStyles(css: string): TransformResult<StyleDefinition[]> {
  const styles: StyleDefinition[] = []
  const warnings: string[] = []

  // Simple regex to extract CSS rules
  // Matches: selector { properties }
  const ruleRegex = /([^{]+)\{([^}]+)\}/g
  let match

  while ((match = ruleRegex.exec(css)) !== null) {
    const selector = match[1].trim()
    const propertiesBlock = match[2].trim()

    if (!selector || !propertiesBlock) continue

    // Parse properties
    const properties: CSSProperty[] = []
    const propertyLines = propertiesBlock.split(';')

    for (const line of propertyLines) {
      const trimmed = line.trim()
      if (!trimmed) continue

      const colonIndex = trimmed.indexOf(':')
      if (colonIndex === -1) {
        warnings.push(`Invalid CSS property: "${trimmed}"`)
        continue
      }

      const property = trimmed.substring(0, colonIndex).trim()
      let value = trimmed.substring(colonIndex + 1).trim()
      let important = false

      // Check for !important
      if (value.endsWith('!important')) {
        important = true
        value = value.substring(0, value.length - 10).trim()
      }

      properties.push({ property, value, important })
    }

    if (properties.length > 0) {
      styles.push({
        id: crypto.randomUUID(),
        name: `Style for ${selector}`,
        selector,
        properties,
        enabled: true,
      })
    }
  }

  if (styles.length === 0 && css.trim().length > 0) {
    warnings.push('No valid CSS rules could be parsed from the input')
  }

  return { data: styles, warnings }
}

// ============================================================================
// CONVENIENCE EXPORTS
// ============================================================================

export const transform = {
  // Module IDs
  generateModuleId,
  parseModuleId,

  // Bar transformations
  barToWaybarJSON,
  waybarJSONToBar,
  mergeBarIntoConfig,

  // Config transformations
  waybarConfigToJSON,
  waybarConfigToMultiJSON,
  jsonToWaybarConfig,

  // CSS transformations
  stylesToCSS,
  cssToStyles,
}
