// ============================================================================
// FORMAT VARIABLES - Available replacements for each module type
// ============================================================================

import type { ModuleType } from '../types/config'

// ============================================================================
// TYPES
// ============================================================================

export interface FormatVariable {
  name: string
  description: string
  example?: string
}

// ============================================================================
// FORMAT VARIABLES BY MODULE TYPE
// ============================================================================

/**
 * Format variables available for each module type
 * Reference: https://github.com/Alexays/Waybar/wiki/
 */
export const FORMAT_VARIABLES: Record<ModuleType, FormatVariable[]> = {
  // ============================================================================
  // SYSTEM MODULES
  // ============================================================================

  battery: [
    { name: 'capacity', description: 'Battery level (0-100)', example: '85' },
    { name: 'power', description: 'Power draw in watts', example: '12.5' },
    { name: 'time', description: 'Time remaining', example: '2:30' },
    { name: 'icon', description: 'Icon from format-icons', example: '' },
    { name: 'cycles', description: 'Charge cycles', example: '125' },
  ],

  cpu: [
    { name: 'usage', description: 'CPU usage percentage', example: '42' },
    { name: 'load', description: 'System load average', example: '1.5' },
    { name: 'avg_frequency', description: 'Average CPU frequency', example: '2.8' },
    { name: 'max_frequency', description: 'Maximum CPU frequency', example: '3.5' },
    { name: 'min_frequency', description: 'Minimum CPU frequency', example: '0.8' },
    { name: 'icon', description: 'Icon from format-icons', example: '󰻠' },
  ],

  memory: [
    { name: 'percentage', description: 'Used memory percentage', example: '65' },
    { name: 'used', description: 'Used memory', example: '8.2' },
    { name: 'total', description: 'Total memory', example: '16.0' },
    { name: 'avail', description: 'Available memory', example: '7.8' },
    { name: 'icon', description: 'Icon from format-icons', example: '󰍛' },
  ],

  disk: [
    { name: 'percentage_used', description: 'Disk usage percentage', example: '75' },
    { name: 'used', description: 'Used disk space', example: '450G' },
    { name: 'total', description: 'Total disk space', example: '1T' },
    { name: 'free', description: 'Free disk space', example: '550G' },
    { name: 'path', description: 'Mount path', example: '/' },
  ],

  temperature: [
    { name: 'temperature', description: 'Temperature in Celsius', example: '45' },
    { name: 'temperatureF', description: 'Temperature in Fahrenheit', example: '113' },
    { name: 'icon', description: 'Icon from format-icons', example: '' },
  ],

  network: [
    { name: 'ifname', description: 'Interface name', example: 'wlan0' },
    { name: 'essid', description: 'WiFi network name', example: 'MyWiFi' },
    { name: 'signalStrength', description: 'WiFi signal strength', example: '85' },
    { name: 'ipaddr', description: 'IP address', example: '192.168.1.100' },
    { name: 'bandwidthDownBits', description: 'Download speed (bits)', example: '50M' },
    { name: 'bandwidthUpBits', description: 'Upload speed (bits)', example: '10M' },
    { name: 'icon', description: 'Icon from format-icons', example: '󰖩' },
  ],

  load: [
    { name: 'load1', description: '1-minute load average', example: '1.5' },
    { name: 'load5', description: '5-minute load average', example: '1.2' },
    { name: 'load15', description: '15-minute load average', example: '1.0' },
  ],

  upower: [
    { name: 'percentage', description: 'Battery percentage', example: '85' },
    { name: 'state', description: 'Battery state', example: 'charging' },
    { name: 'time', description: 'Time to full/empty', example: '2:30' },
  ],

  // ============================================================================
  // HARDWARE MODULES
  // ============================================================================

  backlight: [
    { name: 'percent', description: 'Brightness percentage', example: '75' },
    { name: 'icon', description: 'Icon from format-icons', example: '󰃠' },
  ],

  pulseaudio: [
    { name: 'volume', description: 'Volume percentage', example: '65' },
    { name: 'format_source', description: 'Source (microphone) format' },
    { name: 'icon', description: 'Icon from format-icons', example: '󰕾' },
  ],

  bluetooth: [
    { name: 'status', description: 'Bluetooth status', example: 'on' },
    { name: 'num_connections', description: 'Number of connections', example: '2' },
    { name: 'controller', description: 'Controller name' },
    { name: 'icon', description: 'Icon from format-icons', example: '󰂯' },
  ],

  'keyboard-state': [
    { name: 'numlock', description: 'Numlock state', example: 'on' },
    { name: 'capslock', description: 'Capslock state', example: 'off' },
    { name: 'icon', description: 'Icon from format-icons' },
  ],

  // ============================================================================
  // WINDOW MANAGER MODULES
  // ============================================================================

  workspaces: [],

  'hyprland/workspaces': [],

  'hyprland/window': [
    { name: 'title', description: 'Window title', example: 'Firefox' },
    { name: 'class', description: 'Window class', example: 'firefox' },
  ],

  'hyprland/language': [
    { name: 'short', description: 'Short language code', example: 'en' },
    { name: 'long', description: 'Full language name', example: 'English (US)' },
  ],

  'hyprland/submap': [
    { name: 'name', description: 'Submap name', example: 'resize' },
  ],

  'sway/workspaces': [],

  'sway/window': [
    { name: 'title', description: 'Window title', example: 'Terminal' },
    { name: 'app_id', description: 'Application ID', example: 'org.gnome.Terminal' },
  ],

  'sway/mode': [
    { name: 'name', description: 'Mode name', example: 'resize' },
  ],

  'sway/language': [
    { name: 'short', description: 'Short language code', example: 'en' },
    { name: 'long', description: 'Full language name', example: 'English (US)' },
  ],

  'river/tags': [],

  'dwl/tags': [],

  taskbar: [
    { name: 'title', description: 'Window title' },
    { name: 'app_id', description: 'Application ID' },
    { name: 'state', description: 'Window state' },
  ],

  window: [
    { name: 'title', description: 'Window title' },
    { name: 'app_id', description: 'Application ID' },
  ],

  mode: [
    { name: 'name', description: 'Mode name' },
  ],

  language: [
    { name: 'short', description: 'Short language code' },
    { name: 'long', description: 'Full language name' },
  ],

  // ============================================================================
  // MEDIA MODULES
  // ============================================================================

  mpd: [
    { name: 'artist', description: 'Artist name', example: 'The Beatles' },
    { name: 'album', description: 'Album name', example: 'Abbey Road' },
    { name: 'title', description: 'Song title', example: 'Come Together' },
    { name: 'date', description: 'Release date', example: '1969' },
    { name: 'volume', description: 'Volume level', example: '75' },
    { name: 'elapsedTime', description: 'Elapsed time', example: '2:30' },
    { name: 'totalTime', description: 'Total duration', example: '4:20' },
    { name: 'songPosition', description: 'Current song position', example: '5' },
    { name: 'queueLength', description: 'Queue length', example: '12' },
    { name: 'stateIcon', description: 'Play/pause icon' },
  ],

  mpris: [
    { name: 'player', description: 'Player name', example: 'spotify' },
    { name: 'artist', description: 'Artist name' },
    { name: 'album', description: 'Album name' },
    { name: 'title', description: 'Song title' },
    { name: 'status', description: 'Playback status', example: 'Playing' },
    { name: 'position', description: 'Current position' },
    { name: 'length', description: 'Track length' },
  ],

  cava: [],

  // ============================================================================
  // UTILITY MODULES
  // ============================================================================

  clock: [
    { name: '%H', description: 'Hour (24h)', example: '14' },
    { name: '%I', description: 'Hour (12h)', example: '02' },
    { name: '%M', description: 'Minute', example: '30' },
    { name: '%S', description: 'Second', example: '45' },
    { name: '%p', description: 'AM/PM', example: 'PM' },
    { name: '%a', description: 'Weekday (short)', example: 'Mon' },
    { name: '%A', description: 'Weekday (full)', example: 'Monday' },
    { name: '%d', description: 'Day of month', example: '15' },
    { name: '%b', description: 'Month (short)', example: 'Jan' },
    { name: '%B', description: 'Month (full)', example: 'January' },
    { name: '%Y', description: 'Year', example: '2024' },
  ],

  tray: [],

  idle_inhibitor: [
    { name: 'status', description: 'Inhibitor status', example: 'activated' },
    { name: 'icon', description: 'Icon from format-icons' },
  ],

  user: [
    { name: 'user', description: 'Username', example: 'john' },
    { name: 'host', description: 'Hostname', example: 'laptop' },
    { name: 'work_d', description: 'Workdays', example: '5' },
    { name: 'work_H', description: 'Work hours', example: '40' },
  ],

  gamemode: [
    { name: 'count', description: 'Number of games', example: '1' },
  ],

  privacy: [
    { name: 'icon', description: 'Privacy icon' },
  ],

  'power-profiles-daemon': [
    { name: 'profile', description: 'Power profile', example: 'performance' },
    { name: 'icon', description: 'Icon from format-icons' },
  ],

  'systemd-failed-units': [
    { name: 'count', description: 'Failed units count', example: '2' },
  ],

  image: [],

  group: [],

  custom: [
    { name: 'text', description: 'Text from script output' },
    { name: 'tooltip', description: 'Tooltip from JSON output' },
    { name: 'class', description: 'CSS class from JSON output' },
    { name: 'percentage', description: 'Percentage from JSON output' },
  ],
}

/**
 * Get format variables for a specific module type
 */
export function getFormatVariables(moduleType: ModuleType): FormatVariable[] {
  return FORMAT_VARIABLES[moduleType] || []
}

/**
 * Get common format variables (available to all modules)
 */
export function getCommonFormatVariables(): FormatVariable[] {
  return [
    { name: 'icon', description: 'Icon from format-icons' },
  ]
}
