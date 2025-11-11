// ============================================================================
// MODULE ZONE - Droppable Zone for Modules
// ============================================================================

import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { Package } from 'lucide-react'
import { useConfigStore, useModulesByPosition } from '../../store/config-store'
import { ModuleCard } from './ModuleCard'

// ============================================================================
// TYPES
// ============================================================================

export interface ModuleZoneProps {
  position: 'left' | 'center' | 'right'
}

// ============================================================================
// CONSTANTS
// ============================================================================

const ZONE_LABELS = {
  left: 'Left Zone',
  center: 'Center Zone',
  right: 'Right Zone',
}

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * Droppable zone for modules (left/center/right)
 *
 * Features:
 * - Droppable zone using dnd-kit
 * - Sortable context for reordering modules
 * - Display modules in the zone
 * - Empty state when no modules
 * - Visual feedback on drag over
 */
export function ModuleZone({ position }: ModuleZoneProps) {
  const currentBarId = useConfigStore((state) => state.currentBarId)
  const modules = useModulesByPosition(position)

  const { isOver, setNodeRef } = useDroppable({
    id: `zone-${position}`,
    data: { position, type: 'zone' },
  })

  // Get module IDs for SortableContext
  const moduleIds = modules.map((m) => m.id)

  return (
    <div className="flex h-full min-h-[200px] flex-col">
      {/* Zone Header */}
      <div className="mb-3 flex items-center justify-between border-b border-gray-800 pb-2">
        <h4 className="text-sm font-semibold uppercase tracking-wide text-gray-400">
          {ZONE_LABELS[position]}
        </h4>
        <span className="text-xs text-gray-500">
          {modules.length} {modules.length === 1 ? 'module' : 'modules'}
        </span>
      </div>

      {/* Drop Zone */}
      <div
        ref={setNodeRef}
        className={`
          flex-1
          rounded-lg
          border-2
          border-dashed
          p-4
          transition-all
          ${
            isOver
              ? 'border-blue-500 bg-blue-950/20'
              : 'border-gray-700 bg-gray-800/50'
          }
        `}
      >
        {modules.length === 0 ? (
          /* Empty State */
          <div className="flex h-full flex-col items-center justify-center text-center">
            <div className="mb-3 rounded-full bg-gray-800 p-4">
              <Package className="h-6 w-6 text-gray-600" />
            </div>
            <p className="text-sm text-gray-500">Drop modules here</p>
          </div>
        ) : (
          /* Module List */
          <SortableContext items={moduleIds} strategy={verticalListSortingStrategy}>
            <div className="space-y-2">
              {modules.map((module) => (
                <ModuleCard
                  key={module.id}
                  module={module}
                  barId={currentBarId || ''}
                />
              ))}
            </div>
          </SortableContext>
        )}
      </div>
    </div>
  )
}
