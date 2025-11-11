// ============================================================================
// COLOR PICKER - Color Selection Component
// ============================================================================

import { useState, useRef, useEffect } from 'react'
import { RgbaColorPicker, RgbaColor } from 'react-colorful'
import { Pipette } from 'lucide-react'

// ============================================================================
// TYPES
// ============================================================================

export interface ColorPickerProps {
  label?: string
  value: string
  onChange: (color: string) => void
  showAlpha?: boolean
  presets?: string[]
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Convert hex color to RGBA object
 */
function hexToRgba(hex: string): RgbaColor {
  // Remove # if present
  hex = hex.replace(/^#/, '')

  // Parse hex values
  let r = 0,
    g = 0,
    b = 0,
    a = 1

  if (hex.length === 3) {
    // Short hex format (e.g., #fff)
    r = parseInt(hex[0] + hex[0], 16)
    g = parseInt(hex[1] + hex[1], 16)
    b = parseInt(hex[2] + hex[2], 16)
  } else if (hex.length === 6) {
    // Full hex format (e.g., #ffffff)
    r = parseInt(hex.substr(0, 2), 16)
    g = parseInt(hex.substr(2, 2), 16)
    b = parseInt(hex.substr(4, 2), 16)
  } else if (hex.length === 8) {
    // Hex with alpha (e.g., #ffffff80)
    r = parseInt(hex.substr(0, 2), 16)
    g = parseInt(hex.substr(2, 2), 16)
    b = parseInt(hex.substr(4, 2), 16)
    a = parseInt(hex.substr(6, 2), 16) / 255
  }

  return { r, g, b, a }
}

/**
 * Convert RGBA object to hex string
 */
function rgbaToHex(rgba: RgbaColor, includeAlpha: boolean = true): string {
  const r = rgba.r.toString(16).padStart(2, '0')
  const g = rgba.g.toString(16).padStart(2, '0')
  const b = rgba.b.toString(16).padStart(2, '0')
  const a = Math.round(rgba.a * 255)
    .toString(16)
    .padStart(2, '0')

  return includeAlpha ? `#${r}${g}${b}${a}` : `#${r}${g}${b}`
}

/**
 * Convert RGBA object to CSS rgba string
 */
function rgbaToCss(rgba: RgbaColor): string {
  return `rgba(${rgba.r}, ${rgba.g}, ${rgba.b}, ${rgba.a})`
}

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * Color picker component with RGB/RGBA support and presets
 *
 * Features:
 * - RGB/RGBA color picker using react-colorful
 * - Hex input field
 * - Alpha channel support (optional)
 * - Preset color swatches
 * - Popover-style picker
 * - Real-time updates
 */
export function ColorPicker({
  label,
  value,
  onChange,
  showAlpha = true,
  presets = [
    '#000000',
    '#ffffff',
    '#ef4444',
    '#f97316',
    '#f59e0b',
    '#84cc16',
    '#22c55e',
    '#06b6d4',
    '#3b82f6',
    '#8b5cf6',
    '#ec4899',
    '#64748b',
  ],
}: ColorPickerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [color, setColor] = useState<RgbaColor>(hexToRgba(value))
  const [hexInput, setHexInput] = useState(value)
  const popoverRef = useRef<HTMLDivElement>(null)

  // Update internal state when value prop changes
  useEffect(() => {
    setColor(hexToRgba(value))
    setHexInput(value)
  }, [value])

  // Close popover when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  const handleColorChange = (newColor: RgbaColor) => {
    setColor(newColor)
    const hex = rgbaToHex(newColor, showAlpha)
    setHexInput(hex)
    onChange(hex)
  }

  const handleHexInputChange = (hex: string) => {
    setHexInput(hex)
    // Only update color if valid hex
    if (/^#[0-9A-Fa-f]{6}([0-9A-Fa-f]{2})?$/.test(hex)) {
      const rgba = hexToRgba(hex)
      setColor(rgba)
      onChange(hex)
    }
  }

  const handlePresetClick = (preset: string) => {
    const rgba = hexToRgba(preset)
    setColor(rgba)
    setHexInput(preset)
    onChange(preset)
  }

  return (
    <div className="relative">
      {/* Label */}
      {label && (
        <label className="mb-1 block text-sm font-medium text-gray-300">
          {label}
        </label>
      )}

      {/* Color Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex h-10 w-full items-center gap-2 rounded border border-gray-700 bg-gray-800 px-3 transition-colors hover:border-gray-600 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900"
      >
        {/* Color Preview */}
        <div
          className="h-6 w-6 flex-shrink-0 rounded border border-gray-600"
          style={{ backgroundColor: rgbaToCss(color) }}
        />
        {/* Hex Value */}
        <span className="flex-1 text-left text-sm text-gray-300">
          {hexInput}
        </span>
        {/* Icon */}
        <Pipette className="h-4 w-4 text-gray-500" />
      </button>

      {/* Color Picker Popover */}
      {isOpen && (
        <div
          ref={popoverRef}
          className="absolute left-0 top-full z-50 mt-2 rounded-lg border border-gray-700 bg-gray-800 p-4 shadow-xl"
        >
          {/* React Colorful Picker */}
          <div className="mb-4">
            <RgbaColorPicker color={color} onChange={handleColorChange} />
          </div>

          {/* Hex Input */}
          <div className="mb-4">
            <input
              type="text"
              value={hexInput}
              onChange={(e) => handleHexInputChange(e.target.value)}
              className="w-full rounded border border-gray-700 bg-gray-900 px-3 py-2 text-sm text-gray-100 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="#000000"
            />
          </div>

          {/* Preset Swatches */}
          {presets.length > 0 && (
            <div>
              <div className="mb-2 text-xs font-medium text-gray-400">
                Presets
              </div>
              <div className="grid grid-cols-6 gap-2">
                {presets.map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => handlePresetClick(preset)}
                    className="h-8 w-8 rounded border border-gray-600 transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    style={{ backgroundColor: preset }}
                    title={preset}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
