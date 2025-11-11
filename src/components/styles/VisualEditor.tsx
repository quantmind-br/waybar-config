// ============================================================================
// VISUAL EDITOR - Visual CSS Property Controls
// ============================================================================

import { useCallback } from 'react'
import { StyleDefinition, CSSProperty } from '../../lib/types/config'
import {
  ColorControl,
  SpacingControl,
  BorderControl,
  TypographyControl,
} from './PropertyControls'

// ============================================================================
// TYPES
// ============================================================================

export interface VisualEditorProps {
  style: StyleDefinition
  onChange: (updates: Partial<StyleDefinition>) => void
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Update a CSS property in the properties array
 */
function updateProperty(
  properties: CSSProperty[],
  propertyName: string,
  value: string,
  important: boolean = false
): CSSProperty[] {
  const existingIndex = properties.findIndex((p) => p.property === propertyName)

  if (existingIndex !== -1) {
    // Update existing property
    const newProperties = [...properties]
    newProperties[existingIndex] = {
      property: propertyName,
      value,
      important,
    }
    return newProperties
  } else {
    // Add new property
    return [
      ...properties,
      {
        property: propertyName,
        value,
        important,
      },
    ]
  }
}

/**
 * Remove a CSS property from the properties array
 */
function removeProperty(
  properties: CSSProperty[],
  propertyName: string
): CSSProperty[] {
  return properties.filter((p) => p.property !== propertyName)
}

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * VisualEditor - Visual controls for CSS properties
 *
 * Features:
 * - Color controls (background, color, border-color)
 * - Spacing controls (margin, padding)
 * - Border controls (border-width, border-style, border-radius)
 * - Typography controls (font-family, font-size, font-weight)
 * - Debounced updates to prevent performance issues
 */
export function VisualEditor({ style, onChange }: VisualEditorProps) {
  const { properties } = style

  // Debounced property update handler
  const handlePropertyChange = useCallback(
    (propertyName: string, value: string) => {
      if (value === '') {
        // Remove property if value is empty
        onChange({
          properties: removeProperty(properties, propertyName),
        })
      } else {
        // Update or add property
        onChange({
          properties: updateProperty(properties, propertyName, value),
        })
      }
    },
    [properties, onChange]
  )

  return (
    <div className="space-y-6 p-6">
      {/* Colors Section */}
      <div className="rounded-lg border border-gray-800 bg-gray-850 p-6">
        <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-gray-400">
          Colors
        </h3>
        <ColorControl
          properties={properties}
          onChange={handlePropertyChange}
        />
      </div>

      {/* Spacing Section */}
      <div className="rounded-lg border border-gray-800 bg-gray-850 p-6">
        <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-gray-400">
          Spacing
        </h3>
        <SpacingControl
          properties={properties}
          onChange={handlePropertyChange}
        />
      </div>

      {/* Border Section */}
      <div className="rounded-lg border border-gray-800 bg-gray-850 p-6">
        <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-gray-400">
          Border
        </h3>
        <BorderControl
          properties={properties}
          onChange={handlePropertyChange}
        />
      </div>

      {/* Typography Section */}
      <div className="rounded-lg border border-gray-800 bg-gray-850 p-6">
        <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-gray-400">
          Typography
        </h3>
        <TypographyControl
          properties={properties}
          onChange={handlePropertyChange}
        />
      </div>

      {/* Additional Properties Info */}
      <div className="rounded-lg border border-blue-900/30 bg-blue-950/20 p-4">
        <p className="text-xs text-blue-300/80">
          <strong>Tip:</strong> Use the Code Editor tab for advanced CSS properties
          not available in the visual editor.
        </p>
      </div>
    </div>
  )
}
