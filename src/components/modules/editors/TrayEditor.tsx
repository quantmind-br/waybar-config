// ============================================================================
// TRAY EDITOR - System tray module configuration form
// ============================================================================

import { Input, Toggle } from '../../common'
import type { ModuleConfig } from '../../../lib/types/config'

// ============================================================================
// TYPES
// ============================================================================

export interface TrayEditorProps {
  config: ModuleConfig
  onChange: (updates: Partial<ModuleConfig>) => void
}

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * TrayEditor - Configuration form for system tray module
 *
 * Features:
 * - Icon size configuration
 * - Spacing between icons
 * - Icon order (reverse-direction)
 * - Passive items visibility
 *
 * Reference: https://github.com/Alexays/Waybar/wiki/Module:-Tray
 */
export function TrayEditor({ config, onChange }: TrayEditorProps) {
  // ============================================================================
  // HELPERS
  // ============================================================================

  const handleChange = (field: string, value: any) => {
    onChange({ [field]: value })
  }

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div className="space-y-6">
      {/* Icon Settings */}
      <div className="rounded-lg border border-gray-800 bg-gray-850 p-6">
        <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-gray-400">
          Icon Settings
        </h3>

        <div className="space-y-4">
          <Input
            label="Icon Size (px)"
            type="number"
            value={config['icon-size'] !== undefined ? String(config['icon-size']) : '16'}
            onChange={(e) =>
              handleChange('icon-size', e.target.value ? parseInt(e.target.value) : 16)
            }
            placeholder="16"
            min="8"
            max="48"
            helperText="Size of tray icons in pixels (recommended: 16-24)"
          />

          <Input
            label="Spacing (px)"
            type="number"
            value={config.spacing !== undefined ? String(config.spacing) : '10'}
            onChange={(e) =>
              handleChange('spacing', e.target.value ? parseInt(e.target.value) : 10)
            }
            placeholder="10"
            min="0"
            max="50"
            helperText="Space between tray icons in pixels"
          />
        </div>
      </div>

      {/* Display Options */}
      <div className="rounded-lg border border-gray-800 bg-gray-850 p-6">
        <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-gray-400">
          Display Options
        </h3>

        <div className="space-y-4">
          <div>
            <Toggle
              label="Reverse Direction"
              checked={(config['reverse-direction'] as boolean) || false}
              onChange={(checked) => handleChange('reverse-direction', checked)}
            />
            <p className="mt-1 text-xs text-gray-500">
              Reverse the order of tray icons
            </p>
          </div>

          <div>
            <Toggle
              label="Show Passive Items"
              checked={
                config['show-passive-items'] !== undefined
                  ? (config['show-passive-items'] as boolean)
                  : true
              }
              onChange={(checked) => handleChange('show-passive-items', checked)}
            />
            <p className="mt-1 text-xs text-gray-500">
              Show icons that don't require immediate attention
            </p>
          </div>
        </div>
      </div>

      {/* Information */}
      <div className="rounded-lg border border-blue-800 bg-blue-950/30 p-4">
        <div className="flex gap-3">
          <div className="flex-shrink-0 text-blue-400">
            <svg
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <div className="flex-1">
            <h4 className="mb-1 text-sm font-semibold text-blue-300">System Tray</h4>
            <p className="text-xs text-blue-200">
              The system tray displays application icons in the bar. Applications control
              whether they appear in the tray. Use this module to configure how tray icons
              are displayed.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
