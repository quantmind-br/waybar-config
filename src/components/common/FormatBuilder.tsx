// ============================================================================
// FORMAT BUILDER - Helper for building Waybar format strings
// ============================================================================

import { useState, useMemo } from 'react'
import { Code, Plus, X } from 'lucide-react'
import { Button } from './Button'
import { getFormatVariables, getCommonFormatVariables } from '../../lib/constants/format-variables'
import type { ModuleType } from '../../lib/types/config'
import type { FormatVariable } from '../../lib/constants/format-variables'

// ============================================================================
// TYPES
// ============================================================================

export interface FormatBuilderProps {
  moduleType: ModuleType
  value: string
  onChange: (value: string) => void
  label?: string
  placeholder?: string
  showPreview?: boolean
}

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * FormatBuilder - Interactive builder for Waybar format strings
 *
 * Features:
 * - Variable picker with descriptions
 * - Live preview of format string
 * - Click to insert variables
 * - Search/filter variables
 *
 * Format syntax: {variable_name}
 * Example: "Battery: {capacity}% {icon}"
 *
 * Usage:
 * ```tsx
 * <FormatBuilder
 *   moduleType="battery"
 *   value={config.format}
 *   onChange={(value) => handleChange({ format: value })}
 * />
 * ```
 */
export function FormatBuilder({
  moduleType,
  value,
  onChange,
  label = 'Format String',
  placeholder = 'Enter format string...',
  showPreview = true,
}: FormatBuilderProps) {
  // ============================================================================
  // STATE
  // ============================================================================

  const [isVariablePickerOpen, setIsVariablePickerOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  // Get available variables for this module type
  const moduleVariables = useMemo(
    () => getFormatVariables(moduleType),
    [moduleType]
  )
  const commonVariables = useMemo(() => getCommonFormatVariables(), [])
  const allVariables = useMemo(
    () => [...moduleVariables, ...commonVariables],
    [moduleVariables, commonVariables]
  )

  // Filter variables by search query
  const filteredVariables = useMemo(() => {
    if (!searchQuery.trim()) return allVariables

    const query = searchQuery.toLowerCase()
    return allVariables.filter(
      (v) =>
        v.name.toLowerCase().includes(query) ||
        v.description.toLowerCase().includes(query)
    )
  }, [allVariables, searchQuery])

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handleInsertVariable = (variable: FormatVariable) => {
    // Insert variable at cursor position or append
    const cursorPosition = (document.activeElement as HTMLInputElement)
      ?.selectionStart

    if (cursorPosition !== undefined && cursorPosition !== null) {
      const before = value.slice(0, cursorPosition)
      const after = value.slice(cursorPosition)
      const newValue = `${before}{${variable.name}}${after}`
      onChange(newValue)
    } else {
      // Append to end
      const newValue = value ? `${value} {${variable.name}}` : `{${variable.name}}`
      onChange(newValue)
    }

    setIsVariablePickerOpen(false)
  }

  // Preview: Replace variables with example values
  const preview = useMemo(() => {
    let previewString = value

    allVariables.forEach((variable) => {
      const regex = new RegExp(`\\{${variable.name}\\}`, 'g')
      previewString = previewString.replace(
        regex,
        variable.example || `[${variable.name}]`
      )
    })

    return previewString
  }, [value, allVariables])

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div className="space-y-2">
      {/* Label */}
      <label className="block text-sm font-medium text-gray-300">
        {label}
      </label>

      {/* Input with Variable Picker Button */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className="w-full rounded border border-gray-700 bg-gray-800 px-3 py-2 pr-10 text-sm text-gray-100 placeholder-gray-500 focus:border-blue-500 focus:outline-none"
          />
          <Code className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
        </div>

        <Button
          variant="secondary"
          size="sm"
          onClick={() => setIsVariablePickerOpen(!isVariablePickerOpen)}
          aria-label="Open variable picker"
        >
          <Plus className="h-4 w-4" />
          Variables
        </Button>
      </div>

      {/* Help Text */}
      <p className="text-xs text-gray-500">
        Use {'{'}variable{'}'} syntax. Example: Battery: {'{'}capacity{'}'}%{' '}
        {'{'}icon{'}'}
      </p>

      {/* Preview */}
      {showPreview && value && (
        <div className="rounded border border-gray-700 bg-gray-850 p-3">
          <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-gray-500">
            Preview
          </p>
          <p className="text-sm text-gray-300">{preview}</p>
        </div>
      )}

      {/* Variable Picker Dropdown */}
      {isVariablePickerOpen && (
        <div className="rounded-lg border border-gray-700 bg-gray-850 shadow-lg">
          {/* Search Bar */}
          <div className="border-b border-gray-800 p-3">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search variables..."
                className="w-full rounded border border-gray-700 bg-gray-800 px-3 py-2 pr-10 text-sm text-gray-100 placeholder-gray-500 focus:border-blue-500 focus:outline-none"
                autoFocus
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                  aria-label="Clear search"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>

          {/* Variable List */}
          <div className="max-h-64 overflow-y-auto p-2">
            {filteredVariables.length === 0 ? (
              <p className="p-3 text-center text-sm text-gray-500">
                No variables found
              </p>
            ) : (
              <div className="space-y-1">
                {filteredVariables.map((variable) => (
                  <button
                    key={variable.name}
                    onClick={() => handleInsertVariable(variable)}
                    className="flex w-full items-start gap-3 rounded p-2 text-left transition-colors hover:bg-gray-800"
                  >
                    <code className="flex-shrink-0 rounded bg-blue-950 px-2 py-1 text-xs font-mono text-blue-300">
                      {'{'}
                      {variable.name}
                      {'}'}
                    </code>
                    <div className="flex-1">
                      <p className="text-sm text-gray-300">
                        {variable.description}
                      </p>
                      {variable.example && (
                        <p className="mt-1 text-xs text-gray-500">
                          Example: {variable.example}
                        </p>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-gray-800 p-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsVariablePickerOpen(false)}
              fullWidth
            >
              Close
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
