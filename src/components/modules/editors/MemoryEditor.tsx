import { ModuleConfig } from '../../../lib/types/config'
import { Input } from '../../common/Input'
import { Select } from '../../common/Select'
import { FormatBuilder } from '../../common/FormatBuilder'

export interface MemoryEditorProps {
  config: ModuleConfig
  onChange: (updates: Partial<ModuleConfig>) => void
}

export function MemoryEditor({ config, onChange }: MemoryEditorProps) {
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
            value={config.interval !== undefined ? String(config.interval) : '30'}
            onChange={(e) =>
              handleChange('interval', parseInt(e.target.value) || 30)
            }
            min={1}
            helperText="How often to update memory usage information"
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
              moduleType="memory"
              label="Default Format"
              value={(config.format as string) || ''}
              onChange={(value) => handleChange('format', value)}
              placeholder="{percentage}% {icon}"
            />
            <p className="text-xs text-gray-500">
              Available variables: {'{percentage}'} (memory %), {'{used}'} (used GB),{' '}
              {'{total}'} (total GB), {'{avail}'} (available GB), {'{icon}'}
            </p>
          </div>

          <div className="space-y-2">
            <FormatBuilder
              moduleType="memory"
              label="Alternative Format"
              value={(config['format-alt'] as string) || ''}
              onChange={(value) => handleChange('format-alt', value)}
              placeholder="{used}/{total} GB"
            />
            <p className="text-xs text-gray-500">
              Format shown when clicking the memory module (if configured)
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
