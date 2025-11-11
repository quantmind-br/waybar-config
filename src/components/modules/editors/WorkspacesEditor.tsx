// ============================================================================
// WORKSPACES EDITOR - Generic Workspaces module configuration form
// ============================================================================

import { Input, Toggle } from '../../common'
import type { ModuleConfig } from '../../../lib/types/config'

// ============================================================================
// TYPES
// ============================================================================

export interface WorkspacesEditorProps {
  config: ModuleConfig
  onChange: (updates: Partial<ModuleConfig>) => void
}

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * WorkspacesEditor - Configuration form for generic workspaces module (Sway/i3)
 *
 * Features:
 * - Format string configuration
 * - Output filtering (all-outputs, active-only)
 * - Interaction controls (disable-scroll, disable-click)
 * - Persistent workspaces configuration
 * - Sorting options
 *
 * Reference: https://github.com/Alexays/Waybar/wiki/Module:-Workspaces
 */
export function WorkspacesEditor({ config, onChange }: WorkspacesEditorProps) {
  // ============================================================================
  // HELPERS
  // ============================================================================

  const handleChange = (field: string, value: any) => {
    onChange({ [field]: value })
  }

  const handlePersistentWorkspacesChange = (value: string) => {
    try {
      const parsed = value ? JSON.parse(value) : undefined
      handleChange('persistent-workspaces', parsed)
    } catch (error) {
      console.error('Invalid JSON for persistent-workspaces:', error)
    }
  }

  const persistentWorkspacesValue =
    config['persistent-workspaces'] && typeof config['persistent-workspaces'] === 'object'
      ? JSON.stringify(config['persistent-workspaces'], null, 2)
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
            value={(config.format as string) || '{name}'}
            onChange={(e) => handleChange('format', e.target.value)}
            placeholder="{name}"
            helperText="Format string for workspace display. Variables: {name}, {id}, {index}, {icon}"
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
              label="All Outputs"
              checked={(config['all-outputs'] as boolean) || false}
              onChange={(checked) => handleChange('all-outputs', checked)}
            />
            <p className="mt-1 text-xs text-gray-500">
              Show workspaces from all monitors
            </p>
          </div>

          <div>
            <Toggle
              label="Active Only"
              checked={(config['active-only'] as boolean) || false}
              onChange={(checked) => handleChange('active-only', checked)}
            />
            <p className="mt-1 text-xs text-gray-500">
              Show only the active workspace
            </p>
          </div>

          <div>
            <Toggle
              label="Current Only"
              checked={(config['current-only'] as boolean) || false}
              onChange={(checked) => handleChange('current-only', checked)}
            />
            <p className="mt-1 text-xs text-gray-500">
              Show only workspaces on current output
            </p>
          </div>

          <div>
            <Toggle
              label="Disable Markup"
              checked={(config['disable-markup'] as boolean) || false}
              onChange={(checked) => handleChange('disable-markup', checked)}
            />
            <p className="mt-1 text-xs text-gray-500">
              Disable pango markup in format string
            </p>
          </div>
        </div>
      </div>

      {/* Interaction */}
      <div className="rounded-lg border border-gray-800 bg-gray-850 p-6">
        <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-gray-400">
          Interaction
        </h3>

        <div className="space-y-4">
          <div>
            <Toggle
              label="Disable Scroll"
              checked={(config['disable-scroll'] as boolean) || false}
              onChange={(checked) => handleChange('disable-scroll', checked)}
            />
            <p className="mt-1 text-xs text-gray-500">
              Disable scroll to change workspace
            </p>
          </div>

          <div>
            <Toggle
              label="Disable Click"
              checked={(config['disable-click'] as boolean) || false}
              onChange={(checked) => handleChange('disable-click', checked)}
            />
            <p className="mt-1 text-xs text-gray-500">
              Disable click to switch workspace
            </p>
          </div>

          <div>
            <Toggle
              label="Enable Bar Scroll"
              checked={(config['enable-bar-scroll'] as boolean) || false}
              onChange={(checked) => handleChange('enable-bar-scroll', checked)}
            />
            <p className="mt-1 text-xs text-gray-500">
              Enable scrolling through workspaces on the bar
            </p>
          </div>

          <div>
            <Toggle
              label="Reverse Scrolling"
              checked={(config['reverse-scrolling'] as boolean) || false}
              onChange={(checked) => handleChange('reverse-scrolling', checked)}
            />
            <p className="mt-1 text-xs text-gray-500">
              Reverse scroll direction
            </p>
          </div>

          <div>
            <Toggle
              label="Wrap Scroll"
              checked={(config['wrap-scroll'] as boolean) || false}
              onChange={(checked) => handleChange('wrap-scroll', checked)}
            />
            <p className="mt-1 text-xs text-gray-500">
              Wrap around when scrolling past first/last workspace
            </p>
          </div>
        </div>
      </div>

      {/* Persistent Workspaces */}
      <div className="rounded-lg border border-gray-800 bg-gray-850 p-6">
        <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-gray-400">
          Persistent Workspaces
        </h3>

        <div className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-300">
              Workspace to Output Mapping (JSON)
            </label>
            <textarea
              value={persistentWorkspacesValue}
              onChange={(e) => handlePersistentWorkspacesChange(e.target.value)}
              className="w-full rounded-lg border border-gray-700 bg-gray-900 p-3 font-mono text-sm text-gray-100 placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              rows={6}
              placeholder={`{\n  "1": ["DP-1"],\n  "2": ["DP-1"],\n  "9": ["eDP-1"]\n}`}
            />
            <p className="mt-2 text-xs text-gray-500">
              Map workspace names to output names. Workspaces will always be shown on specified outputs.
            </p>
          </div>
        </div>
      </div>

      {/* Sorting */}
      <div className="rounded-lg border border-gray-800 bg-gray-850 p-6">
        <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-gray-400">
          Sorting
        </h3>

        <div className="space-y-4">
          <div>
            <Toggle
              label="Sort by Number"
              checked={(config['sort-by-number'] as boolean) || false}
              onChange={(checked) => handleChange('sort-by-number', checked)}
            />
            <p className="mt-1 text-xs text-gray-500">
              Sort workspaces by number
            </p>
          </div>

          <div>
            <Toggle
              label="Sort by Name"
              checked={(config['sort-by-name'] as boolean) || false}
              onChange={(checked) => handleChange('sort-by-name', checked)}
            />
            <p className="mt-1 text-xs text-gray-500">
              Sort workspaces by name
            </p>
          </div>

          <div>
            <Toggle
              label="Sort by Coordinates"
              checked={(config['sort-by-coordinates'] as boolean) || false}
              onChange={(checked) => handleChange('sort-by-coordinates', checked)}
            />
            <p className="mt-1 text-xs text-gray-500">
              Sort workspaces by screen coordinates
            </p>
          </div>

          <div>
            <Toggle
              label="Numeric First"
              checked={(config['numeric-first'] as boolean) || false}
              onChange={(checked) => handleChange('numeric-first', checked)}
            />
            <p className="mt-1 text-xs text-gray-500">
              Show numeric workspaces before named ones
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
