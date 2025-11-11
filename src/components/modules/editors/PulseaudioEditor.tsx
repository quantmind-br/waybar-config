// ============================================================================
// PULSEAUDIO EDITOR - Pulseaudio module configuration form
// ============================================================================

import { Input, Toggle } from '../../common'
import type { ModuleConfig } from '../../../lib/types/config'

// ============================================================================
// TYPES
// ============================================================================

export interface PulseaudioEditorProps {
  config: ModuleConfig
  onChange: (updates: Partial<ModuleConfig>) => void
}

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * PulseaudioEditor - Configuration form for pulseaudio module
 *
 * Features:
 * - Format strings for different audio states
 * - Volume control settings (scroll step, max volume)
 * - Bluetooth audio support
 * - Source (microphone) configuration
 * - Ignored sinks configuration
 * - Smooth scrolling
 *
 * Reference: https://github.com/Alexays/Waybar/wiki/Module:-Pulseaudio
 */
export function PulseaudioEditor({ config, onChange }: PulseaudioEditorProps) {
  // ============================================================================
  // HELPERS
  // ============================================================================

  const handleChange = (field: string, value: any) => {
    onChange({ [field]: value })
  }

  const handleIgnoredSinksChange = (value: string) => {
    const sinks = value
      .split(',')
      .map((s) => s.trim())
      .filter((s) => s.length > 0)
    handleChange('ignored-sinks', sinks.length > 0 ? sinks : undefined)
  }

  const ignoredSinksValue = Array.isArray(config['ignored-sinks'])
    ? config['ignored-sinks'].join(', ')
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
            value={(config.format as string) || '{volume}% {icon}'}
            onChange={(e) => handleChange('format', e.target.value)}
            placeholder="{volume}% {icon}"
            helperText="Format string for normal audio output. Variables: {volume}, {icon}, {format_source}"
          />

          <Input
            label="Format (Muted)"
            value={(config['format-muted'] as string) || ''}
            onChange={(e) => handleChange('format-muted', e.target.value)}
            placeholder="🔇 {volume}%"
            helperText="Format when audio is muted"
          />

          <Input
            label="Format (Bluetooth)"
            value={(config['format-bluetooth'] as string) || ''}
            onChange={(e) => handleChange('format-bluetooth', e.target.value)}
            placeholder="{volume}% {icon} "
            helperText="Format when using Bluetooth audio"
          />

          <Input
            label="Format (Bluetooth Muted)"
            value={(config['format-bluetooth-muted'] as string) || ''}
            onChange={(e) => handleChange('format-bluetooth-muted', e.target.value)}
            placeholder="🔇 {volume}% "
            helperText="Format when Bluetooth audio is muted"
          />
        </div>
      </div>

      {/* Source (Microphone) Settings */}
      <div className="rounded-lg border border-gray-800 bg-gray-850 p-6">
        <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-gray-400">
          Source (Microphone)
        </h3>

        <div className="space-y-4">
          <Input
            label="Format Source"
            value={(config['format-source'] as string) || ''}
            onChange={(e) => handleChange('format-source', e.target.value)}
            placeholder="{volume}% "
            helperText="Format for microphone/input device"
          />

          <Input
            label="Format Source (Muted)"
            value={(config['format-source-muted'] as string) || ''}
            onChange={(e) => handleChange('format-source-muted', e.target.value)}
            placeholder=""
            helperText="Format when microphone is muted"
          />
        </div>
      </div>

      {/* Volume Control */}
      <div className="rounded-lg border border-gray-800 bg-gray-850 p-6">
        <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-gray-400">
          Volume Control
        </h3>

        <div className="space-y-4">
          <Input
            label="Scroll Step"
            type="number"
            value={config['scroll-step'] !== undefined ? String(config['scroll-step']) : '1'}
            onChange={(e) =>
              handleChange('scroll-step', e.target.value ? parseFloat(e.target.value) : 1)
            }
            placeholder="1"
            step="0.1"
            min="0.1"
            max="100"
            helperText="Volume change per scroll (0.1-100)"
          />

          <Input
            label="Max Volume"
            type="number"
            value={config['max-volume'] !== undefined ? String(config['max-volume']) : '100'}
            onChange={(e) =>
              handleChange('max-volume', e.target.value ? parseFloat(e.target.value) : 100)
            }
            placeholder="100"
            min="1"
            max="150"
            helperText="Maximum allowed volume (1-150, default: 100)"
          />

          <div>
            <Toggle
              label="Reverse Scrolling"
              checked={(config['reverse-scrolling'] as boolean) || false}
              onChange={(checked) => handleChange('reverse-scrolling', checked)}
            />
            <p className="mt-1 text-xs text-gray-500">
              Reverse scroll direction for volume control
            </p>
          </div>

          <Input
            label="Smooth Scrolling Threshold"
            type="number"
            value={
              config['smooth-scrolling-threshold'] !== undefined
                ? String(config['smooth-scrolling-threshold'])
                : ''
            }
            onChange={(e) =>
              handleChange(
                'smooth-scrolling-threshold',
                e.target.value ? parseFloat(e.target.value) : undefined
              )
            }
            placeholder="10"
            step="0.1"
            min="0.1"
            helperText="Distance threshold for smooth scrolling (optional)"
          />
        </div>
      </div>

      {/* Ignored Sinks */}
      <div className="rounded-lg border border-gray-800 bg-gray-850 p-6">
        <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-gray-400">
          Ignored Devices
        </h3>

        <div className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-300">
              Ignored Sinks (Comma-separated)
            </label>
            <textarea
              value={ignoredSinksValue}
              onChange={(e) => handleIgnoredSinksChange(e.target.value)}
              className="w-full rounded-lg border border-gray-700 bg-gray-900 p-3 font-mono text-sm text-gray-100 placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              rows={3}
              placeholder="alsa_output.pci-0000_00_1b.0.analog-stereo, hdmi-output-0"
            />
            <p className="mt-2 text-xs text-gray-500">
              List of audio sink names to ignore, separated by commas
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
