// ============================================================================
// MODULE PALETTE - Draggable Module Library
// ============================================================================

import { useMemo, useState } from 'react'
import { Search, X } from 'lucide-react'
import { useDraggable } from '@dnd-kit/core'
import {
  MODULE_METADATA,
  MODULE_CATEGORIES,
} from '../../lib/constants/modules'
import type { ModuleMetadata } from '../../lib/types/config'
import { Input } from '../common'

// ============================================================================
// TYPES
// ============================================================================

interface DraggableModuleCardProps {
  module: ModuleMetadata
}

// ============================================================================
// DRAGGABLE MODULE CARD
// ============================================================================

/**
 * Individual draggable module card in the palette
 */
function DraggableModuleCard({ module }: DraggableModuleCardProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: `palette-${module.type}`,
      data: { moduleType: module.type, from: 'palette' },
    })

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
      }
    : undefined

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={`
        group
        cursor-grab
        rounded-lg
        border
        border-gray-700
        bg-gray-800
        p-3
        transition-all
        hover:border-blue-500
        hover:bg-gray-750
        active:cursor-grabbing
        ${isDragging ? 'opacity-50' : 'opacity-100'}
      `}
    >
      {/* Module Icon and Name */}
      <div className="mb-2 flex items-center gap-2">
        <span className="text-2xl">{module.icon}</span>
        <div className="flex-1">
          <h4 className="text-sm font-semibold text-gray-100">
            {module.displayName}
          </h4>
          {module.requiresWM && (
            <span className="text-xs text-gray-500">
              Requires {module.requiresWM}
            </span>
          )}
        </div>
      </div>

      {/* Module Description */}
      <p className="text-xs text-gray-400">{module.description}</p>
    </div>
  )
}

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * Module palette with draggable modules organized by category
 *
 * Features:
 * - Grid display of all available modules
 * - Category filtering (system, hardware, wm, media, utility)
 * - Text search by module name
 * - Draggable cards using dnd-kit
 * - Visual feedback on hover and drag
 */
export default function ModulePalette() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  // Filter modules based on category and search query
  const filteredModules = useMemo(() => {
    let modules = MODULE_METADATA

    // Filter by category
    if (selectedCategory) {
      modules = modules.filter((m) => m.category === selectedCategory)
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      modules = modules.filter(
        (m) =>
          m.displayName.toLowerCase().includes(query) ||
          m.description.toLowerCase().includes(query) ||
          m.type.toLowerCase().includes(query)
      )
    }

    return modules
  }, [selectedCategory, searchQuery])

  const handleClearSearch = () => {
    setSearchQuery('')
  }

  const handleCategoryClick = (categoryId: string) => {
    if (selectedCategory === categoryId) {
      setSelectedCategory(null) // Deselect if already selected
    } else {
      setSelectedCategory(categoryId)
    }
  }

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="border-b border-gray-800 p-4">
        <h3 className="mb-3 text-lg font-semibold text-gray-100">
          Module Palette
        </h3>

        {/* Search Input */}
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search modules..."
            className="pl-10 pr-10"
            fullWidth
          />
          {searchQuery && (
            <button
              onClick={handleClearSearch}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap gap-2">
          {MODULE_CATEGORIES.map((category) => (
            <button
              key={category.id}
              onClick={() => handleCategoryClick(category.id)}
              className={`
                flex
                items-center
                gap-1.5
                rounded-full
                px-3
                py-1.5
                text-xs
                font-medium
                transition-colors
                ${
                  selectedCategory === category.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-gray-300'
                }
              `}
            >
              <span>{category.icon}</span>
              <span>{category.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Module Grid */}
      <div className="flex-1 overflow-y-auto p-4">
        {filteredModules.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="mb-4 rounded-full bg-gray-800 p-6">
              <Search className="h-8 w-8 text-gray-600" />
            </div>
            <h4 className="mb-2 text-lg font-medium text-gray-300">
              No modules found
            </h4>
            <p className="text-sm text-gray-500">
              Try adjusting your search or filter criteria
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {filteredModules.map((module) => (
              <DraggableModuleCard key={module.type} module={module} />
            ))}
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div className="border-t border-gray-800 p-3">
        <p className="text-xs text-gray-500">
          {filteredModules.length} of {MODULE_METADATA.length} modules
          {selectedCategory && ` (${selectedCategory})`}
        </p>
      </div>
    </div>
  )
}
