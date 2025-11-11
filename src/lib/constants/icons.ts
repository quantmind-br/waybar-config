// ============================================================================
// ICON LIBRARY - Common icons for Waybar modules
// ============================================================================

// ============================================================================
// TYPES
// ============================================================================

export interface IconItem {
  icon: string
  name: string
  category: IconCategory
  keywords?: string[]
}

export type IconCategory =
  | 'battery'
  | 'network'
  | 'audio'
  | 'brightness'
  | 'system'
  | 'media'
  | 'misc'
  | 'emoji'

// ============================================================================
// ICON LIBRARY
// ============================================================================

/**
 * Common icons used in Waybar configurations
 * Includes Nerd Fonts icons and Unicode symbols
 *
 * Nerd Fonts reference: https://www.nerdfonts.com/cheat-sheet
 */
export const ICON_LIBRARY: IconItem[] = [
  // ============================================================================
  // BATTERY ICONS
  // ============================================================================

  { icon: '󰂄', name: 'Battery Full', category: 'battery', keywords: ['full', '100'] },
  { icon: '󰂃', name: 'Battery 90%', category: 'battery', keywords: ['high', '90'] },
  { icon: '󰂂', name: 'Battery 80%', category: 'battery', keywords: ['high', '80'] },
  { icon: '󰂁', name: 'Battery 70%', category: 'battery', keywords: ['medium', '70'] },
  { icon: '󰂀', name: 'Battery 60%', category: 'battery', keywords: ['medium', '60'] },
  { icon: '󰁿', name: 'Battery 50%', category: 'battery', keywords: ['medium', '50'] },
  { icon: '󰁾', name: 'Battery 40%', category: 'battery', keywords: ['low', '40'] },
  { icon: '󰁽', name: 'Battery 30%', category: 'battery', keywords: ['low', '30'] },
  { icon: '󰁼', name: 'Battery 20%', category: 'battery', keywords: ['warning', '20'] },
  { icon: '󰁻', name: 'Battery 10%', category: 'battery', keywords: ['critical', '10'] },
  { icon: '󰂎', name: 'Battery Charging', category: 'battery', keywords: ['charge', 'plugged'] },
  { icon: '󰢟', name: 'Battery Charging Full', category: 'battery', keywords: ['charge', 'full'] },

  // ============================================================================
  // NETWORK ICONS
  // ============================================================================

  { icon: '󰖩', name: 'WiFi Full', category: 'network', keywords: ['wifi', 'wireless', 'strong'] },
  { icon: '󰖨', name: 'WiFi Good', category: 'network', keywords: ['wifi', 'wireless', 'medium'] },
  { icon: '󰖧', name: 'WiFi Weak', category: 'network', keywords: ['wifi', 'wireless', 'low'] },
  { icon: '󰖪', name: 'WiFi Off', category: 'network', keywords: ['wifi', 'disabled', 'off'] },
  { icon: '󰌗', name: 'Ethernet', category: 'network', keywords: ['wired', 'lan'] },
  { icon: '󰌘', name: 'Network', category: 'network', keywords: ['internet', 'connected'] },
  { icon: '󰖣', name: 'Network Offline', category: 'network', keywords: ['disconnected', 'no internet'] },

  // ============================================================================
  // AUDIO ICONS
  // ============================================================================

  { icon: '󰕾', name: 'Volume High', category: 'audio', keywords: ['sound', 'speaker', 'loud'] },
  { icon: '󰖀', name: 'Volume Medium', category: 'audio', keywords: ['sound', 'speaker'] },
  { icon: '󰕿', name: 'Volume Low', category: 'audio', keywords: ['sound', 'speaker', 'quiet'] },
  { icon: '󰝟', name: 'Volume Muted', category: 'audio', keywords: ['mute', 'silent'] },
  { icon: '󰍬', name: 'Microphone', category: 'audio', keywords: ['mic', 'input'] },
  { icon: '󰍭', name: 'Microphone Muted', category: 'audio', keywords: ['mic off', 'muted'] },
  { icon: '󰋋', name: 'Headphones', category: 'audio', keywords: ['headset', 'audio'] },
  { icon: '󰓃', name: 'Bluetooth Audio', category: 'audio', keywords: ['bluetooth', 'wireless'] },

  // ============================================================================
  // BRIGHTNESS ICONS
  // ============================================================================

  { icon: '󰃠', name: 'Brightness High', category: 'brightness', keywords: ['screen', 'display', 'bright'] },
  { icon: '󰃟', name: 'Brightness Medium', category: 'brightness', keywords: ['screen', 'display'] },
  { icon: '󰃞', name: 'Brightness Low', category: 'brightness', keywords: ['screen', 'display', 'dim'] },

  // ============================================================================
  // SYSTEM ICONS
  // ============================================================================

  { icon: '󰻠', name: 'CPU', category: 'system', keywords: ['processor', 'performance'] },
  { icon: '󰍛', name: 'Memory', category: 'system', keywords: ['ram', 'usage'] },
  { icon: '󰋊', name: 'Disk', category: 'system', keywords: ['storage', 'hdd', 'ssd'] },
  { icon: '󰔏', name: 'Temperature', category: 'system', keywords: ['heat', 'thermal'] },
  { icon: '󰇄', name: 'Keyboard', category: 'system', keywords: ['input', 'typing'] },
  { icon: '󰍽', name: 'Clock', category: 'system', keywords: ['time', 'watch'] },
  { icon: '󰃰', name: 'Calendar', category: 'system', keywords: ['date', 'schedule'] },

  // ============================================================================
  // MEDIA ICONS
  // ============================================================================

  { icon: '󰐊', name: 'Play', category: 'media', keywords: ['start', 'resume'] },
  { icon: '󰏤', name: 'Pause', category: 'media', keywords: ['stop', 'wait'] },
  { icon: '󰓛', name: 'Previous', category: 'media', keywords: ['back', 'rewind'] },
  { icon: '󰓜', name: 'Next', category: 'media', keywords: ['forward', 'skip'] },
  { icon: '󰝚', name: 'Music', category: 'media', keywords: ['song', 'audio', 'note'] },

  // ============================================================================
  // MISC ICONS
  // ============================================================================

  { icon: '󰌾', name: 'Settings', category: 'misc', keywords: ['config', 'gear', 'options'] },
  { icon: '󰍉', name: 'Power', category: 'misc', keywords: ['shutdown', 'off'] },
  { icon: '󰐥', name: 'Lock', category: 'misc', keywords: ['secure', 'privacy'] },
  { icon: '󰚥', name: 'Notification', category: 'misc', keywords: ['bell', 'alert'] },
  { icon: '󰈸', name: 'User', category: 'misc', keywords: ['person', 'account'] },
  { icon: '󰚌', name: 'Workspace', category: 'misc', keywords: ['desktop', 'window'] },

  // ============================================================================
  // EMOJI (Fallback/Simple icons)
  // ============================================================================

  { icon: '🔋', name: 'Battery Emoji', category: 'emoji', keywords: ['battery'] },
  { icon: '🔌', name: 'Plug Emoji', category: 'emoji', keywords: ['power', 'charger'] },
  { icon: '📡', name: 'Antenna Emoji', category: 'emoji', keywords: ['signal', 'wifi'] },
  { icon: '🔊', name: 'Speaker Emoji', category: 'emoji', keywords: ['volume', 'sound'] },
  { icon: '🔇', name: 'Muted Emoji', category: 'emoji', keywords: ['silent', 'mute'] },
  { icon: '☀️', name: 'Sun Emoji', category: 'emoji', keywords: ['brightness', 'day'] },
  { icon: '🌙', name: 'Moon Emoji', category: 'emoji', keywords: ['night', 'dark'] },
  { icon: '⏰', name: 'Clock Emoji', category: 'emoji', keywords: ['time', 'alarm'] },
  { icon: '📅', name: 'Calendar Emoji', category: 'emoji', keywords: ['date'] },
  { icon: '🎵', name: 'Music Emoji', category: 'emoji', keywords: ['note', 'audio'] },
  { icon: '▶️', name: 'Play Emoji', category: 'emoji', keywords: ['start'] },
  { icon: '⏸️', name: 'Pause Emoji', category: 'emoji', keywords: ['stop'] },
  { icon: '🖥️', name: 'Monitor Emoji', category: 'emoji', keywords: ['screen', 'display'] },
  { icon: '💾', name: 'Disk Emoji', category: 'emoji', keywords: ['storage', 'save'] },
  { icon: '🌡️', name: 'Thermometer Emoji', category: 'emoji', keywords: ['temperature'] },
]

// ============================================================================
// CATEGORY LABELS
// ============================================================================

export const ICON_CATEGORIES: Array<{
  id: IconCategory
  label: string
}> = [
  { id: 'battery', label: 'Battery' },
  { id: 'network', label: 'Network' },
  { id: 'audio', label: 'Audio' },
  { id: 'brightness', label: 'Brightness' },
  { id: 'system', label: 'System' },
  { id: 'media', label: 'Media' },
  { id: 'misc', label: 'Misc' },
  { id: 'emoji', label: 'Emoji' },
]

// ============================================================================
// HELPERS
// ============================================================================

/**
 * Get icons by category
 */
export function getIconsByCategory(category: IconCategory): IconItem[] {
  return ICON_LIBRARY.filter((icon) => icon.category === category)
}

/**
 * Search icons by keyword
 */
export function searchIcons(query: string): IconItem[] {
  if (!query.trim()) return ICON_LIBRARY

  const lowerQuery = query.toLowerCase()
  return ICON_LIBRARY.filter(
    (icon) =>
      icon.name.toLowerCase().includes(lowerQuery) ||
      icon.keywords?.some((keyword) => keyword.toLowerCase().includes(lowerQuery))
  )
}
