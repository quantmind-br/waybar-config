// ============================================================================
// BAR LIST - List of All Configured Bars
// ============================================================================

import { Plus } from 'lucide-react'
import { useConfigStore } from '../../store/config-store'
import { Button } from '../common'
import { BarCard } from './BarCard'

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * List of all configured bars with create/manage actions
 *
 * Features:
 * - Display all bars from config store
 * - Create new bar button
 * - Select bar to edit
 * - Delete, duplicate, enable/disable actions (via BarCard)
 * - Card layout with hover effects
 */
export default function BarList() {
  const { bars, currentBarId } = useConfigStore((state) => ({
    bars: state.config.bars,
    currentBarId: state.currentBarId,
  }))

  const createBar = useConfigStore((state) => state.createBar)

  const handleCreateBar = () => {
    createBar({
      name: `Bar ${bars.length + 1}`,
      enabled: true,
      config: {
        position: 'top',
        layer: 'top',
        height: 30,
        spacing: 4,
        exclusive: true,
        'gtk-layer-shell': true,
      },
    })
  }

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-800 p-4">
        <h2 className="text-lg font-semibold text-gray-100">Bars</h2>
        <Button variant="primary" size="sm" onClick={handleCreateBar}>
          <Plus className="h-4 w-4" />
          <span>New Bar</span>
        </Button>
      </div>

      {/* Bar List */}
      <div className="flex-1 overflow-y-auto p-4">
        {bars.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="mb-4 rounded-full bg-gray-800 p-6">
              <Plus className="h-8 w-8 text-gray-600" />
            </div>
            <h3 className="mb-2 text-lg font-medium text-gray-300">
              No bars configured
            </h3>
            <p className="mb-6 text-sm text-gray-500">
              Create your first Waybar configuration to get started
            </p>
            <Button variant="primary" onClick={handleCreateBar}>
              <Plus className="h-4 w-4" />
              <span>Create First Bar</span>
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {bars.map((bar) => (
              <BarCard
                key={bar.id}
                bar={bar}
                isSelected={bar.id === currentBarId}
              />
            ))}
          </div>
        )}
      </div>

      {/* Footer Info */}
      {bars.length > 0 && (
        <div className="border-t border-gray-800 p-4">
          <p className="text-xs text-gray-500">
            {bars.length} {bars.length === 1 ? 'bar' : 'bars'} configured •{' '}
            {bars.filter((b) => b.enabled).length} enabled
          </p>
        </div>
      )}
    </div>
  )
}
