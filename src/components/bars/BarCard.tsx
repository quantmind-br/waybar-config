// ============================================================================
// BAR CARD - Individual Bar Display Card
// ============================================================================

import { Copy, Eye, EyeOff, Trash2 } from 'lucide-react'
import type { BarDefinition } from '../../lib/types/config'
import { useConfigStore } from '../../store/config-store'
import { Button } from '../common'

// ============================================================================
// TYPES
// ============================================================================

export interface BarCardProps {
  bar: BarDefinition
  isSelected: boolean
}

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * Individual bar card with metadata and actions
 *
 * Features:
 * - Display bar name, position, module count, enabled status
 * - Click to select/edit bar
 * - Toggle enabled/disabled
 * - Duplicate bar
 * - Delete bar
 * - Visual highlight when selected
 */
export function BarCard({ bar, isSelected }: BarCardProps) {
  const { setCurrentBar, updateBar, duplicateBar, deleteBar } = useConfigStore(
    (state) => ({
      setCurrentBar: state.setCurrentBar,
      updateBar: state.updateBar,
      duplicateBar: state.duplicateBar,
      deleteBar: state.deleteBar,
    })
  )

  const handleClick = () => {
    setCurrentBar(bar.id)
  }

  const handleToggleEnabled = (e: React.MouseEvent) => {
    e.stopPropagation() // Prevent card selection
    updateBar(bar.id, { enabled: !bar.enabled })
  }

  const handleDuplicate = (e: React.MouseEvent) => {
    e.stopPropagation()
    duplicateBar(bar.id)
  }

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation()
    // TODO(2): Add confirmation dialog before deletion
    deleteBar(bar.id)
  }

  // Get bar position or default
  const position = bar.config.position || 'top'
  const moduleCount = bar.modules.length

  return (
    <div
      onClick={handleClick}
      className={`
        group
        cursor-pointer
        rounded-lg
        border
        p-4
        transition-all
        duration-200
        ${
          isSelected
            ? 'border-blue-500 bg-blue-950 shadow-lg shadow-blue-900/50'
            : 'border-gray-700 bg-gray-800 hover:border-gray-600 hover:bg-gray-750'
        }
      `}
    >
      {/* Header - Name and Status */}
      <div className="mb-3 flex items-start justify-between">
        <div className="flex-1">
          <h3
            className={`
            mb-1
            text-base
            font-semibold
            ${isSelected ? 'text-blue-100' : 'text-gray-100'}
          `}
          >
            {bar.name || 'Unnamed Bar'}
          </h3>
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <span className="capitalize">{position}</span>
            <span>•</span>
            <span>
              {moduleCount} {moduleCount === 1 ? 'module' : 'modules'}
            </span>
          </div>
        </div>

        {/* Enabled/Disabled Badge */}
        <div
          className={`
            rounded
            px-2
            py-1
            text-xs
            font-medium
            ${
              bar.enabled
                ? 'bg-green-900 text-green-300'
                : 'bg-gray-700 text-gray-400'
            }
          `}
        >
          {bar.enabled ? 'Enabled' : 'Disabled'}
        </div>
      </div>

      {/* Actions Row */}
      <div className="flex items-center gap-2">
        {/* Toggle Enabled */}
        <Button
          variant="ghost"
          size="sm"
          onClick={handleToggleEnabled}
          title={bar.enabled ? 'Disable bar' : 'Enable bar'}
        >
          {bar.enabled ? (
            <EyeOff className="h-4 w-4" />
          ) : (
            <Eye className="h-4 w-4" />
          )}
        </Button>

        {/* Duplicate */}
        <Button
          variant="ghost"
          size="sm"
          onClick={handleDuplicate}
          title="Duplicate bar"
        >
          <Copy className="h-4 w-4" />
        </Button>

        {/* Delete */}
        <Button
          variant="ghost"
          size="sm"
          onClick={handleDelete}
          title="Delete bar"
          className="text-red-400 hover:bg-red-950 hover:text-red-300"
        >
          <Trash2 className="h-4 w-4" />
        </Button>

        {/* Edit Button (when selected) */}
        {isSelected && (
          <div className="ml-auto">
            <span className="text-xs font-medium text-blue-400">
              ← Selected
            </span>
          </div>
        )}
      </div>
    </div>
  )
}
