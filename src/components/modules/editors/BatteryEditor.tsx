// ============================================================================
// BATTERY EDITOR - Battery module configuration form
// ============================================================================

import { Input, Toggle, FormatBuilder, IconPicker } from '../../common'
import type { ModuleConfig } from '../../../lib/types/config'

// ============================================================================
// TYPES
// ============================================================================

export interface BatteryEditorProps {
  config: ModuleConfig
  onChange: (updates: Partial<ModuleConfig>) => void
}

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * BatteryEditor - Configuration form for battery module
 *
 * Features:
 * - Basic battery settings (bat, adapter, interval)
 * - Format strings for different states
 * - Icon configuration
 * - State thresholds (warning, critical)
 * - Full-at threshold configuration
 *
 * CRITICAL: Battery states are ≤ threshold (reversed from other modules)
 * Example: warning: 30 triggers at 30% or BELOW
 *
 * Reference: https://github.com/Alexays/Waybar/wiki/Module:-Battery
 */
export function BatteryEditor({ config, onChange }: BatteryEditorProps) {
  // ============================================================================
  // HELPERS
  // ============================================================================

  const handleChange = (field: string, value: any) => {
    onChange({ [field]: value })
  }

  const handleFormatIconsChange = (state: string, icon: string) => {
    const currentIcons =
      typeof config['format-icons'] === 'object' && !Array.isArray(config['format-icons'])
        ? config['format-icons']
        : {}

    onChange({
      'format-icons': {
        ...currentIcons,
        [state]: icon,
      },
    })
  }

  const handleStatesChange = (state: string, value: number) => {
    const currentStates =
      typeof config.states === 'object' ? config.states : {}

    onChange({
      states: {
        ...currentStates,
        [state]: value,
      },
    })
  }

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div className="space-y-6">
      {/* Basic Settings */}
      <div className="rounded-lg border border-gray-800 bg-gray-850 p-6">
        <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-gray-400">
          Basic Settings
        </h3>

        <div className="space-y-4">
          <Input
            label="Battery Device"
            value={(config.bat as string) || ''}
            onChange={(e) => handleChange('bat', e.target.value)}
            placeholder="BAT0"
            helperText="Specific battery device to monitor (e.g., BAT0, BAT1)"
          />

          <Input
            label="Adapter"
            value={(config.adapter as string) || ''}
            onChange={(e) => handleChange('adapter', e.target.value)}
            placeholder="AC"
            helperText="Power adapter device to check charging state"
          />

          <Input
            type="number"
            label="Update Interval (seconds)"
            value={config.interval !== undefined ? String(config.interval) : '60'}
            onChange={(e) => handleChange('interval', parseInt(e.target.value) || 60)}
            min={1}
            helperText="How often to update battery information"
          />

          <Input
            type="number"
            label="Full At (%)"
            value={config['full-at'] !== undefined ? String(config['full-at']) : '99'}
            onChange={(e) => handleChange('full-at', parseInt(e.target.value) || 99)}
            min={0}
            max={100}
            helperText="Consider battery full at this percentage"
          />

          <div className="space-y-2">
            <Toggle
              label="Use Design Capacity"
              checked={(config['design-capacity'] as boolean) || false}
              onChange={(checked) => handleChange('design-capacity', checked)}
            />
            <p className="text-xs text-gray-500">
              Use design capacity instead of current capacity for calculations
            </p>
          </div>

          <div className="space-y-2">
            <Toggle
              label="Weighted Average"
              checked={(config['weighted-average'] as boolean) || false}
              onChange={(checked) => handleChange('weighted-average', checked)}
            />
            <p className="text-xs text-gray-500">
              Calculate average battery level across multiple batteries
            </p>
          </div>
        </div>
      </div>

      {/* Format Strings */}
      <div className="rounded-lg border border-gray-800 bg-gray-850 p-6">
        <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-gray-400">
          Display Formats
        </h3>

        <div className="space-y-4">
          <FormatBuilder
            moduleType="battery"
            label="Default Format"
            value={(config.format as string) || ''}
            onChange={(value) => handleChange('format', value)}
            placeholder="{capacity}% {icon}"
          />

          <FormatBuilder
            moduleType="battery"
            label="Charging Format"
            value={(config['format-charging'] as string) || ''}
            onChange={(value) => handleChange('format-charging', value)}
            placeholder=" {capacity}%"
          />

          <FormatBuilder
            moduleType="battery"
            label="Plugged Format"
            value={(config['format-plugged'] as string) || ''}
            onChange={(value) => handleChange('format-plugged', value)}
            placeholder=" {capacity}%"
          />

          <FormatBuilder
            moduleType="battery"
            label="Full Format"
            value={(config['format-full'] as string) || ''}
            onChange={(value) => handleChange('format-full', value)}
            placeholder=" {capacity}%"
          />

          <div className="space-y-2">
            <FormatBuilder
              moduleType="battery"
              label="Time Format"
              value={(config['format-time'] as string) || ''}
              onChange={(value) => handleChange('format-time', value)}
              placeholder="{H}h {M}min"
            />
            <p className="text-xs text-gray-500">
              Format for time remaining/to full
            </p>
          </div>

          <div className="space-y-2">
            <FormatBuilder
              moduleType="battery"
              label="Alternative Format"
              value={(config['format-alt'] as string) || ''}
              onChange={(value) => handleChange('format-alt', value)}
              placeholder="{time} {icon}"
            />
            <p className="text-xs text-gray-500">
              Alternative format (toggle with on-click)
            </p>
          </div>
        </div>
      </div>

      {/* Icons */}
      <div className="rounded-lg border border-gray-800 bg-gray-850 p-6">
        <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-gray-400">
          Icons
        </h3>

        <div className="space-y-4">
          <IconPicker
            label="Default Icon"
            value={
              typeof config['format-icons'] === 'object' &&
              !Array.isArray(config['format-icons'])
                ? (config['format-icons'] as Record<string, string>)['default'] || ''
                : ''
            }
            onChange={(icon) => handleFormatIconsChange('default', icon)}
            placeholder="Select default battery icon"
          />

          <IconPicker
            label="Charging Icon"
            value={
              typeof config['format-icons'] === 'object' &&
              !Array.isArray(config['format-icons'])
                ? (config['format-icons'] as Record<string, string>)['charging'] || ''
                : ''
            }
            onChange={(icon) => handleFormatIconsChange('charging', icon)}
            placeholder="Select charging icon"
          />

          <IconPicker
            label="Plugged Icon"
            value={
              typeof config['format-icons'] === 'object' &&
              !Array.isArray(config['format-icons'])
                ? (config['format-icons'] as Record<string, string>)['plugged'] || ''
                : ''
            }
            onChange={(icon) => handleFormatIconsChange('plugged', icon)}
            placeholder="Select plugged icon"
          />

          <IconPicker
            label="Full Icon"
            value={
              typeof config['format-icons'] === 'object' &&
              !Array.isArray(config['format-icons'])
                ? (config['format-icons'] as Record<string, string>)['full'] || ''
                : ''
            }
            onChange={(icon) => handleFormatIconsChange('full', icon)}
            placeholder="Select full battery icon"
          />
        </div>
      </div>

      {/* State Thresholds */}
      <div className="rounded-lg border border-yellow-900/30 bg-yellow-950/20 p-6">
        <div className="mb-4 flex items-start gap-3">
          <div className="flex-shrink-0 rounded-full bg-yellow-900/50 p-2">
            <svg className="h-5 w-5 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wide text-yellow-400">
              State Thresholds (Warning/Critical)
            </h3>
            <p className="mt-1 text-sm text-yellow-300/70">
              CRITICAL: Battery states trigger at or BELOW the threshold. Example:
              warning: 30 triggers at ≤30%, critical: 15 triggers at ≤15%
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <Input
            type="number"
            label="Warning Threshold (%)"
            value={
              config.states && typeof config.states === 'object'
                ? String((config.states as Record<string, number>)['warning'] || '')
                : ''
            }
            onChange={(e) =>
              handleStatesChange('warning', parseInt(e.target.value) || 0)
            }
            min={0}
            max={100}
            placeholder="30"
            helperText="Activate warning state at this percentage or BELOW"
          />

          <Input
            type="number"
            label="Critical Threshold (%)"
            value={
              config.states && typeof config.states === 'object'
                ? String((config.states as Record<string, number>)['critical'] || '')
                : ''
            }
            onChange={(e) =>
              handleStatesChange('critical', parseInt(e.target.value) || 0)
            }
            min={0}
            max={100}
            placeholder="15"
            helperText="Activate critical state at this percentage or BELOW"
          />

          <IconPicker
            label="Warning Icon"
            value={
              typeof config['format-icons'] === 'object' &&
              !Array.isArray(config['format-icons'])
                ? (config['format-icons'] as Record<string, string>)['warning'] || ''
                : ''
            }
            onChange={(icon) => handleFormatIconsChange('warning', icon)}
            placeholder="Select warning icon"
          />

          <IconPicker
            label="Critical Icon"
            value={
              typeof config['format-icons'] === 'object' &&
              !Array.isArray(config['format-icons'])
                ? (config['format-icons'] as Record<string, string>)['critical'] || ''
                : ''
            }
            onChange={(icon) => handleFormatIconsChange('critical', icon)}
            placeholder="Select critical icon"
          />
        </div>
      </div>
    </div>
  )
}
