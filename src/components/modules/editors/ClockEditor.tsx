import { useState } from 'react'
import { ModuleConfig } from '../../../lib/types/config'
import { Input } from '../../common/Input'
import { Select } from '../../common/Select'
import { Toggle } from '../../common/Toggle'
import { FormatBuilder } from '../../common/FormatBuilder'
import { Button } from '../../common/Button'
import { Plus, Trash2 } from 'lucide-react'

export interface ClockEditorProps {
  config: ModuleConfig
  onChange: (updates: Partial<ModuleConfig>) => void
}

export function ClockEditor({ config, onChange }: ClockEditorProps) {
  const [showCalendarConfig, setShowCalendarConfig] = useState(
    !!config.calendar
  )
  const [showActions, setShowActions] = useState(!!config.actions)

  // Timezone list management
  const timezones = (config.timezones as string[]) || []
  const [newTimezone, setNewTimezone] = useState('')

  const handleChange = (field: string, value: any) => {
    onChange({ [field]: value })
  }

  const handleAddTimezone = () => {
    if (newTimezone.trim()) {
      onChange({
        timezones: [...timezones, newTimezone.trim()],
      })
      setNewTimezone('')
    }
  }

  const handleRemoveTimezone = (index: number) => {
    onChange({
      timezones: timezones.filter((_, i) => i !== index),
    })
  }

  // Calendar configuration helpers
  const calendarConfig =
    typeof config.calendar === 'object' && config.calendar !== null
      ? config.calendar
      : {}

  const handleCalendarChange = (field: string, value: any) => {
    onChange({
      calendar: {
        ...calendarConfig,
        [field]: value,
      },
    })
  }

  const calendarFormat =
    typeof calendarConfig.format === 'object' && calendarConfig.format !== null
      ? calendarConfig.format
      : {}

  const handleCalendarFormatChange = (field: string, value: string) => {
    onChange({
      calendar: {
        ...calendarConfig,
        format: {
          ...calendarFormat,
          [field]: value,
        },
      },
    })
  }

  // Actions helpers
  const actionsConfig =
    typeof config.actions === 'object' && config.actions !== null
      ? config.actions
      : {}

  const handleActionsChange = (field: string, value: string) => {
    onChange({
      actions: {
        ...actionsConfig,
        [field]: value,
      },
    })
  }

  const actionOptions = [
    { value: '', label: 'None' },
    { value: 'mode', label: 'Toggle Calendar Mode' },
    { value: 'tz_up', label: 'Next Timezone' },
    { value: 'tz_down', label: 'Previous Timezone' },
    { value: 'shift_up', label: 'Shift Calendar Up' },
    { value: 'shift_down', label: 'Shift Calendar Down' },
  ]

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
            value={config.interval !== undefined ? String(config.interval) : '60'}
            onChange={(e) =>
              handleChange('interval', parseInt(e.target.value) || 60)
            }
            min={1}
            helperText="How often to update the clock display"
          />

          <Input
            label="Primary Timezone"
            value={(config.timezone as string) || ''}
            onChange={(e) => handleChange('timezone', e.target.value)}
            placeholder="America/New_York"
            helperText="IANA timezone identifier (e.g., America/New_York, Europe/London)"
          />

          <Input
            label="Locale"
            value={(config.locale as string) || ''}
            onChange={(e) => handleChange('locale', e.target.value)}
            placeholder="en_US.UTF-8"
            helperText="Locale for date/time formatting (e.g., en_US.UTF-8, pt_BR.UTF-8)"
          />

          {/* Timezone list */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-300">
              Additional Timezones
            </label>
            <p className="text-xs text-gray-500">
              Cycle through multiple timezones with scroll or click actions
            </p>

            <div className="space-y-2">
              {timezones.map((tz, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Input
                    value={tz}
                    onChange={(e) => {
                      const newTimezones = [...timezones]
                      newTimezones[index] = e.target.value
                      onChange({ timezones: newTimezones })
                    }}
                    className="flex-1"
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveTimezone(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}

              <div className="flex gap-2">
                <Input
                  value={newTimezone}
                  onChange={(e) => setNewTimezone(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleAddTimezone()
                    }
                  }}
                  placeholder="America/Los_Angeles"
                  className="flex-1"
                />
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleAddTimezone}
                  disabled={!newTimezone.trim()}
                >
                  <Plus className="mr-1 h-4 w-4" />
                  Add
                </Button>
              </div>
            </div>
          </div>
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
              moduleType="clock"
              label="Default Format"
              value={(config.format as string) || ''}
              onChange={(value) => handleChange('format', value)}
              placeholder="{:%H:%M}"
            />
            <div className="rounded bg-blue-950/20 px-3 py-2 text-xs text-blue-300">
              <strong>strftime format:</strong> Use %H (24h hour), %I (12h hour),
              %M (minute), %S (second), %p (AM/PM), %a (weekday short), %A (weekday
              full), %d (day), %b (month short), %B (month full), %Y (year).
              <br />
              <a
                href="https://en.cppreference.com/w/cpp/chrono/c/strftime"
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-blue-200"
              >
                View full strftime documentation →
              </a>
            </div>
          </div>

          <div className="space-y-2">
            <FormatBuilder
              moduleType="clock"
              label="Alternative Format"
              value={(config['format-alt'] as string) || ''}
              onChange={(value) => handleChange('format-alt', value)}
              placeholder="{:%A, %B %d, %Y}"
            />
            <p className="text-xs text-gray-500">
              Format shown when clicking the clock (if enabled in actions)
            </p>
          </div>
        </div>
      </div>

      {/* Calendar Configuration */}
      <div className="rounded-lg border border-gray-800 bg-gray-850 p-6">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-400">
            Calendar Configuration
          </h3>
          <Toggle
            checked={showCalendarConfig}
            onChange={(e) => {
              const checked = e.target.checked
              setShowCalendarConfig(checked)
              if (!checked) {
                onChange({ calendar: undefined })
              } else {
                onChange({
                  calendar: {
                    mode: 'month',
                    'mode-mon-col': 3,
                    'on-scroll': 1,
                  },
                })
              }
            }}
          />
        </div>

        {showCalendarConfig && (
          <div className="space-y-4">
            <Select
              label="Calendar Mode"
              value={(calendarConfig.mode as string) || 'month'}
              onChange={(e) => handleCalendarChange('mode', e.target.value)}
              options={[
                { value: 'month', label: 'Month View' },
                { value: 'year', label: 'Year View' },
              ]}
              helperText="Display mode for the calendar popup"
            />

            <Input
              type="number"
              label="Month Columns (Year Mode)"
              value={
                calendarConfig['mode-mon-col'] !== undefined
                  ? String(calendarConfig['mode-mon-col'])
                  : '3'
              }
              onChange={(e) =>
                handleCalendarChange(
                  'mode-mon-col',
                  parseInt(e.target.value) || 3
                )
              }
              min={1}
              max={12}
              helperText="Number of month columns when in year mode"
            />

            <Input
              label="Week Position"
              value={(calendarConfig['weeks-pos'] as string) || ''}
              onChange={(e) => handleCalendarChange('weeks-pos', e.target.value)}
              placeholder="left"
              helperText="Position of week numbers (left, right)"
            />

            <Input
              type="number"
              label="Scroll Step (months)"
              value={
                calendarConfig['on-scroll'] !== undefined
                  ? String(calendarConfig['on-scroll'])
                  : '1'
              }
              onChange={(e) =>
                handleCalendarChange('on-scroll', parseInt(e.target.value) || 1)
              }
              min={1}
              helperText="Number of months to scroll per step"
            />

            {/* Calendar Format Strings */}
            <div className="space-y-3 border-t border-gray-700 pt-4">
              <h4 className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                Calendar Display Formats
              </h4>

              <Input
                label="Months Format"
                value={(calendarFormat.months as string) || ''}
                onChange={(e) =>
                  handleCalendarFormatChange('months', e.target.value)
                }
                placeholder="<span color='#ffead3'><b>{}</b></span>"
                helperText="Pango markup for month names"
              />

              <Input
                label="Days Format"
                value={(calendarFormat.days as string) || ''}
                onChange={(e) =>
                  handleCalendarFormatChange('days', e.target.value)
                }
                placeholder="<span color='#ecc6d9'><b>{}</b></span>"
                helperText="Pango markup for day numbers"
              />

              <Input
                label="Weeks Format"
                value={(calendarFormat.weeks as string) || ''}
                onChange={(e) =>
                  handleCalendarFormatChange('weeks', e.target.value)
                }
                placeholder="<span color='#99ffdd'><b>W{:%V}</b></span>"
                helperText="Pango markup for week numbers"
              />

              <Input
                label="Weekdays Format"
                value={(calendarFormat.weekdays as string) || ''}
                onChange={(e) =>
                  handleCalendarFormatChange('weekdays', e.target.value)
                }
                placeholder="<span color='#ffcc66'><b>{}</b></span>"
                helperText="Pango markup for weekday headers"
              />

              <Input
                label="Today Format"
                value={(calendarFormat.today as string) || ''}
                onChange={(e) =>
                  handleCalendarFormatChange('today', e.target.value)
                }
                placeholder="<span color='#ff6699'><b><u>{}</u></b></span>"
                helperText="Pango markup for today's date"
              />
            </div>
          </div>
        )}
      </div>

      {/* Calendar Actions */}
      <div className="rounded-lg border border-gray-800 bg-gray-850 p-6">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-400">
            Calendar Actions
          </h3>
          <Toggle
            checked={showActions}
            onChange={(e) => {
              const checked = e.target.checked
              setShowActions(checked)
              if (!checked) {
                onChange({ actions: undefined })
              } else {
                onChange({ actions: {} })
              }
            }}
          />
        </div>

        {showActions && (
          <div className="space-y-4">
            <p className="text-xs text-gray-500">
              Configure mouse and scroll actions for the clock module
            </p>

            <Select
              label="Right Click Action"
              value={(actionsConfig['on-click-right'] as string) || ''}
              onChange={(e) =>
                handleActionsChange('on-click-right', e.target.value)
              }
              options={actionOptions}
            />

            <Select
              label="Forward Button Action"
              value={(actionsConfig['on-click-forward'] as string) || ''}
              onChange={(e) =>
                handleActionsChange('on-click-forward', e.target.value)
              }
              options={actionOptions}
            />

            <Select
              label="Backward Button Action"
              value={(actionsConfig['on-click-backward'] as string) || ''}
              onChange={(e) =>
                handleActionsChange('on-click-backward', e.target.value)
              }
              options={actionOptions}
            />

            <Select
              label="Scroll Up Action"
              value={(actionsConfig['on-scroll-up'] as string) || ''}
              onChange={(e) =>
                handleActionsChange('on-scroll-up', e.target.value)
              }
              options={actionOptions}
            />

            <Select
              label="Scroll Down Action"
              value={(actionsConfig['on-scroll-down'] as string) || ''}
              onChange={(e) =>
                handleActionsChange('on-scroll-down', e.target.value)
              }
              options={actionOptions}
            />
          </div>
        )}
      </div>
    </div>
  )
}
