// ============================================================================
// ICON PICKER - Icon selection component for Waybar
// ============================================================================

import { useState, useMemo } from 'react'
import { Search, X, Smile } from 'lucide-react'
import { Button } from './Button'
import {
  ICON_LIBRARY,
  ICON_CATEGORIES,
  searchIcons,
  type IconCategory,
  type IconItem,
} from '../../lib/constants/icons'

// ============================================================================
// TYPES
// ============================================================================

export interface IconPickerProps {
  value: string
  onChange: (value: string) => void
  label?: string
  placeholder?: string
  allowCustom?: boolean
}

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * IconPicker - Interactive icon picker for Waybar modules
 *
 * Features:
 * - Grid display of icons
 * - Category filtering
 * - Search functionality
 * - Custom icon input
 * - Nerd Fonts and Emoji support
 *
 * Usage:
 * ```tsx
 * <IconPicker
 *   value={config['format-icons']?.charging || ''}
 *   onChange={(icon) => handleChange({ 'format-icons': { ...formatIcons, charging: icon } })}
 * />
 * ```
 */
export function IconPicker({
  value,
  onChange,
  label = 'Icon',
  placeholder = 'Select an icon...',
  allowCustom = true,
}: IconPickerProps) {
  // ============================================================================
  // STATE
  // ============================================================================

  const [isPickerOpen, setIsPickerOpen] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<IconCategory | null>(
    null
  )
  const [searchQuery, setSearchQuery] = useState('')
  const [customIconInput, setCustomIconInput] = useState('')

  // Filter icons
  const filteredIcons = useMemo(() => {
    let icons = searchQuery ? searchIcons(searchQuery) : ICON_LIBRARY

    if (selectedCategory) {
      icons = icons.filter((icon) => icon.category === selectedCategory)
    }

    return icons
  }, [selectedCategory, searchQuery])

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handleSelectIcon = (icon: IconItem) => {
    onChange(icon.icon)
    setIsPickerOpen(false)
    setSearchQuery('')
    setCustomIconInput('')
  }

  const handleCustomIconSubmit = () => {
    if (customIconInput.trim()) {
      onChange(customIconInput.trim())
      setIsPickerOpen(false)
      setCustomIconInput('')
      setSearchQuery('')
    }
  }

  const handleCategoryClick = (categoryId: IconCategory) => {
    if (selectedCategory === categoryId) {
      setSelectedCategory(null)
    } else {
      setSelectedCategory(categoryId)
    }
  }

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div className="space-y-2">
      {/* Label */}
      <label className="block text-sm font-medium text-gray-300">{label}</label>

      {/* Selected Icon Display */}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setIsPickerOpen(!isPickerOpen)}
          className="flex flex-1 items-center justify-between rounded border border-gray-700 bg-gray-800 px-3 py-2 text-left text-sm transition-colors hover:border-blue-500 focus:border-blue-500 focus:outline-none"
        >
          {value ? (
            <span className="flex items-center gap-2">
              <span className="text-xl">{value}</span>
              <span className="text-gray-400">Selected</span>
            </span>
          ) : (
            <span className="text-gray-500">{placeholder}</span>
          )}
          <Smile className="h-4 w-4 text-gray-500" />
        </button>

        {value && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onChange('')}
            aria-label="Clear icon"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Icon Picker Modal */}
      {isPickerOpen && (
        <div className="rounded-lg border border-gray-700 bg-gray-850 shadow-lg">
          {/* Search Bar */}
          <div className="border-b border-gray-800 p-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search icons..."
                className="w-full rounded border border-gray-700 bg-gray-800 py-2 pl-10 pr-10 text-sm text-gray-100 placeholder-gray-500 focus:border-blue-500 focus:outline-none"
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

          {/* Category Filter */}
          <div className="border-b border-gray-800 p-3">
            <div className="flex flex-wrap gap-2">
              {ICON_CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => handleCategoryClick(cat.id)}
                  className={`
                    rounded-full px-3 py-1 text-xs font-medium transition-colors
                    ${
                      selectedCategory === cat.id
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-gray-200'
                    }
                  `}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Custom Icon Input */}
          {allowCustom && (
            <div className="border-b border-gray-800 p-3">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={customIconInput}
                  onChange={(e) => setCustomIconInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleCustomIconSubmit()
                    }
                  }}
                  placeholder="Or paste custom icon..."
                  className="flex-1 rounded border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-gray-100 placeholder-gray-500 focus:border-blue-500 focus:outline-none"
                />
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleCustomIconSubmit}
                  disabled={!customIconInput.trim()}
                >
                  Use
                </Button>
              </div>
              <p className="mt-1 text-xs text-gray-500">
                Paste any Unicode character or Nerd Font icon
              </p>
            </div>
          )}

          {/* Icon Grid */}
          <div className="max-h-96 overflow-y-auto p-3">
            {filteredIcons.length === 0 ? (
              <p className="py-8 text-center text-sm text-gray-500">
                No icons found
              </p>
            ) : (
              <div className="grid grid-cols-6 gap-2 sm:grid-cols-8 md:grid-cols-10">
                {filteredIcons.map((icon, index) => (
                  <button
                    key={`${icon.icon}-${index}`}
                    onClick={() => handleSelectIcon(icon)}
                    className="group relative flex h-12 w-12 items-center justify-center rounded border border-gray-700 bg-gray-800 text-2xl transition-all hover:border-blue-500 hover:bg-gray-700"
                    title={icon.name}
                  >
                    {icon.icon}
                    {/* Tooltip on hover */}
                    <span className="pointer-events-none absolute -top-8 left-1/2 z-10 -translate-x-1/2 whitespace-nowrap rounded bg-gray-950 px-2 py-1 text-xs text-gray-300 opacity-0 transition-opacity group-hover:opacity-100">
                      {icon.name}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between border-t border-gray-800 p-3">
            <p className="text-xs text-gray-500">
              {filteredIcons.length} icons
              {selectedCategory && ` in ${selectedCategory}`}
            </p>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsPickerOpen(false)}
            >
              Close
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
