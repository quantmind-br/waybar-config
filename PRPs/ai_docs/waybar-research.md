# Waybar Configuration System Research

This document contains comprehensive information about Waybar's configuration format, modules, and styling.

**Source**: Research conducted on official Waybar GitHub wiki and man pages.

## Quick Reference

- **GitHub**: https://github.com/Alexays/Waybar
- **Wiki**: https://github.com/Alexays/Waybar/wiki
- **Module Docs**: https://github.com/Alexays/Waybar/wiki/Module:-{ModuleName}

## Critical Points for GUI Implementation

### 1. Config Format: JSONC (JSON with Comments)

**CRITICAL**: Waybar uses JSONC, not standard JSON.

```jsonc
{
  // This is a valid comment
  "position": "top",
  /* Block comment */
  "modules-left": ["clock"]
}
```

**Parsing**: Must strip comments before JSON.parse() or use JSONC parser.

### 2. Config File Locations (Priority Order)

1. `$XDG_CONFIG_HOME/waybar/config` or `~/.config/waybar/config`
2. `$XDG_CONFIG_HOME/waybar/config.jsonc` or `~/.config/waybar/config.jsonc`
3. `~/waybar/config`
4. `/etc/xdg/waybar/config`

### 3. Module ID Naming with # Suffix

**Pattern**: `"module-type#custom-name"`

```jsonc
{
  "modules-right": ["battery#bat0", "battery#bat1"],

  "battery#bat0": {
    "bat": "BAT0",
    "format": "BAT0: {capacity}%"
  },
  "battery#bat1": {
    "bat": "BAT1",
    "format": "BAT1: {capacity}%"
  }
}
```

**CSS Selector**: `#battery.bat0`, `#battery.bat1`

### 4. Battery States Are REVERSED

**CRITICAL GOTCHA**: Battery module activates states when value ≤ threshold.

```jsonc
{
  "battery": {
    "states": {
      "warning": 30,   // Triggers at 30% or BELOW
      "critical": 15   // Triggers at 15% or BELOW
    }
  }
}
```

**Other modules**: Trigger at threshold or ABOVE.

### 5. Top-Level Configuration Structure

```jsonc
{
  // Bar Appearance
  "layer": "top",              // "top" | "bottom"
  "position": "top",           // "top" | "bottom" | "left" | "right"
  "height": 30,
  "spacing": 4,
  "margin": "5 10",

  // Module Layout
  "modules-left": ["sway/workspaces"],
  "modules-center": ["clock"],
  "modules-right": ["battery", "network"],

  // Module Configurations
  "clock": {
    "format": "{:%H:%M}"
  }
}
```

### 6. Reload Signal

```bash
# Reload configuration
pkill -SIGUSR2 waybar

# Toggle visibility
pkill -SIGUSR1 waybar
```

### 7. CSS Selector Hierarchy

```css
/* Main bar */
window#waybar { }

/* By position */
window#waybar.top { }
window#waybar.bottom { }

/* By custom name */
window#waybar.bar-1 { }

/* Module by ID */
#battery { }

/* Module with state */
#battery.charging { }
#battery.warning { }

/* Workspaces */
#workspaces button { }
#workspaces button.active { }
```

## Core Modules Quick Reference

### Battery
- Fields: `bat`, `adapter`, `interval`, `format`, `format-icons`, `states`
- Replacements: `{capacity}`, `{power}`, `{time}`, `{icon}`
- States: `charging`, `plugged`, `full`, `warning`, `critical`

### Clock
- Fields: `interval`, `format`, `timezone`, `calendar`
- Format: Uses strftime codes `{:%H:%M}`
- Calendar: Complex nested object with month/year views

### CPU
- Fields: `interval`, `format`, `states`
- Replacements: `{usage}`, `{load}`, `{avg_frequency}`

### Memory
- Fields: `interval`, `format`
- Replacements: `{percentage}`, `{used}`, `{total}`, `{avail}`

### Network
- Fields: `interface`, `format-wifi`, `format-ethernet`
- Replacements: `{ifname}`, `{essid}`, `{signalStrength}`, `{ipaddr}`

### Custom Module
- Fields: `exec`, `interval`, `return-type`, `format`
- Return types: `text` (default) or `json`
- JSON format: `{"text": "...", "tooltip": "...", "class": "..."}`

## All 50+ Module Types

```typescript
type ModuleType =
  // System
  | 'battery' | 'cpu' | 'memory' | 'disk' | 'temperature'
  | 'network' | 'load' | 'upower'
  // Hardware
  | 'backlight' | 'pulseaudio' | 'bluetooth' | 'keyboard-state'
  // WM - Hyprland
  | 'hyprland/workspaces' | 'hyprland/window' | 'hyprland/language'
  | 'hyprland/submap' | 'hyprland/windowcount'
  // WM - Sway
  | 'sway/workspaces' | 'sway/window' | 'sway/mode' | 'sway/language'
  // WM - Other
  | 'river/tags' | 'dwl/tags' | 'niri/workspaces'
  | 'workspaces' | 'taskbar'
  // Media
  | 'mpd' | 'mpris' | 'cava'
  // Utilities
  | 'clock' | 'tray' | 'idle_inhibitor' | 'user'
  | 'gamemode' | 'privacy' | 'power-profiles-daemon'
  | 'systemd-failed-units' | 'image' | 'group' | 'custom'
```
