import { ModuleConfig } from '../../../lib/types/config'
import { Input } from '../../common/Input'
import { Select } from '../../common/Select'
import { FormatBuilder } from '../../common/FormatBuilder'

export interface NetworkEditorProps {
  config: ModuleConfig
  onChange: (updates: Partial<ModuleConfig>) => void
}

export function NetworkEditor({ config, onChange }: NetworkEditorProps) {
  const handleChange = (field: string, value: any) => {
    onChange({ [field]: value })
  }

  return (
    <div className="space-y-6">
      {/* Basic Settings */}
      <div className="rounded-lg border border-gray-800 bg-gray-850 p-6">
        <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-gray-400">
          Basic Settings
        </h3>

        <div className="space-y-4">
          <Input
            label="Network Interface"
            value={(config.interface as string) || ''}
            onChange={(e) => handleChange('interface', e.target.value)}
            placeholder="wlan0"
            helperText="Specific network interface to monitor (e.g., wlan0, eth0). Leave empty for automatic detection."
          />

          <Select
            label="Interface Type"
            value={(config['interface-type'] as string) || ''}
            onChange={(e) => handleChange('interface-type', e.target.value)}
            options={[
              { value: '', label: 'Auto Detect' },
              { value: 'ethernet', label: 'Ethernet' },
              { value: 'wifi', label: 'WiFi' },
            ]}
            helperText="Filter by interface type"
          />

          <Input
            type="number"
            label="Update Interval (seconds)"
            value={config.interval !== undefined ? String(config.interval) : '60'}
            onChange={(e) =>
              handleChange('interval', parseInt(e.target.value) || 60)
            }
            min={1}
            helperText="How often to update network information"
          />

          <Input
            type="number"
            label="Minimum Length"
            value={
              config['min-length'] !== undefined
                ? String(config['min-length'])
                : ''
            }
            onChange={(e) => {
              const value = e.target.value
              handleChange('min-length', value ? parseInt(value) : undefined)
            }}
            min={1}
            helperText="Minimum width of the module in characters"
          />

          <Input
            type="number"
            label="Maximum Length"
            value={
              config['max-length'] !== undefined
                ? String(config['max-length'])
                : ''
            }
            onChange={(e) => {
              const value = e.target.value
              handleChange('max-length', value ? parseInt(value) : undefined)
            }}
            min={1}
            helperText="Maximum width of the module in characters"
          />
        </div>
      </div>

      {/* Display Formats */}
      <div className="rounded-lg border border-gray-800 bg-gray-850 p-6">
        <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-gray-400">
          Display Formats
        </h3>

        <div className="space-y-4">
          <div className="space-y-2">
            <FormatBuilder
              moduleType="network"
              label="Default Format"
              value={(config.format as string) || ''}
              onChange={(value) => handleChange('format', value)}
              placeholder="{ifname}: {ipaddr}/{cidr}"
            />
            <p className="text-xs text-gray-500">
              Main format used when none of the state-specific formats match
            </p>
          </div>

          <div className="space-y-2">
            <FormatBuilder
              moduleType="network"
              label="Ethernet Format"
              value={(config['format-ethernet'] as string) || ''}
              onChange={(value) => handleChange('format-ethernet', value)}
              placeholder=" {ipaddr}/{cidr}"
            />
            <p className="text-xs text-gray-500">
              Format shown when connected via Ethernet
            </p>
          </div>

          <div className="space-y-2">
            <FormatBuilder
              moduleType="network"
              label="WiFi Format"
              value={(config['format-wifi'] as string) || ''}
              onChange={(value) => handleChange('format-wifi', value)}
              placeholder=" {essid} ({signalStrength}%)"
            />
            <p className="text-xs text-gray-500">
              Format shown when connected via WiFi
            </p>
          </div>

          <div className="space-y-2">
            <FormatBuilder
              moduleType="network"
              label="Linked Format"
              value={(config['format-linked'] as string) || ''}
              onChange={(value) => handleChange('format-linked', value)}
              placeholder=" {ifname} (No IP)"
            />
            <p className="text-xs text-gray-500">
              Format shown when interface is up but has no IP address
            </p>
          </div>

          <div className="space-y-2">
            <FormatBuilder
              moduleType="network"
              label="Disconnected Format"
              value={(config['format-disconnected'] as string) || ''}
              onChange={(value) => handleChange('format-disconnected', value)}
              placeholder="⚠ Disconnected"
            />
            <p className="text-xs text-gray-500">
              Format shown when network interface is disconnected
            </p>
          </div>

          <div className="space-y-2">
            <FormatBuilder
              moduleType="network"
              label="Disabled Format"
              value={(config['format-disabled'] as string) || ''}
              onChange={(value) => handleChange('format-disabled', value)}
              placeholder="Disabled"
            />
            <p className="text-xs text-gray-500">
              Format shown when network interface is disabled
            </p>
          </div>

          <div className="space-y-2">
            <FormatBuilder
              moduleType="network"
              label="Alternative Format"
              value={(config['format-alt'] as string) || ''}
              onChange={(value) => handleChange('format-alt', value)}
              placeholder="{bandwidthDownBits} ↓↑ {bandwidthUpBits}"
            />
            <p className="text-xs text-gray-500">
              Format shown when clicking the network module
            </p>
          </div>
        </div>
      </div>

      {/* Tooltip Formats */}
      <div className="rounded-lg border border-gray-800 bg-gray-850 p-6">
        <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-gray-400">
          Tooltip Formats
        </h3>

        <div className="space-y-4">
          <div className="space-y-2">
            <FormatBuilder
              moduleType="network"
              label="Default Tooltip"
              value={(config['tooltip-format'] as string) || ''}
              onChange={(value) => handleChange('tooltip-format', value)}
              placeholder="{ifname} via {gwaddr}"
            />
            <p className="text-xs text-gray-500">
              Main tooltip format
            </p>
          </div>

          <div className="space-y-2">
            <FormatBuilder
              moduleType="network"
              label="WiFi Tooltip"
              value={(config['tooltip-format-wifi'] as string) || ''}
              onChange={(value) => handleChange('tooltip-format-wifi', value)}
              placeholder="{essid} ({signalStrength}%) via {gwaddr}"
            />
            <p className="text-xs text-gray-500">
              Tooltip shown when connected via WiFi
            </p>
          </div>

          <div className="space-y-2">
            <FormatBuilder
              moduleType="network"
              label="Ethernet Tooltip"
              value={(config['tooltip-format-ethernet'] as string) || ''}
              onChange={(value) => handleChange('tooltip-format-ethernet', value)}
              placeholder="{ifname} via {gwaddr}"
            />
            <p className="text-xs text-gray-500">
              Tooltip shown when connected via Ethernet
            </p>
          </div>

          <div className="space-y-2">
            <FormatBuilder
              moduleType="network"
              label="Disconnected Tooltip"
              value={(config['tooltip-format-disconnected'] as string) || ''}
              onChange={(value) =>
                handleChange('tooltip-format-disconnected', value)
              }
              placeholder="Disconnected"
            />
            <p className="text-xs text-gray-500">
              Tooltip shown when disconnected
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
