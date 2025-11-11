// ============================================================================
// WINDOW EDITOR - Window module configuration form
// ============================================================================

import { Input, Toggle } from '../../common'
import type { ModuleConfig } from '../../../lib/types/config'

// ============================================================================
// TYPES
// ============================================================================

export interface WindowEditorProps {
  config: ModuleConfig
  onChange: (updates: Partial<ModuleConfig>) => void
}

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * WindowEditor - Configuration form for window module (Sway/i3)
 *
 * Features:
 * - Format string configuration with window variables
 * - Max length limiting
 * - Custom separator
 * - Regex rewrite rules for window titles
 * - Icon configuration
 * - Output filtering
 *
 * Reference: https://github.com/Alexays/Waybar/wiki/Module:-Window
 */
export function WindowEditor({ config, onChange }: WindowEditorProps) {
  // ============================================================================
  // HELPERS
  // ============================================================================

  const handleChange = (field: string, value: any) => {
    onChange({ [field]: value })
  }

  const handleRewriteChange = (value: string) => {
    try {
      const parsed = value ? JSON.parse(value) : undefined
      handleChange('rewrite', parsed)
    } catch (error) {
      console.error('Invalid JSON for rewrite rules:', error)
    }
  }

  const rewriteValue =
    config.rewrite && typeof config.rewrite === 'object'
      ? JSON.stringify(config.rewrite, null, 2)
      : ''

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div className="space-y-6">
      {/* Format Settings */}
      <div className="rounded-lg border border-gray-800 bg-gray-850 p-6">
        <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-gray-400">
          Format
        </h3>

        <div className="space-y-4">
          <Input
            label="Format String"
            value={(config.format as string) || '{title}'}
            onChange={(e) => handleChange('format', e.target.value)}
            placeholder="{title}"
            helperText="Format string for window title. Variables: {title}, {app_id}, {class}"
          />

          <Input
            label="Separator"
            value={(config.separator as string) || ' - '}
            onChange={(e) => handleChange('separator', e.target.value)}
            placeholder=" - "
            helperText="Separator between workspace and window title"
          />
        </div>
      </div>

      {/* Display Options */}
      <div className="rounded-lg border border-gray-800 bg-gray-850 p-6">
        <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-gray-400">
          Display Options
        </h3>

        <div className="space-y-4">
          <Input
            label="Max Length"
            type="number"
            value={config['max-length'] !== undefined ? String(config['max-length']) : ''}
            onChange={(e) => handleChange('max-length', e.target.value ? parseInt(e.target.value) : undefined)}
            placeholder="50"
            min="1"
            helperText="Maximum number of characters to display"
          />

          <div>
            <Toggle
              label="All Outputs"
              checked={(config['all-outputs'] as boolean) || false}
              onChange={(checked) => handleChange('all-outputs', checked)}
            />
            <p className="mt-1 text-xs text-gray-500">
              Show window title from all outputs
            </p>
          </div>

          <div>
            <Toggle
              label="Show Icon"
              checked={(config.icon as boolean) || false}
              onChange={(checked) => handleChange('icon', checked)}
            />
            <p className="mt-1 text-xs text-gray-500">
              Display application icon
            </p>
          </div>

          {config.icon && (
            <Input
              label="Icon Size"
              type="number"
              value={config['icon-size'] !== undefined ? String(config['icon-size']) : '16'}
              onChange={(e) => handleChange('icon-size', e.target.value ? parseInt(e.target.value) : 16)}
              placeholder="16"
              min="8"
              max="48"
              helperText="Icon size in pixels (8-48)"
            />
          )}
        </div>
      </div>

      {/* Rewrite Rules */}
      <div className="rounded-lg border border-gray-800 bg-gray-850 p-6">
        <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-gray-400">
          Rewrite Rules
        </h3>

        <div className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-300">
              Title Rewrite Rules (JSON)
            </label>
            <textarea
              value={rewriteValue}
              onChange={(e) => handleRewriteChange(e.target.value)}
              className="w-full rounded-lg border border-gray-700 bg-gray-900 p-3 font-mono text-sm text-gray-100 placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              rows={8}
              placeholder={`{\n  "(.*) - Mozilla Firefox": "$1",\n  "(.*) - Chromium": "$1",\n  "vim (.*)": "📝 $1"\n}`}
            />
            <p className="mt-2 text-xs text-gray-500">
              Regular expression rules to transform window titles. Capture groups can be referenced with $1, $2, etc.
            </p>
          </div>
        </div>
      </div>

      {/* Offscreen CSS */}
      <div className="rounded-lg border border-gray-800 bg-gray-850 p-6">
        <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-gray-400">
          Offscreen Styling
        </h3>

        <div className="space-y-4">
          <div>
            <Toggle
              label="Enable Offscreen CSS"
              checked={(config['offscreen-css'] as boolean) || false}
              onChange={(checked) => handleChange('offscreen-css', checked)}
            />
            <p className="mt-1 text-xs text-gray-500">
              Apply special styling to windows that are offscreen
            </p>
          </div>

          {config['offscreen-css'] && (
            <Input
              label="Offscreen CSS Text"
              value={(config['offscreen-css-text'] as string) || ''}
              onChange={(e) => handleChange('offscreen-css-text', e.target.value)}
              placeholder="(offscreen)"
              helperText="Text to display for offscreen windows"
            />
          )}
        </div>
      </div>
    </div>
  )
}
