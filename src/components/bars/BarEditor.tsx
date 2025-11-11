// ============================================================================
// BAR EDITOR - Main Bar Configuration Editor Container
// ============================================================================

import { useState } from 'react'
import { Settings, Package, Palette } from 'lucide-react'
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragOverEvent,
  type DragEndEvent,
} from '@dnd-kit/core'
import { useConfigStore } from '../../store/config-store'
import { useUIStore } from '../../store/ui-store'
import { BarSettings } from './BarSettings'
import { ModuleZone } from '../modules'
import type { ModuleInstance } from '../../lib/types/config'

// ============================================================================
// TYPES
// ============================================================================

type EditorTab = 'general' | 'modules' | 'styling'

interface TabConfig {
  id: EditorTab
  label: string
  icon: React.ReactNode
}

// ============================================================================
// CONSTANTS
// ============================================================================

const TABS: TabConfig[] = [
  {
    id: 'general',
    label: 'General',
    icon: <Settings className="h-4 w-4" />,
  },
  {
    id: 'modules',
    label: 'Modules',
    icon: <Package className="h-4 w-4" />,
  },
  {
    id: 'styling',
    label: 'Styling',
    icon: <Palette className="h-4 w-4" />,
  },
]

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * Main bar editor container with tabbed interface
 *
 * Features:
 * - Tabs: General (settings), Modules (drag-and-drop), Styling (CSS)
 * - Tab navigation with keyboard support
 * - Displays current bar name in header
 * - Shows empty state when no bar is selected
 * - Drag-and-drop for modules (multi-container pattern)
 */
export default function BarEditor() {
  const currentBar = useConfigStore((state) => {
    const barId = state.currentBarId
    return barId ? state.config.bars.find((b) => b.id === barId) : null
  })

  const { activeEditorTab, setActiveEditorTab } = useUIStore((state) => ({
    activeEditorTab: state.activeEditorTab,
    setActiveEditorTab: state.setActiveEditorTab,
  }))

  // Get store actions
  const { addModule, moveModule, reorderModules } = useConfigStore((state) => ({
    addModule: state.addModule,
    moveModule: state.moveModule,
    reorderModules: state.reorderModules,
  }))

  // Drag state for DragOverlay
  const [activeModule, setActiveModule] = useState<ModuleInstance | null>(null)
  const [activeModuleType, setActiveModuleType] = useState<string | null>(null)

  // Configure drag sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // 8px movement required to start drag
      },
    }),
    useSensor(KeyboardSensor)
  )

  /**
   * Handle drag start - capture the dragged item for DragOverlay
   */
  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event

    // Check if dragging from palette (new module)
    if (active.data.current?.from === 'palette') {
      setActiveModuleType(active.data.current.moduleType)
    } else {
      // Dragging existing module - find it in the current bar
      const moduleId = active.id as string
      const module = currentBar?.modules.find((m) => m.id === moduleId)
      if (module) {
        setActiveModule(module)
      }
    }
  }

  /**
   * Handle drag over - visual feedback (optional for this implementation)
   */
  const handleDragOver = (_event: DragOverEvent) => {
    // Optional: Add visual feedback during drag over
    // For now, we'll handle everything in onDragEnd
  }

  /**
   * Handle drag end - finalize module placement
   */
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    // Clear drag state
    setActiveModule(null)
    setActiveModuleType(null)

    if (!over || !currentBar) return

    const activeId = active.id as string
    const overId = over.id as string

    // Case 1: Dragging from palette to a zone (add new module)
    if (active.data.current?.from === 'palette') {
      const moduleType = active.data.current.moduleType
      const targetPosition = over.data.current?.position

      if (targetPosition && ['left', 'center', 'right'].includes(targetPosition)) {
        // Get the count of modules in the target position to set the order
        const modulesInPosition = currentBar.modules.filter(
          (m) => m.position === targetPosition
        )

        addModule(currentBar.id, {
          type: moduleType,
          position: targetPosition as 'left' | 'center' | 'right',
          order: modulesInPosition.length,
          config: {},
          enabled: true,
        })
      }
      return
    }

    // Case 2: Reordering within the same zone or moving between zones
    const activeModule = currentBar.modules.find((m) => m.id === activeId)
    if (!activeModule) return

    // Check if dropped on a zone
    if (overId.startsWith('zone-')) {
      const targetPosition = over.data.current?.position as 'left' | 'center' | 'right'

      if (targetPosition && targetPosition !== activeModule.position) {
        // Moving to a different zone
        const modulesInTargetPosition = currentBar.modules.filter(
          (m) => m.position === targetPosition
        )
        moveModule(currentBar.id, activeId, targetPosition, modulesInTargetPosition.length)
      }
      return
    }

    // Check if dropped on another module (reordering)
    const overModule = currentBar.modules.find((m) => m.id === overId)
    if (overModule && activeModule.position === overModule.position) {
      // Reordering within the same zone
      const modulesInPosition = currentBar.modules
        .filter((m) => m.position === activeModule.position)
        .sort((a, b) => a.order - b.order)

      const oldIndex = modulesInPosition.findIndex((m) => m.id === activeId)
      const newIndex = modulesInPosition.findIndex((m) => m.id === overId)

      if (oldIndex !== newIndex) {
        // Create new order array
        const reordered = [...modulesInPosition]
        const [movedModule] = reordered.splice(oldIndex, 1)
        reordered.splice(newIndex, 0, movedModule)

        // Update module orders
        reorderModules(
          currentBar.id,
          activeModule.position,
          reordered.map((m) => m.id)
        )
      }
    }
  }

  // Empty state when no bar is selected
  if (!currentBar) {
    return (
      <div className="flex h-full flex-col items-center justify-center p-8 text-center">
        <div className="mb-4 rounded-full bg-gray-800 p-8">
          <Settings className="h-12 w-12 text-gray-600" />
        </div>
        <h2 className="mb-2 text-xl font-semibold text-gray-300">
          No Bar Selected
        </h2>
        <p className="text-sm text-gray-500">
          Select a bar from the sidebar to start editing
        </p>
      </div>
    )
  }

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="flex h-full flex-col">
        {/* Header */}
        <div className="border-b border-gray-800 p-4">
          <h2 className="text-lg font-semibold text-gray-100">
            {currentBar.name || 'Unnamed Bar'}
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Configure bar settings, modules, and styling
          </p>
        </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-800">
        <nav className="flex gap-1 px-4" role="tablist">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              role="tab"
              aria-selected={activeEditorTab === tab.id}
              aria-controls={`${tab.id}-panel`}
              onClick={() => setActiveEditorTab(tab.id)}
              className={`
                flex
                items-center
                gap-2
                border-b-2
                px-4
                py-3
                text-sm
                font-medium
                transition-colors
                ${
                  activeEditorTab === tab.id
                    ? 'border-blue-500 text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-300'
                }
              `}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto">
        {/* General Tab */}
        {activeEditorTab === 'general' && (
          <div
            id="general-panel"
            role="tabpanel"
            aria-labelledby="general-tab"
            className="p-6"
          >
            <BarSettings bar={currentBar} />
          </div>
        )}

        {/* Modules Tab */}
        {activeEditorTab === 'modules' && (
          <div
            id="modules-panel"
            role="tabpanel"
            aria-labelledby="modules-tab"
            className="p-6"
          >
            {/* Module Zones Grid */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              <ModuleZone position="left" />
              <ModuleZone position="center" />
              <ModuleZone position="right" />
            </div>
          </div>
        )}

        {/* Styling Tab */}
        {activeEditorTab === 'styling' && (
          <div
            id="styling-panel"
            role="tabpanel"
            aria-labelledby="styling-tab"
            className="p-6"
          >
            {/* TODO(2): Implement CSS visual editor (Phase 9) */}
            <div className="rounded-lg border border-gray-700 bg-gray-800 p-8 text-center">
              <Palette className="mx-auto mb-4 h-12 w-12 text-gray-600" />
              <h3 className="mb-2 text-lg font-semibold text-gray-300">
                Style Editor
              </h3>
              <p className="text-sm text-gray-500">
                CSS visual editor will be implemented in Phase 9
              </p>
            </div>
          </div>
        )}
      </div>
      </div>

      {/* Drag Overlay */}
      <DragOverlay>
        {activeModule ? (
          <div className="rounded-lg border border-blue-500 bg-gray-800 p-3 shadow-xl">
            <p className="text-sm font-semibold text-gray-100">
              {activeModule.type}
            </p>
          </div>
        ) : activeModuleType ? (
          <div className="rounded-lg border border-blue-500 bg-gray-800 p-3 shadow-xl">
            <p className="text-sm font-semibold text-gray-100">
              {activeModuleType}
            </p>
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  )
}
