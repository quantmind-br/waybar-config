import { ModuleConfig } from '../../../lib/types/config'
import { Input } from '../../common/Input'
import { Select } from '../../common/Select'
import { FormatBuilder } from '../../common/FormatBuilder'

export interface CPUEditorProps {
  config: ModuleConfig
  onChange: (updates: Partial<ModuleConfig>) => void
}

export function CPUEditor({ config, onChange }: CPUEditorProps) {
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
            type="number"
            label="Update Interval (seconds)"
            value={config.interval !== undefined ? String(config.interval) : '10'}
            onChange={(e) =>
              handleChange('interval', parseInt(e.target.value) || 10)
            }
            min={1}
            helperText="How often to update CPU usage information"
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
              moduleType="cpu"
              label="Default Format"
              value={(config.format as string) || ''}
              onChange={(value) => handleChange('format', value)}
              placeholder="{usage}% {icon}"
            />
            <p className="text-xs text-gray-500">
              Available variables: {'{usage}'} (CPU %), {'{load}'} (load average),{' '}
              {'{avg_frequency}'}, {'{max_frequency}'}, {'{min_frequency}'},{' '}
              {'{icon}'}
            </p>
          </div>

          <div className="space-y-2">
            <FormatBuilder
              moduleType="cpu"
              label="Alternative Format"
              value={(config['format-alt'] as string) || ''}
              onChange={(value) => handleChange('format-alt', value)}
              placeholder="{load}"
            />
            <p className="text-xs text-gray-500">
              Format shown when clicking the CPU module (if configured)
            </p>
          </div>

          <Select
            label="Alternative Format Click"
            value={(config['format-alt-click'] as string) || ''}
            onChange={(e) => handleChange('format-alt-click', e.target.value)}
            options={[
              { value: '', label: 'None' },
              { value: 'click', label: 'Left Click' },
              { value: 'click-right', label: 'Right Click' },
              { value: 'click-middle', label: 'Middle Click' },
              { value: 'click-backward', label: 'Backward Button' },
              { value: 'click-forward', label: 'Forward Button' },
            ]}
            helperText="Mouse action to toggle alternative format"
          />
        </div>
      </div>
    </div>
  )
}
