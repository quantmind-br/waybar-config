// ============================================================================
// BAR SETTINGS - Bar-Level Configuration Form
// ============================================================================

import type { BarDefinition } from '../../lib/types/config'
import { useConfigStore } from '../../store/config-store'
import { Input, Select, Toggle } from '../common'

// ============================================================================
// TYPES
// ============================================================================

export interface BarSettingsProps {
  bar: BarDefinition
}

// ============================================================================
// CONSTANTS
// ============================================================================

const LAYER_OPTIONS = [
  { value: 'top', label: 'Top' },
  { value: 'bottom', label: 'Bottom' },
]

const POSITION_OPTIONS = [
  { value: 'top', label: 'Top' },
  { value: 'bottom', label: 'Bottom' },
  { value: 'left', label: 'Left' },
  { value: 'right', label: 'Right' },
]

const MODE_OPTIONS = [
  { value: 'dock', label: 'Dock' },
  { value: 'hide', label: 'Hide' },
  { value: 'invisible', label: 'Invisible' },
  { value: 'overlay', label: 'Overlay' },
]

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * Bar settings form with all BarConfig properties
 *
 * Features:
 * - All bar-level configuration options
 * - Grouped by category (Positioning, Dimensions, Spacing, Behavior)
 * - Real-time updates to config store
 * - Validation with Zod schemas (TODO)
 * - Responsive layout
 */
export function BarSettings({ bar }: BarSettingsProps) {
  const updateBar = useConfigStore((state) => state.updateBar)

  // Helper to update config properties
  const updateConfig = <K extends keyof typeof bar.config>(
    key: K,
    value: (typeof bar.config)[K]
  ) => {
    updateBar(bar.id, {
      config: {
        ...bar.config,
        [key]: value,
      },
    })
  }

  // Helper to update bar properties (name, enabled)
  const updateBarProp = <K extends keyof BarDefinition>(
    key: K,
    value: BarDefinition[K]
  ) => {
    updateBar(bar.id, { [key]: value })
  }

  return (
    <div className="space-y-8">
      {/* Bar Name */}
      <section>
        <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-gray-400">
          Bar Information
        </h3>
        <div className="space-y-4">
          <Input
            label="Bar Name"
            value={bar.name || ''}
            onChange={(e) => updateBarProp('name', e.target.value)}
            placeholder="My Bar"
            fullWidth
            helperText="Descriptive name for this bar configuration"
          />

          <Toggle
            label="Enabled"
            description="Enable or disable this bar"
            checked={bar.enabled}
            onChange={(e) => updateBarProp('enabled', e.target.checked)}
          />
        </div>
      </section>

      {/* Positioning */}
      <section>
        <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-gray-400">
          Positioning
        </h3>
        <div className="grid gap-4 md:grid-cols-2">
          <Select
            label="Layer"
            value={bar.config.layer || 'top'}
            onChange={(e) =>
              updateConfig('layer', e.target.value as 'top' | 'bottom')
            }
            options={LAYER_OPTIONS}
            fullWidth
            helperText="Layer in the compositor stack"
          />

          <Select
            label="Position"
            value={bar.config.position || 'top'}
            onChange={(e) =>
              updateConfig(
                'position',
                e.target.value as 'top' | 'bottom' | 'left' | 'right'
              )
            }
            options={POSITION_OPTIONS}
            fullWidth
            helperText="Position on the screen"
          />

          <Input
            label="Output"
            value={
              Array.isArray(bar.config.output)
                ? bar.config.output.join(', ')
                : bar.config.output || ''
            }
            onChange={(e) => {
              const value = e.target.value.trim()
              updateConfig(
                'output',
                value ? value.split(',').map((s) => s.trim()) : undefined
              )
            }}
            placeholder="DP-1, HDMI-1"
            fullWidth
            helperText="Monitor names (comma-separated, leave empty for all)"
          />
        </div>
      </section>

      {/* Dimensions */}
      <section>
        <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-gray-400">
          Dimensions
        </h3>
        <div className="grid gap-4 md:grid-cols-2">
          <Input
            label="Height"
            type="number"
            value={bar.config.height || ''}
            onChange={(e) =>
              updateConfig(
                'height',
                e.target.value ? parseInt(e.target.value, 10) : undefined
              )
            }
            placeholder="30"
            helperText="Bar height in pixels"
          />

          <Input
            label="Width"
            type="number"
            value={bar.config.width || ''}
            onChange={(e) =>
              updateConfig(
                'width',
                e.target.value ? parseInt(e.target.value, 10) : undefined
              )
            }
            placeholder="auto"
            helperText="Bar width in pixels (leave empty for auto)"
          />
        </div>
      </section>

      {/* Spacing */}
      <section>
        <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-gray-400">
          Spacing
        </h3>
        <div className="grid gap-4 md:grid-cols-2">
          <Input
            label="Module Spacing"
            type="number"
            value={bar.config.spacing ?? 4}
            onChange={(e) =>
              updateConfig('spacing', parseInt(e.target.value, 10) || 0)
            }
            placeholder="4"
            helperText="Space between modules in pixels"
          />

          <Input
            label="Margin"
            value={bar.config.margin || ''}
            onChange={(e) => updateConfig('margin', e.target.value || undefined)}
            placeholder="0 0 0 0"
            helperText="CSS margin shorthand (top right bottom left)"
          />

          <Input
            label="Margin Top"
            type="number"
            value={bar.config['margin-top'] ?? ''}
            onChange={(e) =>
              updateConfig(
                'margin-top',
                e.target.value ? parseInt(e.target.value, 10) : undefined
              )
            }
            placeholder="0"
          />

          <Input
            label="Margin Bottom"
            type="number"
            value={bar.config['margin-bottom'] ?? ''}
            onChange={(e) =>
              updateConfig(
                'margin-bottom',
                e.target.value ? parseInt(e.target.value, 10) : undefined
              )
            }
            placeholder="0"
          />

          <Input
            label="Margin Left"
            type="number"
            value={bar.config['margin-left'] ?? ''}
            onChange={(e) =>
              updateConfig(
                'margin-left',
                e.target.value ? parseInt(e.target.value, 10) : undefined
              )
            }
            placeholder="0"
          />

          <Input
            label="Margin Right"
            type="number"
            value={bar.config['margin-right'] ?? ''}
            onChange={(e) =>
              updateConfig(
                'margin-right',
                e.target.value ? parseInt(e.target.value, 10) : undefined
              )
            }
            placeholder="0"
          />
        </div>
      </section>

      {/* Behavior */}
      <section>
        <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-gray-400">
          Behavior
        </h3>
        <div className="space-y-4">
          <Select
            label="Mode"
            value={bar.config.mode || 'dock'}
            onChange={(e) =>
              updateConfig(
                'mode',
                e.target.value as 'dock' | 'hide' | 'invisible' | 'overlay'
              )
            }
            options={MODE_OPTIONS}
            fullWidth
            helperText="Bar visibility mode"
          />

          <Toggle
            label="Exclusive"
            description="Reserve space for the bar (prevents windows from overlapping)"
            checked={bar.config.exclusive ?? true}
            onChange={(e) => updateConfig('exclusive', e.target.checked)}
          />

          <Toggle
            label="Passthrough"
            description="Allow mouse events to pass through the bar"
            checked={bar.config.passthrough ?? false}
            onChange={(e) => updateConfig('passthrough', e.target.checked)}
          />

          <Toggle
            label="GTK Layer Shell"
            description="Use GTK Layer Shell protocol (recommended)"
            checked={bar.config['gtk-layer-shell'] ?? true}
            onChange={(e) => updateConfig('gtk-layer-shell', e.target.checked)}
          />

          <Toggle
            label="IPC"
            description="Enable IPC for runtime control"
            checked={bar.config.ipc ?? false}
            onChange={(e) => updateConfig('ipc', e.target.checked)}
          />

          <Toggle
            label="Reload Style on Change"
            description="Automatically reload CSS when style.css changes"
            checked={bar.config.reload_style_on_change ?? true}
            onChange={(e) =>
              updateConfig('reload_style_on_change', e.target.checked)
            }
          />
        </div>
      </section>
    </div>
  )
}
