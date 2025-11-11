import { ModuleConfig } from '../../../lib/types/config'
import { Input } from '../../common/Input'
import { Select } from '../../common/Select'
import { Toggle } from '../../common/Toggle'
import { FormatBuilder } from '../../common/FormatBuilder'

export interface CustomEditorProps {
  config: ModuleConfig
  onChange: (updates: Partial<ModuleConfig>) => void
}

export function CustomEditor({ config, onChange }: CustomEditorProps) {
  const handleChange = (field: string, value: any) => {
    onChange({ [field]: value })
  }

  return (
    <div className="space-y-6">
      {/* Script Configuration */}
      <div className="rounded-lg border border-gray-800 bg-gray-850 p-6">
        <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-gray-400">
          Script Configuration
        </h3>

        <div className="space-y-4">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-300">
              Exec Command
            </label>
            <textarea
              value={(config.exec as string) || ''}
              onChange={(e) => handleChange('exec', e.target.value)}
              placeholder="echo 'Hello World'"
              className="w-full rounded border border-gray-700 bg-gray-800 px-3 py-2 font-mono text-sm text-gray-100 placeholder-gray-500 focus:border-blue-500 focus:outline-none"
              rows={3}
            />
            <p className="text-xs text-gray-500">
              Command or script to execute. Output will be displayed in the module.
            </p>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-300">
              Exec-If Command
            </label>
            <textarea
              value={(config['exec-if'] as string) || ''}
              onChange={(e) => handleChange('exec-if', e.target.value)}
              placeholder="pgrep -x process_name"
              className="w-full rounded border border-gray-700 bg-gray-800 px-3 py-2 font-mono text-sm text-gray-100 placeholder-gray-500 focus:border-blue-500 focus:outline-none"
              rows={2}
            />
            <p className="text-xs text-gray-500">
              Condition command. Module only executes if this returns exit code 0.
            </p>
          </div>

          <div className="space-y-2">
            <Toggle
              label="Execute on Event"
              checked={(config['exec-on-event'] as boolean) ?? true}
              onChange={(e) => handleChange('exec-on-event', e.target.checked)}
            />
            <p className="text-xs text-gray-500">
              Execute the script when an event is triggered (click, scroll, etc.)
            </p>
          </div>

          <div className="space-y-2">
            <Toggle
              label="Escape Output"
              checked={(config.escape as boolean) || false}
              onChange={(e) => handleChange('escape', e.target.checked)}
            />
            <p className="text-xs text-gray-500">
              Escape HTML/Pango markup in the script output
            </p>
          </div>
        </div>
      </div>

      {/* Execution Timing */}
      <div className="rounded-lg border border-gray-800 bg-gray-850 p-6">
        <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-gray-400">
          Execution Timing
        </h3>

        <div className="space-y-4">
          <div className="space-y-2">
            <Select
              label="Interval"
              value={
                config.interval === 'once'
                  ? 'once'
                  : config.interval !== undefined
                    ? String(config.interval)
                    : ''
              }
              onChange={(e) => {
                const value = e.target.value
                if (value === 'once') {
                  handleChange('interval', 'once')
                } else if (value === '') {
                  handleChange('interval', undefined)
                } else {
                  handleChange('interval', parseInt(value))
                }
              }}
              options={[
                { value: '', label: 'Manual (no auto-update)' },
                { value: 'once', label: 'Once (run once on startup)' },
                { value: '1', label: '1 second' },
                { value: '5', label: '5 seconds' },
                { value: '10', label: '10 seconds' },
                { value: '30', label: '30 seconds' },
                { value: '60', label: '1 minute' },
                { value: '300', label: '5 minutes' },
                { value: '600', label: '10 minutes' },
              ]}
              helperText="How often to execute the script automatically"
            />
          </div>

          <Input
            type="number"
            label="Restart Interval (seconds)"
            value={
              config.restart !== undefined ? String(config.restart) : ''
            }
            onChange={(e) => {
              const value = e.target.value
              handleChange('restart', value ? parseInt(value) : undefined)
            }}
            min={1}
            placeholder="Leave empty for no restart"
            helperText="Restart the script if it doesn't exit within this time"
          />

          <Input
            type="number"
            label="Signal Number"
            value={(config.signal as number) !== undefined ? String(config.signal) : ''}
            onChange={(e) => {
              const value = e.target.value
              handleChange('signal', value ? parseInt(value) : undefined)
            }}
            min={1}
            max={64}
            placeholder="e.g., 8"
            helperText="Update the module when this POSIX signal is received (1-64)"
          />
        </div>
      </div>

      {/* Output Format */}
      <div className="rounded-lg border border-gray-800 bg-gray-850 p-6">
        <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-gray-400">
          Output Format
        </h3>

        <div className="space-y-4">
          <Select
            label="Return Type"
            value={(config['return-type'] as string) || ''}
            onChange={(e) => handleChange('return-type', e.target.value)}
            options={[
              { value: '', label: 'Plain Text' },
              { value: 'json', label: 'JSON' },
            ]}
            helperText="Expected output format from the script"
          />

          {config['return-type'] === 'json' && (
            <div className="rounded-lg border border-blue-900/30 bg-blue-950/20 p-4">
              <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-blue-400">
                JSON Output Format
              </h4>
              <p className="mb-3 text-xs text-blue-300/80">
                When using JSON return type, your script should output a JSON object
                with the following optional fields:
              </p>
              <pre className="overflow-x-auto rounded bg-gray-950/50 p-3 font-mono text-xs text-gray-300">
{`{
  "text": "Display text",
  "tooltip": "Tooltip text",
  "alt": "Alternative text",
  "class": "css-class-name",
  "percentage": 50
}`}
              </pre>
              <p className="mt-3 text-xs text-blue-300/80">
                <strong>Example script:</strong>
              </p>
              <pre className="mt-1 overflow-x-auto rounded bg-gray-950/50 p-3 font-mono text-xs text-gray-300">
{`#!/bin/bash
echo '{"text":"'$(date +%H:%M)'","tooltip":"Current time"}'`}
              </pre>
            </div>
          )}

          {config['return-type'] !== 'json' && (
            <div className="space-y-2">
              <FormatBuilder
                moduleType="custom"
                label="Format String"
                value={(config.format as string) || ''}
                onChange={(value) => handleChange('format', value)}
                placeholder="{}"
              />
              <p className="text-xs text-gray-500">
                Format template for the output. Use {'{}'} to insert the script
                output.
              </p>
            </div>
          )}

          <div className="rounded-lg border border-yellow-900/30 bg-yellow-950/20 p-4">
            <h4 className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-yellow-400">
              <svg
                className="h-4 w-4"
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
              Script Best Practices
            </h4>
            <ul className="space-y-1 text-xs text-yellow-300/80">
              <li>• Make scripts executable: <code className="rounded bg-yellow-950/50 px-1 py-0.5">chmod +x script.sh</code></li>
              <li>• Use absolute paths for reliability</li>
              <li>• Handle errors gracefully (script failures can freeze Waybar)</li>
              <li>• Keep execution time short (&lt;1 second recommended)</li>
              <li>• Test scripts before adding to config</li>
              <li>• Use <code className="rounded bg-yellow-950/50 px-1 py-0.5">exec-if</code> to prevent unnecessary executions</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
