// ============================================================================
// STYLE EDITOR - Main Container for CSS Editing
// ============================================================================

import { useState } from 'react'
import { useConfigStore } from '../../store/config-store'
import { StyleDefinition } from '../../lib/types/config'
import { Select } from '../common/Select'
import { Button } from '../common/Button'
import { Plus, Trash2 } from 'lucide-react'
import { VisualEditor } from './VisualEditor'
import { CodeEditor } from './CodeEditor'

// ============================================================================
// TYPES
// ============================================================================

type EditorTab = 'visual' | 'code' | 'preview'

export interface StyleEditorProps {
  className?: string
}

// ============================================================================
// WAYBAR CSS SELECTORS
// ============================================================================

const WAYBAR_SELECTORS = [
  // Global
  { value: '*', label: 'Global (*)', category: 'Global' },
  { value: 'window', label: 'Window', category: 'Global' },
  { value: 'tooltip', label: 'Tooltip', category: 'Global' },

  // System Modules
  { value: '#battery', label: 'Battery', category: 'System' },
  { value: '#cpu', label: 'CPU', category: 'System' },
  { value: '#memory', label: 'Memory', category: 'System' },
  { value: '#disk', label: 'Disk', category: 'System' },
  { value: '#temperature', label: 'Temperature', category: 'System' },
  { value: '#network', label: 'Network', category: 'System' },
  { value: '#load', label: 'Load', category: 'System' },

  // Hardware Modules
  { value: '#backlight', label: 'Backlight', category: 'Hardware' },
  { value: '#pulseaudio', label: 'PulseAudio', category: 'Hardware' },
  { value: '#bluetooth', label: 'Bluetooth', category: 'Hardware' },
  { value: '#keyboard-state', label: 'Keyboard State', category: 'Hardware' },

  // Window Manager
  { value: '#workspaces', label: 'Workspaces', category: 'Window Manager' },
  { value: '#workspaces button', label: 'Workspace Button', category: 'Window Manager' },
  { value: '#workspaces button.active', label: 'Active Workspace', category: 'Window Manager' },
  { value: '#window', label: 'Window Title', category: 'Window Manager' },
  { value: '#mode', label: 'Mode', category: 'Window Manager' },

  // Utilities
  { value: '#clock', label: 'Clock', category: 'Utilities' },
  { value: '#tray', label: 'System Tray', category: 'Utilities' },
  { value: '#idle_inhibitor', label: 'Idle Inhibitor', category: 'Utilities' },

  // Media
  { value: '#mpd', label: 'MPD', category: 'Media' },
  { value: '#mpris', label: 'MPRIS', category: 'Media' },

  // Custom
  { value: '#custom', label: 'Custom Module', category: 'Custom' },
]

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * StyleEditor - Main container for CSS styling
 *
 * Features:
 * - Tab navigation (Visual, Code, Preview)
 * - Selector dropdown for choosing CSS targets
 * - Style management (add, update, delete)
 * - Integration with config-store
 */
export function StyleEditor({ className = '' }: StyleEditorProps) {
  const [activeTab, setActiveTab] = useState<EditorTab>('visual')
  const [selectedStyleId, setSelectedStyleId] = useState<string | null>(null)

  const styles = useConfigStore((state) => state.config.styles)
  const addStyle = useConfigStore((state) => state.addStyle)
  const updateStyle = useConfigStore((state) => state.updateStyle)
  const deleteStyle = useConfigStore((state) => state.deleteStyle)

  // Get currently selected style
  const selectedStyle = selectedStyleId
    ? styles.find((s) => s.id === selectedStyleId)
    : null

  // Auto-select first style if none selected
  if (!selectedStyleId && styles.length > 0) {
    setSelectedStyleId(styles[0].id)
  }

  const handleAddStyle = () => {
    addStyle({
      name: 'New Style',
      selector: '*',
      properties: [],
      enabled: true,
    })
  }

  const handleDeleteStyle = () => {
    if (selectedStyleId) {
      deleteStyle(selectedStyleId)
      setSelectedStyleId(styles.length > 1 ? styles[0].id : null)
    }
  }

  const handleSelectorChange = (selector: string) => {
    if (selectedStyleId) {
      updateStyle(selectedStyleId, { selector })
    }
  }

  const handleStyleUpdate = (updates: Partial<StyleDefinition>) => {
    if (selectedStyleId) {
      updateStyle(selectedStyleId, updates)
    }
  }

  return (
    <div className={`flex h-full flex-col ${className}`}>
      {/* Header */}
      <div className="border-b border-gray-800 bg-gray-850 p-4">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-100">
            CSS Styling
          </h2>
          <div className="flex gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={handleAddStyle}
            >
              <Plus className="mr-1 h-4 w-4" />
              New Style
            </Button>
            {selectedStyle && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDeleteStyle}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        {/* Style Selector */}
        {selectedStyle && (
          <div className="space-y-3">
            <Select
              label="CSS Selector"
              value={selectedStyle.selector}
              onChange={(e) => handleSelectorChange(e.target.value)}
              options={WAYBAR_SELECTORS.map((s) => ({
                value: s.value,
                label: s.label,
              }))}
            />

            <div className="text-xs text-gray-500">
              {WAYBAR_SELECTORS.find((s) => s.value === selectedStyle.selector)?.category || 'Custom'}
            </div>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-800 bg-gray-900">
        <button
          onClick={() => setActiveTab('visual')}
          className={`px-6 py-3 text-sm font-medium transition-colors ${
            activeTab === 'visual'
              ? 'border-b-2 border-blue-500 text-blue-400'
              : 'text-gray-400 hover:text-gray-300'
          }`}
        >
          Visual Editor
        </button>
        <button
          onClick={() => setActiveTab('code')}
          className={`px-6 py-3 text-sm font-medium transition-colors ${
            activeTab === 'code'
              ? 'border-b-2 border-blue-500 text-blue-400'
              : 'text-gray-400 hover:text-gray-300'
          }`}
        >
          Code Editor
        </button>
        <button
          onClick={() => setActiveTab('preview')}
          className={`px-6 py-3 text-sm font-medium transition-colors ${
            activeTab === 'preview'
              ? 'border-b-2 border-blue-500 text-blue-400'
              : 'text-gray-400 hover:text-gray-300'
          }`}
        >
          Preview
        </button>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-auto">
        {!selectedStyle ? (
          <div className="flex h-full items-center justify-center text-gray-500">
            <div className="text-center">
              <p className="mb-4">No styles yet</p>
              <Button variant="primary" onClick={handleAddStyle}>
                <Plus className="mr-2 h-4 w-4" />
                Create First Style
              </Button>
            </div>
          </div>
        ) : (
          <>
            {activeTab === 'visual' && (
              <VisualEditor
                style={selectedStyle}
                onChange={handleStyleUpdate}
              />
            )}
            {activeTab === 'code' && (
              <CodeEditor
                style={selectedStyle}
                onChange={handleStyleUpdate}
              />
            )}
            {activeTab === 'preview' && (
              <div className="flex h-full items-center justify-center p-8 text-gray-500">
                <div className="text-center">
                  <p className="mb-2">Preview Coming Soon</p>
                  <p className="text-sm">
                    Live preview of Waybar with your styles will appear here
                  </p>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
