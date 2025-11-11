// ============================================================================
// MODULE EDITOR MODAL - Full-screen modal for module configuration
// ============================================================================

import { useEffect, useState } from 'react'
import { X, Settings, Eye, Sliders, MousePointerClick } from 'lucide-react'
import { useUIStore } from '../../store/ui-store'
import { useConfigStore } from '../../store/config-store'
import { Button } from '../common/Button'
import type { ModuleInstance } from '../../lib/types/config'
import { getModuleMetadata } from '../../lib/constants/modules'

// ============================================================================
// TYPES
// ============================================================================

type ModuleEditorTab = 'basic' | 'display' | 'advanced' | 'actions'

interface ModuleEditorProps {
  // Optional: can be controlled externally
  isOpen?: boolean
  moduleId?: string | null
  onClose?: () => void
}

// ============================================================================
// TAB CONFIGURATION
// ============================================================================

const TABS: Array<{
  id: ModuleEditorTab
  label: string
  icon: React.ComponentType<{ className?: string }>
}> = [
  { id: 'basic', label: 'Basic', icon: Settings },
  { id: 'display', label: 'Display', icon: Eye },
  { id: 'advanced', label: 'Advanced', icon: Sliders },
  { id: 'actions', label: 'Actions', icon: MousePointerClick },
]

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * ModuleEditor - Full-screen modal for configuring Waybar modules
 *
 * Features:
 * - Full-screen overlay modal
 * - Tab-based interface (Basic, Display, Advanced, Actions)
 * - Dynamic form based on module type
 * - Real-time preview of configuration
 * - Save/Cancel actions
 *
 * Integration:
 * - Uses ui-store for open/close state and selectedModuleId
 * - Uses config-store to read and update module configuration
 *
 * Usage:
 * - Opens automatically when openModuleEditor(moduleId) is called
 * - Can also be controlled via props for testing
 */
export function ModuleEditor({
  isOpen: controlledIsOpen,
  moduleId: controlledModuleId,
  onClose: controlledOnClose,
}: ModuleEditorProps = {}) {
  // ============================================================================
  // STATE & REFS
  // ============================================================================

  // Use controlled props if provided, otherwise use store
  const storeIsOpen = useUIStore((state) => state.isModuleEditorOpen)
  const storeModuleId = useUIStore((state) => state.selectedModuleId)
  const closeModuleEditor = useUIStore((state) => state.closeModuleEditor)

  const isOpen = controlledIsOpen ?? storeIsOpen
  const moduleId = controlledModuleId ?? storeModuleId
  const onClose = controlledOnClose ?? closeModuleEditor

  // Get module from config store
  const currentBar = useConfigStore((state) => {
    const barId = state.currentBarId
    return barId ? state.config.bars.find((b) => b.id === barId) : null
  })

  const module = currentBar?.modules.find((m) => m.id === moduleId) || null

  // Get store actions
  const updateModule = useConfigStore((state) => state.updateModule)

  // Local state for edited module config
  const [editedModule, setEditedModule] = useState<ModuleInstance | null>(null)
  const [activeTab, setActiveTab] = useState<ModuleEditorTab>('basic')
  const [hasChanges, setHasChanges] = useState(false)

  // ============================================================================
  // EFFECTS
  // ============================================================================

  // Load module into local state when modal opens
  useEffect(() => {
    if (isOpen && module) {
      setEditedModule({ ...module })
      setHasChanges(false)
      setActiveTab('basic')
    }
  }, [isOpen, module])

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handleClose = () => {
    if (hasChanges) {
      const confirmed = window.confirm(
        'You have unsaved changes. Are you sure you want to close?'
      )
      if (!confirmed) return
    }
    onClose()
  }

  const handleSave = () => {
    if (!editedModule || !currentBar) return

    // Update module in store
    updateModule(currentBar.id, editedModule.id, editedModule)

    // Close modal
    onClose()
  }

  const handleCancel = () => {
    handleClose()
  }

  // TODO(2): Add handleConfigChange for module-specific editors (Tasks 39-42)
  // This will update editedModule.config with partial updates

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        handleClose()
      }
    }

    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [isOpen, hasChanges])

  // ============================================================================
  // RENDER
  // ============================================================================

  if (!isOpen || !editedModule) return null

  const metadata = getModuleMetadata(editedModule.type)
  const displayName = metadata?.displayName || editedModule.type

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
      onClick={handleClose}
    >
      {/* Modal Content */}
      <div
        className="flex h-[90vh] w-[90vw] max-w-6xl flex-col rounded-lg border border-gray-700 bg-gray-900 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-800 p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-950 text-xl">
              {metadata?.icon || '⚙️'}
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-100">
                Configure {displayName}
              </h2>
              <p className="text-sm text-gray-400">
                {editedModule.customName || editedModule.type}
              </p>
            </div>
          </div>

          {/* Close Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClose}
            aria-label="Close modal"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-800 bg-gray-900">
          {TABS.map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  flex items-center gap-2 px-6 py-3 text-sm font-medium transition-colors
                  ${
                    activeTab === tab.id
                      ? 'border-b-2 border-blue-500 text-blue-400'
                      : 'text-gray-400 hover:text-gray-200'
                  }
                `}
                role="tab"
                aria-selected={activeTab === tab.id}
                aria-controls={`${tab.id}-panel`}
                id={`${tab.id}-tab`}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            )
          })}
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Basic Tab */}
          {activeTab === 'basic' && (
            <div
              id="basic-panel"
              role="tabpanel"
              aria-labelledby="basic-tab"
              className="space-y-6"
            >
              <div className="rounded-lg border border-gray-800 bg-gray-850 p-6">
                <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-gray-400">
                  Module Information
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-300">
                      Module Type
                    </label>
                    <input
                      type="text"
                      value={editedModule.type}
                      disabled
                      className="w-full rounded border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-gray-400"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-300">
                      Custom Name (optional)
                    </label>
                    <input
                      type="text"
                      value={editedModule.customName || ''}
                      onChange={(e) => {
                        setEditedModule({
                          ...editedModule,
                          customName: e.target.value || undefined,
                        })
                        setHasChanges(true)
                      }}
                      placeholder="e.g., bat0, bat1"
                      className="w-full rounded border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-gray-100 placeholder-gray-500 focus:border-blue-500 focus:outline-none"
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      Used for multiple instances: #battery#bat0, #battery#bat1
                    </p>
                  </div>
                </div>
              </div>

              {/* TODO(2): Add module-specific basic configuration fields */}
              <div className="rounded-lg border border-gray-800 bg-gray-850 p-6">
                <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-gray-400">
                  Basic Configuration
                </h3>
                <p className="text-sm text-gray-500">
                  Module-specific configuration will be implemented in Phase 8
                  (Tasks 39-42).
                </p>
              </div>
            </div>
          )}

          {/* Display Tab */}
          {activeTab === 'display' && (
            <div
              id="display-panel"
              role="tabpanel"
              aria-labelledby="display-tab"
              className="space-y-6"
            >
              {/* TODO(2): Add display configuration (format, format-icons, tooltip) */}
              <div className="rounded-lg border border-gray-800 bg-gray-850 p-6">
                <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-gray-400">
                  Display Settings
                </h3>
                <p className="text-sm text-gray-500">
                  Display configuration (format strings, icons, tooltips) will be
                  implemented in Phase 8.
                </p>
              </div>
            </div>
          )}

          {/* Advanced Tab */}
          {activeTab === 'advanced' && (
            <div
              id="advanced-panel"
              role="tabpanel"
              aria-labelledby="advanced-tab"
              className="space-y-6"
            >
              {/* TODO(2): Add advanced configuration (states, intervals, custom options) */}
              <div className="rounded-lg border border-gray-800 bg-gray-850 p-6">
                <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-gray-400">
                  Advanced Settings
                </h3>
                <p className="text-sm text-gray-500">
                  Advanced configuration (states, intervals, module-specific
                  options) will be implemented in Phase 8.
                </p>
              </div>
            </div>
          )}

          {/* Actions Tab */}
          {activeTab === 'actions' && (
            <div
              id="actions-panel"
              role="tabpanel"
              aria-labelledby="actions-tab"
              className="space-y-6"
            >
              {/* TODO(2): Add interactive actions (on-click, on-scroll, etc.) */}
              <div className="rounded-lg border border-gray-800 bg-gray-850 p-6">
                <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-gray-400">
                  Interactive Actions
                </h3>
                <p className="text-sm text-gray-500">
                  Interactive actions (on-click, on-scroll, etc.) will be
                  implemented in Phase 8.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-gray-800 p-4">
          <div className="text-sm text-gray-500">
            {hasChanges && (
              <span className="text-yellow-500">● Unsaved changes</span>
            )}
          </div>

          <div className="flex gap-2">
            <Button variant="ghost" onClick={handleCancel}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleSave} disabled={!hasChanges}>
              Save Changes
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
