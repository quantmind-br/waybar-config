// ============================================================================
// MODULE CARD - Individual Module Display Card (Sortable)
// ============================================================================

import { Settings, Trash2, GripVertical } from 'lucide-react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import type { ModuleInstance } from '../../lib/types/config'
import { useConfigStore } from '../../store/config-store'
import { useUIStore } from '../../store/ui-store'
import { getModuleMetadata } from '../../lib/constants/modules'
import { Button, Toggle } from '../common'

// ============================================================================
// TYPES
// ============================================================================

export interface ModuleCardProps {
  module: ModuleInstance
  barId: string
}

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * Individual module card within a zone (sortable)
 *
 * Features:
 * - Sortable within its zone using dnd-kit
 * - Display module icon, type, custom name
 * - Toggle enabled/disabled
 * - Configure button (opens module editor)
 * - Delete button
 * - Visual feedback during drag
 */
export function ModuleCard({ module, barId }: ModuleCardProps) {
  const { updateModule, deleteModule } = useConfigStore((state) => ({
    updateModule: state.updateModule,
    deleteModule: state.deleteModule,
  }))

  const openModuleEditor = useUIStore((state) => state.openModuleEditor)

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: module.id,
    data: { moduleId: module.id, position: module.position, barId },
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  // Get module metadata for icon and display name
  const metadata = getModuleMetadata(module.type)
  const displayName = metadata?.displayName || module.type

  const handleToggleEnabled = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation()
    updateModule(barId, module.id, { enabled: e.target.checked })
  }

  const handleConfigure = (e: React.MouseEvent) => {
    e.stopPropagation()
    // TODO(2): Open module editor modal (Phase 8)
    openModuleEditor(module.id)
    console.log('Configure module:', module.id)
  }

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation()
    // TODO(2): Add confirmation dialog before deletion
    deleteModule(barId, module.id)
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`
        group
        flex
        items-center
        gap-3
        rounded-lg
        border
        border-gray-700
        bg-gray-800
        p-3
        transition-all
        ${isDragging ? 'opacity-50 shadow-lg' : 'opacity-100'}
        ${!module.enabled ? 'opacity-60' : ''}
      `}
    >
      {/* Drag Handle */}
      <div
        {...attributes}
        {...listeners}
        className="cursor-grab text-gray-500 hover:text-gray-300 active:cursor-grabbing"
      >
        <GripVertical className="h-5 w-5" />
      </div>

      {/* Module Icon and Info */}
      <div className="flex flex-1 items-center gap-3">
        <span className="text-2xl">{metadata?.icon || '📦'}</span>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-semibold text-gray-100">
              {displayName}
            </h4>
            {module.customName && (
              <span className="rounded bg-blue-900 px-1.5 py-0.5 text-xs font-medium text-blue-300">
                #{module.customName}
              </span>
            )}
          </div>
          <p className="text-xs text-gray-500">{module.type}</p>
        </div>
      </div>

      {/* Enabled Toggle */}
      <div className="flex items-center gap-2">
        <Toggle
          checked={module.enabled}
          onChange={handleToggleEnabled}
          label=""
          className="scale-75"
        />
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1">
        {/* Configure Button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={handleConfigure}
          title="Configure module"
        >
          <Settings className="h-4 w-4" />
        </Button>

        {/* Delete Button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={handleDelete}
          title="Delete module"
          className="text-red-400 hover:bg-red-950 hover:text-red-300"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
