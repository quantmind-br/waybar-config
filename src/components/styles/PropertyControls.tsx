// ============================================================================
// PROPERTY CONTROLS - Individual CSS Property Input Components
// ============================================================================

import { CSSProperty } from '../../lib/types/config'
import { ColorPicker } from '../common/ColorPicker'
import { Input } from '../common/Input'
import { Select } from '../common/Select'

// ============================================================================
// TYPES
// ============================================================================

interface PropertyControlProps {
  properties: CSSProperty[]
  onChange: (propertyName: string, value: string) => void
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get the value of a CSS property from the properties array
 */
function getPropertyValue(
  properties: CSSProperty[],
  propertyName: string
): string {
  const prop = properties.find((p) => p.property === propertyName)
  return prop?.value || ''
}

// ============================================================================
// COLOR CONTROL
// ============================================================================

/**
 * ColorControl - Controls for color-related CSS properties
 *
 * Properties:
 * - background-color
 * - color (text color)
 * - border-color
 */
export function ColorControl({ properties, onChange }: PropertyControlProps) {
  return (
    <div className="space-y-4">
      <ColorPicker
        label="Background Color"
        value={getPropertyValue(properties, 'background-color') || '#000000'}
        onChange={(value) => onChange('background-color', value)}
        showAlpha={true}
      />

      <ColorPicker
        label="Text Color"
        value={getPropertyValue(properties, 'color') || '#ffffff'}
        onChange={(value) => onChange('color', value)}
        showAlpha={true}
      />

      <ColorPicker
        label="Border Color"
        value={getPropertyValue(properties, 'border-color') || '#000000'}
        onChange={(value) => onChange('border-color', value)}
        showAlpha={true}
      />
    </div>
  )
}

// ============================================================================
// SPACING CONTROL
// ============================================================================

/**
 * SpacingControl - Controls for spacing CSS properties
 *
 * Properties:
 * - margin (top, right, bottom, left)
 * - padding (top, right, bottom, left)
 */
export function SpacingControl({ properties, onChange }: PropertyControlProps) {
  return (
    <div className="space-y-6">
      {/* Margin */}
      <div className="space-y-3">
        <h4 className="text-xs font-semibold uppercase tracking-wide text-gray-500">
          Margin
        </h4>
        <div className="grid grid-cols-2 gap-3">
          <Input
            type="text"
            label="Top"
            value={getPropertyValue(properties, 'margin-top')}
            onChange={(e) => onChange('margin-top', e.target.value)}
            placeholder="0px"
          />
          <Input
            type="text"
            label="Right"
            value={getPropertyValue(properties, 'margin-right')}
            onChange={(e) => onChange('margin-right', e.target.value)}
            placeholder="0px"
          />
          <Input
            type="text"
            label="Bottom"
            value={getPropertyValue(properties, 'margin-bottom')}
            onChange={(e) => onChange('margin-bottom', e.target.value)}
            placeholder="0px"
          />
          <Input
            type="text"
            label="Left"
            value={getPropertyValue(properties, 'margin-left')}
            onChange={(e) => onChange('margin-left', e.target.value)}
            placeholder="0px"
          />
        </div>
      </div>

      {/* Padding */}
      <div className="space-y-3">
        <h4 className="text-xs font-semibold uppercase tracking-wide text-gray-500">
          Padding
        </h4>
        <div className="grid grid-cols-2 gap-3">
          <Input
            type="text"
            label="Top"
            value={getPropertyValue(properties, 'padding-top')}
            onChange={(e) => onChange('padding-top', e.target.value)}
            placeholder="0px"
          />
          <Input
            type="text"
            label="Right"
            value={getPropertyValue(properties, 'padding-right')}
            onChange={(e) => onChange('padding-right', e.target.value)}
            placeholder="0px"
          />
          <Input
            type="text"
            label="Bottom"
            value={getPropertyValue(properties, 'padding-bottom')}
            onChange={(e) => onChange('padding-bottom', e.target.value)}
            placeholder="0px"
          />
          <Input
            type="text"
            label="Left"
            value={getPropertyValue(properties, 'padding-left')}
            onChange={(e) => onChange('padding-left', e.target.value)}
            placeholder="0px"
          />
        </div>
      </div>
    </div>
  )
}

// ============================================================================
// BORDER CONTROL
// ============================================================================

/**
 * BorderControl - Controls for border CSS properties
 *
 * Properties:
 * - border-width
 * - border-style
 * - border-radius
 */
export function BorderControl({ properties, onChange }: PropertyControlProps) {
  return (
    <div className="space-y-4">
      <Input
        type="text"
        label="Border Width"
        value={getPropertyValue(properties, 'border-width')}
        onChange={(e) => onChange('border-width', e.target.value)}
        placeholder="1px"
        helperText="e.g., 1px, 2px, 0"
      />

      <Select
        label="Border Style"
        value={getPropertyValue(properties, 'border-style') || ''}
        onChange={(e) => onChange('border-style', e.target.value)}
        options={[
          { value: '', label: 'None' },
          { value: 'solid', label: 'Solid' },
          { value: 'dashed', label: 'Dashed' },
          { value: 'dotted', label: 'Dotted' },
          { value: 'double', label: 'Double' },
          { value: 'groove', label: 'Groove' },
          { value: 'ridge', label: 'Ridge' },
          { value: 'inset', label: 'Inset' },
          { value: 'outset', label: 'Outset' },
        ]}
        helperText="Border line style"
      />

      <Input
        type="text"
        label="Border Radius"
        value={getPropertyValue(properties, 'border-radius')}
        onChange={(e) => onChange('border-radius', e.target.value)}
        placeholder="0px"
        helperText="e.g., 4px, 8px, 50%"
      />
    </div>
  )
}

// ============================================================================
// TYPOGRAPHY CONTROL
// ============================================================================

/**
 * TypographyControl - Controls for typography CSS properties
 *
 * Properties:
 * - font-family
 * - font-size
 * - font-weight
 * - font-style
 * - text-align
 */
export function TypographyControl({
  properties,
  onChange,
}: PropertyControlProps) {
  return (
    <div className="space-y-4">
      <Input
        type="text"
        label="Font Family"
        value={getPropertyValue(properties, 'font-family')}
        onChange={(e) => onChange('font-family', e.target.value)}
        placeholder="monospace"
        helperText="e.g., monospace, sans-serif, 'JetBrains Mono'"
      />

      <Input
        type="text"
        label="Font Size"
        value={getPropertyValue(properties, 'font-size')}
        onChange={(e) => onChange('font-size', e.target.value)}
        placeholder="14px"
        helperText="e.g., 12px, 14px, 1rem"
      />

      <Select
        label="Font Weight"
        value={getPropertyValue(properties, 'font-weight') || ''}
        onChange={(e) => onChange('font-weight', e.target.value)}
        options={[
          { value: '', label: 'Normal' },
          { value: '100', label: '100 - Thin' },
          { value: '200', label: '200 - Extra Light' },
          { value: '300', label: '300 - Light' },
          { value: '400', label: '400 - Normal' },
          { value: '500', label: '500 - Medium' },
          { value: '600', label: '600 - Semi Bold' },
          { value: '700', label: '700 - Bold' },
          { value: '800', label: '800 - Extra Bold' },
          { value: '900', label: '900 - Black' },
        ]}
        helperText="Font thickness"
      />

      <Select
        label="Font Style"
        value={getPropertyValue(properties, 'font-style') || ''}
        onChange={(e) => onChange('font-style', e.target.value)}
        options={[
          { value: '', label: 'Normal' },
          { value: 'italic', label: 'Italic' },
          { value: 'oblique', label: 'Oblique' },
        ]}
        helperText="Font slant"
      />

      <Select
        label="Text Align"
        value={getPropertyValue(properties, 'text-align') || ''}
        onChange={(e) => onChange('text-align', e.target.value)}
        options={[
          { value: '', label: 'Default' },
          { value: 'left', label: 'Left' },
          { value: 'center', label: 'Center' },
          { value: 'right', label: 'Right' },
          { value: 'justify', label: 'Justify' },
        ]}
        helperText="Text alignment"
      />
    </div>
  )
}
