name: "Waybar GUI Configuration Tool - BASE PRP v1"
description: |
  Foundation PRP for building a complete GUI application to configure and customize Waybar,
  eliminating manual JSON/CSS editing through visual configuration and real-time preview.

---

## Goal

**Feature Goal**: Create a production-ready desktop application that allows users to visually configure Waybar (Wayland status bar) without manually editing JSON configuration files or CSS stylesheets. The application will provide drag-and-drop module arrangement, visual CSS editing, real-time preview, and comprehensive validation.

**Deliverable**:
- Tauri desktop application (cross-platform: Linux distros)
- React + TypeScript frontend with modern UI
- Rust backend for secure file system access
- Working prototype demonstrating core features:
  - Load/save Waybar configurations
  - Visual module editor with drag-and-drop
  - Basic CSS visual editor
  - Configuration validation

**Success Definition**:
- Users can create a complete Waybar configuration without touching JSON/CSS files
- Configuration changes are validated in real-time
- Configurations can be saved and applied to Waybar
- Application follows Waybar's official configuration specification
- Zero data loss - backup configs before modification

## User Persona

**Target User**: Linux power users running Wayland compositors (Hyprland, Sway, River, etc.) who want to customize their status bar without learning JSON/CSS syntax.

**Use Case**:
- User wants to add battery and network modules to their Waybar
- User wants to change colors and styling without writing CSS
- User wants to preview changes before applying them
- User wants to manage multiple bar configurations (work, gaming, minimal)

**User Journey**:
1. Launch Waybar GUI Config app
2. App detects existing Waybar config or offers templates
3. User drags modules from palette to bar zones (left/center/right)
4. User clicks module to configure parameters (update interval, format strings, etc.)
5. User adjusts styling using visual color pickers and spacing controls
6. User previews changes in real-time
7. User saves configuration and reloads Waybar

**Pain Points Addressed**:
- Eliminates need to memorize JSON syntax and structure
- Removes manual CSS writing for simple styling changes
- Provides immediate validation feedback instead of trial-and-error
- Prevents breaking configurations with syntax errors
- Offers templates and presets for quick setup

## Why

- **User Impact**: Waybar configuration currently requires manual JSON editing, which is error-prone and time-consuming. This tool makes Waybar accessible to users who aren't comfortable with configuration files.

- **Integration**: Works alongside existing Waybar installation, respects existing configs, provides migration path for manual configs.

- **Problems Solved**:
  - JSON syntax errors that break Waybar
  - CSS styling confusion (selectors, properties, specificity)
  - Module parameter discovery (what options are available?)
  - Configuration validation (are these values valid?)
  - Multi-bar management complexity
  - State-based styling setup (battery warning, critical states)

## What

### Core Features

1. **Configuration Management**
   - Load existing `~/.config/waybar/config` and `style.css`
   - Create new configurations from scratch or templates
   - Save configurations with automatic backup
   - Import/export configurations as archives

2. **Visual Module Editor**
   - Drag-and-drop modules from palette to bar zones
   - Reorder modules within zones
   - Configure module parameters through forms
   - Delete and disable modules
   - Duplicate modules with custom names (#battery#bat0, #battery#bat1)

3. **Module Configuration Forms**
   - Type-safe forms for each module type (50+ modules)
   - Format string builder with variable suggestions
   - Icon picker for format-icons
   - Command builder for interactive actions (on-click, on-scroll-up, etc.)
   - State threshold configuration (warning, critical states)

4. **CSS Visual Editor**
   - Color pickers for backgrounds, borders, text
   - Spacing controls (margin, padding)
   - Border and shadow configurators
   - Typography controls (font-family, size, weight)
   - Live preview of CSS changes

5. **Validation System**
   - Real-time JSON validation with Zod schemas
   - Module parameter validation (check allowed values)
   - CSS syntax validation
   - Conflict detection (duplicate module IDs)
   - Dependency checking (module requirements)

6. **Preview System** (Future Enhancement)
   - Mock preview of Waybar appearance
   - State simulation (battery levels, network status)
   - Responsive preview for different bar sizes

### Success Criteria

- [ ] Application successfully loads valid Waybar configs from `~/.config/waybar/`
- [ ] User can add, remove, and reorder modules via drag-and-drop
- [ ] Module configuration forms are generated for at least 10 core modules (clock, battery, cpu, memory, network, pulseaudio, workspaces, window, tray, custom)
- [ ] Configuration changes are validated in real-time with clear error messages
- [ ] User can save configuration and it successfully loads in Waybar
- [ ] Backups are created automatically before modifying existing configs
- [ ] CSS visual editor can modify basic properties (colors, spacing, borders)
- [ ] Application detects Wayland compositor and shows compatible modules

## All Needed Context

### Context Completeness Check

✅ **Validation**: This PRP provides complete context for implementing the foundation of the Waybar GUI Config tool, including:
- Complete technology stack with specific libraries and versions
- Comprehensive Waybar configuration reference (JSON structure, all 50+ modules, CSS selectors)
- Detailed implementation patterns for all major frameworks (Tauri, React, Zustand, Monaco, dnd-kit, Zod)
- File structure, data models, and architectural patterns
- Specific gotchas and best practices from research

### Documentation & References

```yaml
# CRITICAL READING - Core Technologies

- url: https://v2.tauri.app/start/
  why: Official Tauri 2.0 getting started guide - project setup, IPC patterns, file system access
  critical: |
    - Tauri 2.0 uses capabilities/permissions system (NOT allowlist)
    - Must configure file system permissions in src-tauri/capabilities/default.json
    - Use $APPCONFIG variable for config directory access
    - Commands must return Result<T, String> for error handling

- url: https://github.com/Alexays/Waybar/wiki
  why: Complete Waybar configuration reference with all modules and parameters
  critical: |
    - Config uses JSONC format (JSON with comments)
    - Module instances need unique IDs with # suffix (battery#bat0)
    - States in battery module trigger ≤ threshold (opposite of other modules)
    - CSS selectors use #module-name for IDs, .class for classes

- url: https://zustand.docs.pmnd.rs/
  why: Zustand state management patterns for complex configuration state
  critical: |
    - Always use selectors to prevent unnecessary re-renders
    - Use Immer middleware for nested state updates (reduces code by 70%)
    - Separate actions from state to avoid re-subscriptions
    - Use Zundo library for undo/redo implementation

- url: https://dndkit.com/
  why: dnd-kit drag-and-drop for module arrangement
  critical: |
    - Use @dnd-kit/sortable for list reordering
    - Use DragOverlay for smooth visual feedback
    - Implement multi-container pattern for palette → configured zones
    - Always provide keyboard accessibility (built-in)

- url: https://zod.dev/
  why: Zod validation for configuration schemas
  critical: |
    - Use z.discriminatedUnion for module type variants
    - Use .safeParse() instead of .parse() for better error handling
    - Use .superRefine() for cross-field validation
    - Type inference with z.infer<typeof schema> eliminates duplicate types

# MUST READ - Implementation Patterns

- file: PRPs/ai_docs/tauri-research.md
  why: Complete Tauri + React integration patterns, file system access, error handling
  pattern: |
    - Tauri command structure with #[tauri::command]
    - Error handling with custom error types
    - State management in Rust with State<AppState>
    - Web workers configuration for language services

- file: PRPs/ai_docs/waybar-research.md
  why: Complete Waybar configuration specification with all modules and CSS selectors
  pattern: |
    - JSONC configuration structure
    - Module configuration patterns for each type
    - CSS selector hierarchy and state classes
    - Signal handling for reload (SIGUSR2)

- file: PRPs/ai_docs/zustand-research.md
  why: State management patterns for configuration editors
  pattern: |
    - Hierarchical config management with Immer
    - Undo/redo implementation with Zundo
    - Performance optimization with selective subscriptions
    - Persist middleware for saving state

- file: PRPs/ai_docs/monaco-research.md
  why: Monaco Editor integration for JSON/CSS editing with validation
  pattern: |
    - JSON schema validation setup
    - Custom completion providers
    - Error marker API for validation feedback
    - Web workers for language services

- file: PRPs/ai_docs/dndkit-research.md
  why: Drag-and-drop patterns for module arrangement
  pattern: |
    - Multi-container drag between palette and configured zones
    - SortableContext with vertical/horizontal strategies
    - Visual feedback with DragOverlay
    - Accessibility with keyboard navigation

- file: PRPs/ai_docs/zod-research.md
  why: Schema validation patterns for complex configurations
  pattern: |
    - Nested object validation
    - Discriminated unions for module variants
    - Custom cross-field validation with superRefine
    - Error formatting for user-friendly messages
```

### Current Codebase Structure

```bash
waybar-config/
├── .claude/
│   └── commands/
├── PRPs/
│   ├── README.md
│   ├── templates/
│   │   └── prp_base.md
│   └── ai_docs/
│       ├── tauri-research.md
│       ├── waybar-research.md
│       ├── zustand-research.md
│       ├── monaco-research.md
│       ├── dndkit-research.md
│       └── zod-research.md
├── PLANO_DETALHADO.md
└── (empty - ready for implementation)
```

### Desired Codebase Structure

```bash
waybar-config/
├── src-tauri/                           # Rust backend
│   ├── Cargo.toml                      # Rust dependencies
│   ├── tauri.conf.json                 # Tauri configuration
│   ├── capabilities/
│   │   └── default.json                # File system permissions
│   ├── icons/                          # App icons (various sizes)
│   └── src/
│       ├── main.rs                     # Entry point, command registration
│       ├── lib.rs                      # Shared library code
│       ├── config/
│       │   ├── mod.rs                  # Config module exports
│       │   ├── parser.rs               # JSON/JSONC parser
│       │   ├── validator.rs            # Rust-side validation
│       │   └── writer.rs               # Config file writer
│       ├── css/
│       │   ├── mod.rs                  # CSS module exports
│       │   ├── parser.rs               # CSS parser
│       │   └── generator.rs            # CSS generator from visual settings
│       ├── waybar/
│       │   ├── mod.rs                  # Waybar module exports
│       │   ├── process.rs              # Start/stop/reload Waybar
│       │   └── detector.rs             # Detect compositor, config location
│       ├── system/
│       │   ├── mod.rs                  # System module exports
│       │   ├── compositor.rs           # Detect Wayland compositor
│       │   └── backup.rs               # Backup management
│       ├── commands.rs                 # Tauri command definitions
│       └── error.rs                    # Custom error types
│
├── src/                                # React frontend
│   ├── App.tsx                         # Main app component
│   ├── main.tsx                        # React entry point
│   ├── vite-env.d.ts                   # Vite type declarations
│   │
│   ├── components/
│   │   ├── layout/
│   │   │   ├── MainLayout.tsx          # App shell layout
│   │   │   ├── Sidebar.tsx             # Left sidebar navigation
│   │   │   ├── EditorPanel.tsx         # Main editor area
│   │   │   └── StatusBar.tsx           # Bottom status bar
│   │   │
│   │   ├── bars/
│   │   │   ├── BarList.tsx             # List of configured bars
│   │   │   ├── BarCard.tsx             # Single bar card with actions
│   │   │   ├── BarEditor.tsx           # Main bar editor container
│   │   │   └── BarSettings.tsx         # Bar-level settings form
│   │   │
│   │   ├── modules/
│   │   │   ├── ModulePalette.tsx       # Draggable module library
│   │   │   ├── ModuleZone.tsx          # Drop zone (left/center/right)
│   │   │   ├── ModuleCard.tsx          # Single module card
│   │   │   ├── ModuleEditor.tsx        # Module configuration modal
│   │   │   └── editors/                # Module-specific editors
│   │   │       ├── BatteryEditor.tsx
│   │   │       ├── ClockEditor.tsx
│   │   │       ├── CPUEditor.tsx
│   │   │       ├── NetworkEditor.tsx
│   │   │       ├── WorkspacesEditor.tsx
│   │   │       └── CustomEditor.tsx
│   │   │
│   │   ├── styles/
│   │   │   ├── StyleEditor.tsx         # Style editor container
│   │   │   ├── VisualEditor.tsx        # Visual CSS controls
│   │   │   ├── CodeEditor.tsx          # Monaco editor wrapper
│   │   │   └── PropertyControls.tsx    # Individual CSS property inputs
│   │   │
│   │   ├── common/
│   │   │   ├── ColorPicker.tsx         # Color picker component
│   │   │   ├── IconPicker.tsx          # Icon selection component
│   │   │   ├── FormatBuilder.tsx       # Format string builder
│   │   │   ├── CommandInput.tsx        # Command input with validation
│   │   │   ├── ValidationMessage.tsx   # Error display component
│   │   │   ├── Button.tsx              # Base button component
│   │   │   ├── Input.tsx               # Base input component
│   │   │   ├── Select.tsx              # Base select component
│   │   │   └── Toggle.tsx              # Toggle switch component
│   │   │
│   │   └── dialogs/
│   │       ├── ImportDialog.tsx        # Import config dialog
│   │       ├── ExportDialog.tsx        # Export config dialog
│   │       ├── TemplateDialog.tsx      # Template selection dialog
│   │       └── SettingsDialog.tsx      # App settings dialog
│   │
│   ├── lib/
│   │   ├── schemas/                    # Zod validation schemas
│   │   │   ├── index.ts                # Schema exports
│   │   │   ├── bar-config.ts           # Bar configuration schema
│   │   │   ├── modules.ts              # Module schemas (50+ modules)
│   │   │   ├── css.ts                  # CSS property schemas
│   │   │   └── helpers.ts              # Schema helper functions
│   │   │
│   │   ├── types/                      # TypeScript type definitions
│   │   │   ├── config.ts               # Config type definitions
│   │   │   ├── modules.ts              # Module type definitions
│   │   │   ├── css.ts                  # CSS type definitions
│   │   │   └── app.ts                  # App state types
│   │   │
│   │   ├── constants/
│   │   │   ├── modules.ts              # Module metadata (names, categories, icons)
│   │   │   ├── css-properties.ts       # CSS property definitions
│   │   │   ├── templates.ts            # Configuration templates
│   │   │   └── icons.ts                # Icon library
│   │   │
│   │   ├── utils/
│   │   │   ├── validation.ts           # Validation utilities
│   │   │   ├── formatting.ts           # String formatting utilities
│   │   │   ├── css-parser.ts           # CSS parsing utilities
│   │   │   └── deep-merge.ts           # Deep object merging
│   │   │
│   │   ├── hooks/
│   │   │   ├── useConfig.ts            # Config store hook
│   │   │   ├── useModules.ts           # Module management hook
│   │   │   ├── useStyles.ts            # Style management hook
│   │   │   ├── useWaybar.ts            # Waybar control hook
│   │   │   └── useValidation.ts        # Validation hook
│   │   │
│   │   └── tauri/
│   │       ├── commands.ts             # Typed Tauri command wrappers
│   │       └── events.ts               # Tauri event handlers
│   │
│   ├── store/                          # Zustand state management
│   │   ├── index.ts                    # Store exports
│   │   ├── config-store.ts             # Configuration state
│   │   ├── ui-store.ts                 # UI state (modals, selected items)
│   │   ├── validation-store.ts         # Validation errors state
│   │   └── history-store.ts            # Undo/redo state (Zundo)
│   │
│   └── styles/
│       ├── globals.css                 # Global styles
│       └── tailwind.css                # Tailwind imports
│
├── public/
│   ├── icons/                          # Module icons
│   └── templates/                      # Config templates
│
├── package.json                        # Node dependencies
├── tsconfig.json                       # TypeScript config
├── tailwind.config.js                  # Tailwind config
├── vite.config.ts                      # Vite config
├── postcss.config.js                   # PostCSS config
└── README.md                           # Project documentation
```

### Known Gotchas & Library Quirks

```typescript
// CRITICAL: Tauri 2.0 Permissions System
// Must explicitly enable file system access in capabilities/default.json
// Example capabilities/default.json:
{
  "$schema": "../gen/schemas/desktop-schema.json",
  "identifier": "default",
  "description": "Capability for main window",
  "windows": ["main"],
  "permissions": [
    "core:default",
    "fs:default",
    "fs:allow-read-text-file",
    "fs:allow-write-text-file",
    "fs:allow-read-dir",
    "fs:allow-exists",
    {
      "identifier": "fs:scope-app-config",
      "allow": ["$APPCONFIG/**", "$HOME/.config/waybar/**"],
      "deny": []
    }
  ]
}

// GOTCHA: Waybar battery states are REVERSED from other modules
// Battery activates states when value ≤ threshold
// Example: "warning": 30 triggers at 30% or BELOW
// Other modules trigger at threshold or ABOVE

// GOTCHA: Waybar config uses JSONC (JSON with Comments)
// Standard JSON.parse() will FAIL on comments
// Must strip comments before parsing or use JSONC parser

// GOTCHA: Zustand re-renders - always use selectors
// ❌ BAD: const { theme, colors } = useConfigStore()
// ✅ GOOD: const theme = useConfigStore(state => state.config.theme)

// GOTCHA: Monaco Editor requires web workers configuration
// Must configure workers in vite.config.ts for language services
// JSON/CSS intellisense won't work without proper worker setup

// GOTCHA: dnd-kit collision detection
// Use closestCenter for lists, closestCorners for grids
// Incorrect collision detection causes janky drag behavior

// GOTCHA: Zod .parse() vs .safeParse()
// .parse() throws errors (crashes app if unhandled)
// .safeParse() returns discriminated union (safe for user input)

// GOTCHA: Tauri commands MUST return Result<T, String>
// Returning plain types will cause compilation errors
// Use .map_err(|e| e.to_string()) to convert error types

// CRITICAL: Module IDs with # must be unique
// "battery#bat0" and "battery#bat1" are different modules
// CSS selector becomes #battery.bat0 and #battery.bat1

// GOTCHA: React 18+ automatic batching
// Multiple state updates are automatically batched
// For React <18, use unstable_batchedUpdates

// GOTCHA: Immer middleware syntax change
// Old: create<State>(immer((set) => ...))
// New: create<State>()(immer((set) => ...))  // Note extra ()

// PERFORMANCE: Large config files
// Debounce validation to 300ms to prevent lag
// Use shallow comparison for array/object selectors
// Disable Monaco minimap for large files
```

## Implementation Blueprint

### Data Models and Structure

```typescript
// ============================================================================
// CORE TYPE DEFINITIONS
// ============================================================================

// src/lib/types/config.ts
export interface WaybarConfig {
  bars: BarDefinition[]
  styles: StyleDefinition[]
  metadata: ConfigMetadata
}

export interface BarDefinition {
  id: string
  name?: string
  enabled: boolean
  order: number
  config: BarConfig
  modules: ModuleInstance[]
}

export interface BarConfig {
  // Positioning
  layer?: 'top' | 'bottom'
  position?: 'top' | 'bottom' | 'left' | 'right'
  output?: string | string[]

  // Dimensions
  height?: number
  width?: number

  // Spacing
  margin?: string
  'margin-top'?: number
  'margin-bottom'?: number
  'margin-left'?: number
  'margin-right'?: number
  spacing?: number

  // Behavior
  mode?: 'dock' | 'hide' | 'invisible' | 'overlay'
  exclusive?: boolean
  passthrough?: boolean
  'gtk-layer-shell'?: boolean
  ipc?: boolean

  // Customization
  name?: string
  'reload_style_on_change'?: boolean

  // Module layout (automatically generated from ModuleInstance[])
  'modules-left'?: string[]
  'modules-center'?: string[]
  'modules-right'?: string[]
}

export interface ModuleInstance {
  id: string // UUID for internal tracking
  type: ModuleType
  customName?: string // For #battery#bat0 naming
  position: 'left' | 'center' | 'right'
  order: number
  config: ModuleConfig
  enabled: boolean
}

export type ModuleType =
  // System
  | 'battery' | 'cpu' | 'memory' | 'disk' | 'temperature'
  | 'network' | 'load' | 'upower'
  // Hardware
  | 'backlight' | 'pulseaudio' | 'bluetooth' | 'keyboard-state'
  // Window Manager
  | 'workspaces' | 'taskbar' | 'window' | 'mode' | 'language'
  | 'hyprland/workspaces' | 'hyprland/window' | 'hyprland/language'
  | 'hyprland/submap' | 'sway/workspaces' | 'sway/window'
  | 'sway/mode' | 'sway/language' | 'river/tags' | 'dwl/tags'
  // Media
  | 'mpd' | 'mpris' | 'cava'
  // Utilities
  | 'clock' | 'tray' | 'idle_inhibitor' | 'user' | 'gamemode'
  | 'privacy' | 'power-profiles-daemon' | 'systemd-failed-units'
  | 'image' | 'group' | 'custom'

export interface ModuleConfig {
  // Common to all modules
  format?: string
  'format-icons'?: string[] | Record<string, string>
  'max-length'?: number
  rotate?: number
  tooltip?: boolean
  'tooltip-format'?: string

  // Interactive actions
  'on-click'?: string
  'on-click-middle'?: string
  'on-click-right'?: string
  'on-scroll-up'?: string
  'on-scroll-down'?: string

  // States
  states?: Record<string, number>

  // Module-specific config (use discriminated union or Record<string, any>)
  [key: string]: any
}

export interface StyleDefinition {
  id: string
  name: string
  selector: string
  properties: CSSProperty[]
  enabled: boolean
}

export interface CSSProperty {
  property: string
  value: string
  important: boolean
}

export interface ConfigMetadata {
  version: string
  createdAt: string
  modifiedAt: string
  appVersion: string
}

// ============================================================================
// ZOD VALIDATION SCHEMAS
// ============================================================================

// src/lib/schemas/bar-config.ts
import { z } from 'zod'

export const InteractiveActionsSchema = z.object({
  'on-click': z.string().optional(),
  'on-click-release': z.string().optional(),
  'on-double-click': z.string().optional(),
  'on-triple-click': z.string().optional(),
  'on-click-middle': z.string().optional(),
  'on-click-right': z.string().optional(),
  'on-scroll-up': z.string().optional(),
  'on-scroll-down': z.string().optional(),
  'on-update': z.string().optional(),
})

export const BarConfigSchema = z.object({
  layer: z.enum(['top', 'bottom']).optional(),
  position: z.enum(['top', 'bottom', 'left', 'right']).optional(),
  output: z.union([z.string(), z.array(z.string())]).optional(),
  height: z.number().int().positive().optional(),
  width: z.number().int().positive().optional(),
  margin: z.string().optional(),
  'margin-top': z.number().optional(),
  'margin-bottom': z.number().optional(),
  'margin-left': z.number().optional(),
  'margin-right': z.number().optional(),
  spacing: z.number().default(4),
  mode: z.enum(['dock', 'hide', 'invisible', 'overlay']).optional(),
  exclusive: z.boolean().default(true),
  passthrough: z.boolean().default(false),
  'gtk-layer-shell': z.boolean().default(true),
  ipc: z.boolean().default(false),
  name: z.string().optional(),
  'reload_style_on_change': z.boolean().default(true),
  'modules-left': z.array(z.string()).optional(),
  'modules-center': z.array(z.string()).optional(),
  'modules-right': z.array(z.string()).optional(),
})

// src/lib/schemas/modules.ts
export const ModuleTypeSchema = z.enum([
  'battery', 'cpu', 'memory', 'disk', 'temperature', 'network',
  'load', 'backlight', 'pulseaudio', 'bluetooth', 'keyboard-state',
  'workspaces', 'window', 'mode', 'language', 'hyprland/workspaces',
  'hyprland/window', 'sway/workspaces', 'sway/window', 'mpd',
  'mpris', 'clock', 'tray', 'idle_inhibitor', 'custom',
  // ... add all 50+ module types
])

export const CommonModuleConfigSchema = InteractiveActionsSchema.extend({
  format: z.string().optional(),
  'format-icons': z.union([
    z.array(z.string()),
    z.record(z.string())
  ]).optional(),
  'max-length': z.number().int().positive().optional(),
  rotate: z.number().optional(),
  tooltip: z.boolean().default(true),
  'tooltip-format': z.string().optional(),
  states: z.record(z.number()).optional(),
})

// Module-specific schemas
export const BatteryModuleSchema = CommonModuleConfigSchema.extend({
  bat: z.string().optional(),
  adapter: z.string().optional(),
  interval: z.number().int().positive().default(60),
  'full-at': z.number().int().min(0).max(100).optional(),
  'design-capacity': z.boolean().default(false),
  'format-time': z.string().optional(),
  // ... all battery-specific fields
})

export const ClockModuleSchema = CommonModuleConfigSchema.extend({
  interval: z.number().int().positive().default(60),
  timezone: z.string().optional(),
  timezones: z.array(z.string()).optional(),
  locale: z.string().optional(),
  calendar: z.object({
    mode: z.enum(['year', 'month']).default('month'),
    'mode-mon-col': z.number().int().default(3),
    'weeks-pos': z.string().optional(),
    'on-scroll': z.number().int().default(1),
    format: z.object({
      months: z.string().optional(),
      days: z.string().optional(),
      weeks: z.string().optional(),
      weekdays: z.string().optional(),
      today: z.string().optional(),
    }).optional(),
  }).optional(),
  // ... all clock-specific fields
})

// Factory to get schema for module type
export const ModuleSchemas: Record<ModuleType, z.ZodSchema> = {
  battery: BatteryModuleSchema,
  clock: ClockModuleSchema,
  cpu: CPUModuleSchema,
  // ... schemas for all 50+ modules
}

export const ModuleInstanceSchema = z.object({
  id: z.string().uuid(),
  type: ModuleTypeSchema,
  customName: z.string().optional(),
  position: z.enum(['left', 'center', 'right']),
  order: z.number().int(),
  config: z.record(z.any()), // Validated dynamically based on type
  enabled: z.boolean().default(true),
})

// ============================================================================
// ZUSTAND STORE DEFINITIONS
// ============================================================================

// src/store/config-store.ts
import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'
import { temporal } from 'zundo'

interface ConfigState {
  config: WaybarConfig
  currentBarId: string | null
  isDirty: boolean
  lastSaved: Date | null
}

interface ConfigActions {
  // Bar management
  createBar: (bar: Partial<BarDefinition>) => void
  updateBar: (id: string, updates: Partial<BarDefinition>) => void
  deleteBar: (id: string) => void
  duplicateBar: (id: string) => void
  setCurrentBar: (id: string) => void

  // Module management
  addModule: (barId: string, module: Omit<ModuleInstance, 'id'>) => void
  updateModule: (barId: string, moduleId: string, updates: Partial<ModuleInstance>) => void
  deleteModule: (barId: string, moduleId: string) => void
  reorderModules: (barId: string, position: 'left' | 'center' | 'right', moduleIds: string[]) => void
  moveModule: (barId: string, moduleId: string, toPosition: 'left' | 'center' | 'right', toIndex: number) => void

  // Style management
  addStyle: (style: Omit<StyleDefinition, 'id'>) => void
  updateStyle: (id: string, updates: Partial<StyleDefinition>) => void
  deleteStyle: (id: string) => void

  // File operations
  loadConfig: (config: WaybarConfig) => void
  saveConfig: () => Promise<void>
  resetConfig: () => void

  // Metadata
  markDirty: () => void
  markClean: () => void
}

type ConfigStore = ConfigState & ConfigActions

export const useConfigStore = create<ConfigStore>()(
  devtools(
    persist(
      temporal(
        immer((set, get) => ({
          // Initial state
          config: {
            bars: [],
            styles: [],
            metadata: {
              version: '1.0.0',
              createdAt: new Date().toISOString(),
              modifiedAt: new Date().toISOString(),
              appVersion: '1.0.0',
            },
          },
          currentBarId: null,
          isDirty: false,
          lastSaved: null,

          // Bar actions
          createBar: (bar) => set((state) => {
            const newBar: BarDefinition = {
              id: crypto.randomUUID(),
              name: bar.name || 'New Bar',
              enabled: true,
              order: state.config.bars.length,
              config: bar.config || {},
              modules: [],
              ...bar,
            }
            state.config.bars.push(newBar)
            state.currentBarId = newBar.id
            state.isDirty = true
          }),

          updateBar: (id, updates) => set((state) => {
            const bar = state.config.bars.find(b => b.id === id)
            if (bar) {
              Object.assign(bar, updates)
              state.isDirty = true
            }
          }),

          deleteBar: (id) => set((state) => {
            state.config.bars = state.config.bars.filter(b => b.id !== id)
            if (state.currentBarId === id) {
              state.currentBarId = state.config.bars[0]?.id || null
            }
            state.isDirty = true
          }),

          duplicateBar: (id) => set((state) => {
            const bar = state.config.bars.find(b => b.id === id)
            if (bar) {
              const newBar: BarDefinition = {
                ...JSON.parse(JSON.stringify(bar)),
                id: crypto.randomUUID(),
                name: `${bar.name} (Copy)`,
                modules: bar.modules.map(m => ({
                  ...m,
                  id: crypto.randomUUID(),
                })),
              }
              state.config.bars.push(newBar)
              state.isDirty = true
            }
          }),

          setCurrentBar: (id) => set({ currentBarId: id }),

          // Module actions
          addModule: (barId, module) => set((state) => {
            const bar = state.config.bars.find(b => b.id === barId)
            if (bar) {
              const newModule: ModuleInstance = {
                ...module,
                id: crypto.randomUUID(),
              }
              bar.modules.push(newModule)
              state.isDirty = true
            }
          }),

          updateModule: (barId, moduleId, updates) => set((state) => {
            const bar = state.config.bars.find(b => b.id === barId)
            if (bar) {
              const module = bar.modules.find(m => m.id === moduleId)
              if (module) {
                Object.assign(module, updates)
                state.isDirty = true
              }
            }
          }),

          deleteModule: (barId, moduleId) => set((state) => {
            const bar = state.config.bars.find(b => b.id === barId)
            if (bar) {
              bar.modules = bar.modules.filter(m => m.id !== moduleId)
              state.isDirty = true
            }
          }),

          reorderModules: (barId, position, moduleIds) => set((state) => {
            const bar = state.config.bars.find(b => b.id === barId)
            if (bar) {
              const positionModules = bar.modules.filter(m => m.position === position)
              positionModules.forEach((module, index) => {
                const newIndex = moduleIds.indexOf(module.id)
                if (newIndex !== -1) {
                  module.order = newIndex
                }
              })
              state.isDirty = true
            }
          }),

          moveModule: (barId, moduleId, toPosition, toIndex) => set((state) => {
            const bar = state.config.bars.find(b => b.id === barId)
            if (bar) {
              const module = bar.modules.find(m => m.id === moduleId)
              if (module) {
                module.position = toPosition
                module.order = toIndex
                state.isDirty = true
              }
            }
          }),

          // Style actions
          addStyle: (style) => set((state) => {
            const newStyle: StyleDefinition = {
              ...style,
              id: crypto.randomUUID(),
            }
            state.config.styles.push(newStyle)
            state.isDirty = true
          }),

          updateStyle: (id, updates) => set((state) => {
            const style = state.config.styles.find(s => s.id === id)
            if (style) {
              Object.assign(style, updates)
              state.isDirty = true
            }
          }),

          deleteStyle: (id) => set((state) => {
            state.config.styles = state.config.styles.filter(s => s.id !== id)
            state.isDirty = true
          }),

          // File operations
          loadConfig: (config) => set({
            config,
            currentBarId: config.bars[0]?.id || null,
            isDirty: false,
            lastSaved: new Date(),
          }),

          saveConfig: async () => {
            const state = get()
            // Call Tauri command to save
            await invoke('save_config', { config: state.config })
            set({
              isDirty: false,
              lastSaved: new Date(),
            })
          },

          resetConfig: () => set((state) => {
            state.config.bars = []
            state.config.styles = []
            state.currentBarId = null
            state.isDirty = false
          }),

          markDirty: () => set({ isDirty: true }),
          markClean: () => set({ isDirty: false }),
        })),
        { limit: 50 } // Zundo undo/redo limit
      ),
      {
        name: 'waybar-config-storage',
        partialize: (state) => ({ config: state.config }), // Only persist config
      }
    ),
    { name: 'ConfigStore' }
  )
)

// Selector hooks for performance
export const useCurrentBar = () =>
  useConfigStore(state => {
    const barId = state.currentBarId
    return barId ? state.config.bars.find(b => b.id === barId) : null
  })

export const useCurrentBarModules = () =>
  useConfigStore(state => {
    const barId = state.currentBarId
    const bar = barId ? state.config.bars.find(b => b.id === barId) : null
    return bar?.modules || []
  })

export const useModulesByPosition = (position: 'left' | 'center' | 'right') =>
  useConfigStore(state => {
    const barId = state.currentBarId
    const bar = barId ? state.config.bars.find(b => b.id === barId) : null
    return bar?.modules
      .filter(m => m.position === position)
      .sort((a, b) => a.order - b.order) || []
  })

// ============================================================================
// RUST BACKEND TYPES
// ============================================================================

// src-tauri/src/error.rs
use serde::Serialize;
use thiserror::Error;

#[derive(Error, Debug, Serialize)]
#[serde(tag = "type", content = "message")]
pub enum AppError {
    #[error("IO error: {0}")]
    Io(String),

    #[error("Configuration error: {0}")]
    Config(String),

    #[error("Parse error: {0}")]
    Parse(String),

    #[error("Validation error: {0}")]
    Validation(String),

    #[error("Not found: {0}")]
    NotFound(String),
}

impl From<std::io::Error> for AppError {
    fn from(err: std::io::Error) -> Self {
        AppError::Io(err.to_string())
    }
}

impl From<serde_json::Error> for AppError {
    fn from(err: serde_json::Error) -> Self {
        AppError::Parse(err.to_string())
    }
}

// src-tauri/src/config/mod.rs
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct WaybarConfigFile {
    // Raw JSONC content from file
    pub content: String,
    pub path: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ConfigPaths {
    pub config_dir: String,
    pub config_file: String,
    pub style_file: String,
}
```

### Implementation Tasks (Dependency-Ordered)

```yaml
# ============================================================================
# PHASE 1: PROJECT SETUP & FOUNDATION (Week 1)
# ============================================================================

Task 1: CREATE Tauri + React project structure
  - EXECUTE: npm create tauri-app@latest -- --rc
  - CHOOSE: React + TypeScript template
  - VERIFY: Project builds with npm run tauri dev
  - PLACEMENT: Root directory as waybar-config/

Task 2: CONFIGURE Tauri capabilities for file system access
  - CREATE: src-tauri/capabilities/default.json
  - ADD: File system permissions for $APPCONFIG and $HOME/.config/waybar/
  - PERMISSIONS: fs:allow-read-text-file, fs:allow-write-text-file, fs:allow-read-dir, fs:allow-exists
  - REFERENCE: PRPs/ai_docs/tauri-research.md (Capabilities section)

Task 3: INSTALL frontend dependencies
  - EXECUTE: npm install zustand zod @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities @monaco-editor/react react-colorful lucide-react
  - EXECUTE: npm install -D @types/node tailwindcss postcss autoprefixer
  - EXECUTE: npm install zundo (undo/redo)
  - EXECUTE: npm install zustand/middleware/immer
  - VERIFY: All packages installed successfully

Task 4: CONFIGURE Tailwind CSS
  - EXECUTE: npx tailwindcss init -p
  - MODIFY: tailwind.config.js to include src/**/*.{ts,tsx}
  - CREATE: src/styles/globals.css with Tailwind directives
  - IMPORT: globals.css in src/main.tsx

Task 5: CONFIGURE Vite for Monaco Editor web workers
  - MODIFY: vite.config.ts
  - ADD: Monaco Editor worker configuration
  - PATTERN: PRPs/ai_docs/monaco-research.md (Web Workers section)

Task 6: CREATE Rust dependencies in Cargo.toml
  - ADD: serde = { version = "1.0", features = ["derive"] }
  - ADD: serde_json = "1.0"
  - ADD: thiserror = "1.0"
  - ADD: anyhow = "1.0"
  - VERIFY: cargo build succeeds

# ============================================================================
# PHASE 2: TYPE SYSTEM & DATA MODELS (Week 1-2)
# ============================================================================

Task 7: CREATE core TypeScript type definitions
  - CREATE: src/lib/types/config.ts
  - IMPLEMENT: WaybarConfig, BarDefinition, ModuleInstance, StyleDefinition interfaces
  - FOLLOW pattern: Data models section above
  - PLACEMENT: src/lib/types/

Task 8: CREATE Zod validation schemas for bar configuration
  - CREATE: src/lib/schemas/bar-config.ts
  - IMPLEMENT: BarConfigSchema with all bar-level options
  - USE: z.object(), z.enum(), z.number(), z.boolean() primitives
  - REFERENCE: PRPs/ai_docs/zod-research.md
  - VERIFY: Type inference with z.infer<typeof BarConfigSchema>

Task 9: CREATE Zod schemas for common module configuration
  - CREATE: src/lib/schemas/modules.ts
  - IMPLEMENT: CommonModuleConfigSchema, InteractiveActionsSchema
  - PATTERN: All modules share common fields (format, tooltip, actions)

Task 10: CREATE module-specific Zod schemas (Core modules)
  - IMPLEMENT: BatteryModuleSchema, ClockModuleSchema, CPUModuleSchema, MemoryModuleSchema, NetworkModuleSchema
  - REFERENCE: PRPs/ai_docs/waybar-research.md (Module sections)
  - PATTERN: CommonModuleConfigSchema.extend({ module-specific fields })
  - CRITICAL: Battery states are ≤ threshold (reversed from other modules)

Task 11: CREATE module metadata constants
  - CREATE: src/lib/constants/modules.ts
  - IMPLEMENT: ModuleMetadata[] array with all 50+ modules
  - PROPERTIES: type, displayName, description, category, icon, requiresWM
  - CATEGORY: 'system' | 'hardware' | 'wm' | 'media' | 'utility'
  - PURPOSE: Used by ModulePalette to display available modules

Task 12: CREATE Rust error types
  - CREATE: src-tauri/src/error.rs
  - IMPLEMENT: AppError enum with Io, Config, Parse, Validation, NotFound variants
  - USE: thiserror::Error derive macro
  - IMPLEMENT: From<std::io::Error> and From<serde_json::Error> conversions

# ============================================================================
# PHASE 3: RUST BACKEND - FILE SYSTEM & CONFIG MANAGEMENT (Week 2)
# ============================================================================

Task 13: CREATE Rust config module structure
  - CREATE: src-tauri/src/config/mod.rs, parser.rs, writer.rs
  - EXPORT: Public functions in mod.rs
  - PATTERN: Module-based organization

Task 14: IMPLEMENT Tauri command: detect_config_paths
  - CREATE: #[tauri::command] in src-tauri/src/commands.rs
  - LOGIC: Check ~/.config/waybar/config, ~/.config/waybar/config.jsonc, etc.
  - RETURN: Result<ConfigPaths, AppError>
  - PATTERN: Use app_handle.path().app_config_dir()
  - REFERENCE: PRPs/ai_docs/tauri-research.md (File System section)

Task 15: IMPLEMENT Tauri command: load_config
  - CREATE: #[tauri::command] async fn load_config(path: String)
  - LOGIC: Read config file, strip JSONC comments, parse JSON
  - RETURN: Result<String, AppError> (raw JSON string)
  - CRITICAL: Handle JSONC comments (// and /* */)
  - ERROR HANDLING: Wrap with .map_err(|e| e.to_string())

Task 16: IMPLEMENT Tauri command: save_config
  - CREATE: #[tauri::command] async fn save_config(path: String, content: String)
  - LOGIC: Create backup, write new config, verify valid JSON
  - BACKUP: Copy existing file to config.backup before writing
  - RETURN: Result<(), AppError>

Task 17: IMPLEMENT Tauri command: load_css
  - CREATE: #[tauri::command] async fn load_css(path: String)
  - LOGIC: Read style.css file
  - RETURN: Result<String, AppError>

Task 18: IMPLEMENT Tauri command: save_css
  - CREATE: #[tauri::command] async fn save_css(path: String, content: String)
  - LOGIC: Create backup, write new CSS
  - RETURN: Result<(), AppError>

Task 19: REGISTER all Tauri commands in main.rs
  - MODIFY: src-tauri/src/main.rs
  - ADD: .invoke_handler(tauri::generate_handler![detect_config_paths, load_config, save_config, load_css, save_css])
  - VERIFY: Commands are accessible from frontend

# ============================================================================
# PHASE 4: ZUSTAND STATE MANAGEMENT (Week 2-3)
# ============================================================================

Task 20: CREATE config store with Zustand + Immer + Zundo
  - CREATE: src/store/config-store.ts
  - IMPLEMENT: Full ConfigStore as shown in Data Models section
  - USE: create()(devtools(persist(temporal(immer(...)))))
  - MIDDLEWARE ORDER: immer → temporal → persist → devtools
  - PATTERN: PRPs/ai_docs/zustand-research.md (Undo/redo section)

Task 21: CREATE UI state store
  - CREATE: src/store/ui-store.ts
  - STATE: selectedModuleId, isModuleEditorOpen, isSidebarCollapsed, theme
  - ACTIONS: selectModule, openModuleEditor, closeModuleEditor, toggleSidebar

Task 22: CREATE validation state store
  - CREATE: src/store/validation-store.ts
  - STATE: errors (Record<string, string[]>), warnings, isValidating
  - ACTIONS: setErrors, clearErrors, validateConfig
  - PATTERN: Flat error format for form display

Task 23: CREATE Tauri command wrapper hooks
  - CREATE: src/lib/tauri/commands.ts
  - IMPLEMENT: Type-safe wrappers for all Tauri commands
  - PATTERN: async function with invoke<ReturnType>('command_name', { args })
  - ERROR HANDLING: try/catch with user-friendly messages

# ============================================================================
# PHASE 5: BASIC UI COMPONENTS (Week 3)
# ============================================================================

Task 24: CREATE MainLayout component
  - CREATE: src/components/layout/MainLayout.tsx
  - LAYOUT: Sidebar (left) + EditorPanel (center) + StatusBar (bottom)
  - STYLING: Flexbox layout, dark theme by default
  - RESPONSIVE: Fixed sidebar width 280px, flexible editor area

Task 25: CREATE Sidebar component
  - CREATE: src/components/layout/Sidebar.tsx
  - SECTIONS: Bars list, Module palette, Templates, Settings
  - STYLING: Vertical navigation with icons
  - STATE: Use ui-store for collapsed state

Task 26: CREATE StatusBar component
  - CREATE: src/components/layout/StatusBar.tsx
  - DISPLAY: Current bar name, save status, validation errors count, Waybar status
  - ACTIONS: Save button, reload Waybar button
  - STYLING: Fixed bottom bar, height 32px

Task 27: CREATE base UI components (Button, Input, Select, Toggle)
  - CREATE: src/components/common/Button.tsx, Input.tsx, Select.tsx, Toggle.tsx
  - VARIANTS: Button (primary, secondary, danger, ghost)
  - STYLING: Tailwind classes, consistent design system
  - ACCESSIBILITY: Proper ARIA attributes, keyboard navigation

Task 28: CREATE ColorPicker component
  - CREATE: src/components/common/ColorPicker.tsx
  - USE: react-colorful library
  - FEATURES: RGB/RGBA picker, hex input, preset swatches
  - PATTERN: PRPs/ai_docs/zustand-research.md (Real-time updates)

# ============================================================================
# PHASE 6: BAR MANAGEMENT UI (Week 3-4)
# ============================================================================

Task 29: CREATE BarList component
  - CREATE: src/components/bars/BarList.tsx
  - DISPLAY: List of all bars from config-store
  - ACTIONS: Create, delete, duplicate, enable/disable buttons
  - SELECTION: Click to set currentBarId
  - STYLING: Card layout with hover effects

Task 30: CREATE BarCard component
  - CREATE: src/components/bars/BarCard.tsx
  - PROPS: bar: BarDefinition, isSelected: boolean
  - DISPLAY: Bar name, position, module count, enabled status
  - ACTIONS: Edit, duplicate, delete icons
  - STYLING: Highlighted when selected

Task 31: CREATE BarEditor container component
  - CREATE: src/components/bars/BarEditor.tsx
  - TABS: General, Modules, Styling
  - LAYOUT: Tab navigation + tab content area
  - STATE: Active tab in ui-store

Task 32: CREATE BarSettings form component
  - CREATE: src/components/bars/BarSettings.tsx
  - FIELDS: All BarConfig properties (position, height, spacing, etc.)
  - FORM: Controlled inputs updating config-store
  - VALIDATION: Real-time with Zod schemas
  - PATTERN: Watch for changes and call updateBar action

# ============================================================================
# PHASE 7: MODULE DRAG-AND-DROP (Week 4-5)
# ============================================================================

Task 33: CREATE ModulePalette component
  - CREATE: src/components/modules/ModulePalette.tsx
  - DISPLAY: Grid of available modules from module metadata
  - FILTERING: Category filter (system, hardware, wm, media, utility)
  - SEARCH: Text search by module name
  - DRAGGABLE: Each module card uses useDraggable from dnd-kit
  - REFERENCE: PRPs/ai_docs/dndkit-research.md (Module Palette pattern)

Task 34: CREATE ModuleZone droppable component
  - CREATE: src/components/modules/ModuleZone.tsx
  - PROPS: position: 'left' | 'center' | 'right'
  - DROPPABLE: useDroppable from dnd-kit
  - SORTABLE: SortableContext for reordering modules
  - DISPLAY: Title (Left/Center/Right), drop indicator, module cards
  - EMPTY STATE: "Drop modules here" when empty

Task 35: CREATE ModuleCard component
  - CREATE: src/components/modules/ModuleCard.tsx
  - PROPS: module: ModuleInstance
  - DRAGGABLE: useSortable from @dnd-kit/sortable
  - DISPLAY: Module icon, type, customName, enabled toggle
  - ACTIONS: Configure button, delete button
  - STYLING: Transform during drag, highlight on hover

Task 36: IMPLEMENT DndContext for module drag-and-drop
  - MODIFY: src/components/bars/BarEditor.tsx (Modules tab)
  - SETUP: DndContext with sensors (pointer, keyboard)
  - HANDLERS: onDragStart, onDragOver, onDragEnd
  - LOGIC: Handle drag from palette to zones, reorder within zones, drag between zones
  - PATTERN: PRPs/ai_docs/dndkit-research.md (Multi-container pattern)
  - CRITICAL: Use DragOverlay for smooth visual feedback

Task 37: IMPLEMENT drag event handlers
  - HANDLER: onDragEnd - finalize module placement
  - LOGIC: If dragging from palette, call addModule; if reordering, call reorderModules; if moving between zones, call moveModule
  - STATE: Update config-store with new module positions
  - VALIDATION: Ensure unique module IDs

# ============================================================================
# PHASE 8: MODULE CONFIGURATION FORMS (Week 5-6)
# ============================================================================

Task 38: CREATE ModuleEditor modal component
  - CREATE: src/components/modules/ModuleEditor.tsx
  - MODAL: Full-screen overlay with close button
  - TABS: Basic, Display, Advanced, Actions (based on module type)
  - STATE: selectedModuleId from ui-store, module data from config-store
  - SAVE: Update module config in config-store

Task 39: CREATE BatteryEditor form
  - CREATE: src/components/modules/editors/BatteryEditor.tsx
  - FIELDS: bat, adapter, interval, format, format-time, format-icons, states
  - FORM HELPERS: FormatBuilder for format string, IconPicker for icons
  - VALIDATION: Use BatteryModuleSchema
  - CRITICAL: Document reversed state logic (≤ threshold)

Task 40: CREATE ClockEditor form
  - CREATE: src/components/modules/editors/ClockEditor.tsx
  - FIELDS: interval, format, timezone, timezones, locale, calendar config
  - SPECIAL: Calendar configuration subform (nested object)
  - FORMAT HELP: Link to strftime format documentation

Task 41: CREATE CPUEditor, MemoryEditor, NetworkEditor forms
  - CREATE: src/components/modules/editors/CPUEditor.tsx, MemoryEditor.tsx, NetworkEditor.tsx
  - PATTERN: Similar structure to BatteryEditor with module-specific fields
  - REFERENCE: PRPs/ai_docs/waybar-research.md for field details

Task 42: CREATE CustomEditor form for custom modules
  - CREATE: src/components/modules/editors/CustomEditor.tsx
  - FIELDS: exec, exec-if, interval, return-type, format, signal
  - HELP TEXT: Explain JSON return format for return-type: "json"
  - SCRIPT EDITOR: Textarea with syntax highlighting (optional)

Task 43: CREATE FormatBuilder helper component
  - CREATE: src/components/common/FormatBuilder.tsx
  - FEATURES: Variable picker (shows available replacements), preview
  - VARIABLES: Load from module metadata based on type
  - OUTPUT: Format string with {placeholder} syntax

Task 44: CREATE IconPicker component
  - CREATE: src/components/common/IconPicker.tsx
  - FEATURES: Icon search, Font Awesome icons, Nerd Fonts icons, custom emoji
  - DISPLAY: Grid of icons with search filter
  - OUTPUT: Icon character or icon name

# ============================================================================
# PHASE 9: CSS VISUAL EDITOR (Week 6-7)
# ============================================================================

Task 45: CREATE StyleEditor container component
  - CREATE: src/components/styles/StyleEditor.tsx
  - TABS: Visual, Code, Preview
  - SELECTOR: Dropdown to select CSS selector (#battery, #cpu, etc.)
  - STATE: Current selector, current style properties

Task 46: CREATE VisualEditor component
  - CREATE: src/components/styles/VisualEditor.tsx
  - SECTIONS: Colors, Spacing, Border, Typography
  - INPUTS: ColorPicker for colors, number inputs for spacing, select for font properties
  - LIVE UPDATE: Debounced updates to config-store styles
  - PATTERN: PRPs/ai_docs/zustand-research.md (Real-time preview)

Task 47: CREATE PropertyControls components
  - CREATE: src/components/styles/PropertyControls.tsx
  - CONTROLS: ColorControl, SpacingControl, BorderControl, TypographyControl
  - REUSABLE: Each control handles one CSS property type
  - OUTPUT: CSSProperty objects { property, value, important }

Task 48: INTEGRATE Monaco Editor for CSS code editing
  - CREATE: src/components/styles/CodeEditor.tsx
  - USE: @monaco-editor/react
  - LANGUAGE: css
  - FEATURES: Syntax highlighting, validation, autocomplete
  - SYNC: Two-way sync with visual editor
  - REFERENCE: PRPs/ai_docs/monaco-research.md (CSS Language section)

Task 49: CONFIGURE Monaco Editor CSS language features
  - SETUP: CSS language defaults in Monaco
  - AUTOCOMPLETION: Register completion provider for Waybar-specific classes
  - VALIDATION: Enable CSS diagnostics
  - PATTERN: PRPs/ai_docs/monaco-research.md (Language Support section)

# ============================================================================
# PHASE 10: CONFIGURATION VALIDATION (Week 7)
# ============================================================================

Task 50: CREATE validation utility functions
  - CREATE: src/lib/utils/validation.ts
  - IMPLEMENT: validateBarConfig, validateModule, validateStyles, validateFullConfig
  - USE: Zod .safeParse() for all validation
  - RETURN: Flat error format { fieldPath: [errors] }

Task 51: IMPLEMENT real-time validation in config-store
  - MODIFY: config-store.ts actions to validate on changes
  - PATTERN: After updateBar/updateModule, run validation and update validation-store
  - DEBOUNCE: 300ms to prevent excessive validation
  - ERROR DISPLAY: Set errors in validation-store

Task 52: CREATE ValidationMessage component
  - CREATE: src/components/common/ValidationMessage.tsx
  - DISPLAY: Error/warning/info messages with icons
  - STYLING: Red for errors, yellow for warnings, blue for info
  - PLACEMENT: Below form fields or in status bar

Task 53: IMPLEMENT module conflict detection
  - LOGIC: Check for duplicate module IDs within a bar
  - ERROR: "Duplicate module ID: battery#bat0"
  - VALIDATION: Run in validateFullConfig function

Task 54: IMPLEMENT dependency checking (optional)
  - LOGIC: Check if required system features are available (e.g., PulseAudio for pulseaudio module)
  - WARNING: "PulseAudio not detected - module may not work"
  - DETECTION: Run Tauri command to check system

# ============================================================================
# PHASE 11: FILE OPERATIONS & INTEGRATION (Week 7-8)
# ============================================================================

Task 55: IMPLEMENT load configuration flow
  - LOGIC: On app startup, call detect_config_paths → load_config → load_css
  - PARSE: JSON config and CSS
  - TRANSFORM: Convert raw JSON to WaybarConfig type
  - STORE: Call config-store.loadConfig with parsed data
  - ERROR HANDLING: Show error dialog if config is invalid

Task 56: IMPLEMENT save configuration flow
  - LOGIC: Convert WaybarConfig to Waybar JSON format (modules-left/center/right from ModuleInstance[])
  - GENERATE: JSONC with comments explaining sections
  - CALL: save_config and save_css Tauri commands
  - BACKUP: Automatically created by backend
  - FEEDBACK: Show success toast, update lastSaved timestamp

Task 57: CREATE config transformation utilities
  - CREATE: src/lib/utils/config-transform.ts
  - FUNCTIONS: waybarConfigToJSON, jsonToWaybarConfig
  - LOGIC: Group modules by position, generate modules-left/center/right arrays
  - MODULE IDs: Generate with customName suffix (#battery#bat0)

Task 58: IMPLEMENT Waybar reload command
  - CREATE: src-tauri/src/waybar/mod.rs, process.rs
  - IMPLEMENT: #[tauri::command] fn reload_waybar()
  - LOGIC: Send SIGUSR2 signal to Waybar process (pkill -SIGUSR2 waybar)
  - RETURN: Result<(), AppError>
  - FRONTEND: Call after successful save

Task 59: IMPLEMENT compositor detection
  - CREATE: src-tauri/src/system/compositor.rs
  - IMPLEMENT: #[tauri::command] fn detect_compositor()
  - LOGIC: Check $XDG_CURRENT_DESKTOP or $WAYLAND_DISPLAY environment variables
  - RETURN: Result<String, AppError> ("hyprland", "sway", "river", "unknown")
  - PURPOSE: Filter module palette to show only compatible modules

# ============================================================================
# PHASE 12: POLISHING & TESTING (Week 8)
# ============================================================================

Task 60: IMPLEMENT undo/redo UI controls
  - USE: useConfigStore.temporal.getState() from Zundo
  - BUTTONS: Undo/Redo buttons in toolbar with keyboard shortcuts (Ctrl+Z, Ctrl+Shift+Z)
  - DISPLAY: Show number of undo/redo states available
  - DISABLE: When no states available

Task 61: CREATE keyboard shortcuts
  - IMPLEMENT: Global keyboard listener (Ctrl+S for save, Ctrl+Z/Y for undo/redo, Escape to close modals)
  - ACCESSIBILITY: Ensure all actions are keyboard accessible
  - HELP: Keyboard shortcuts help dialog

Task 62: IMPLEMENT dark/light theme toggle
  - STATE: theme in ui-store ('dark' | 'light' | 'system')
  - STYLING: CSS variables or Tailwind dark: classes
  - PERSISTENCE: Save theme preference in localStorage

Task 63: CREATE error boundary components
  - IMPLEMENT: React error boundaries for graceful error handling
  - FALLBACK UI: Show error message with reload option
  - LOGGING: Log errors to console

Task 64: ADD loading states
  - IMPLEMENT: Loading spinners for async operations (loading config, saving, validating)
  - SKELETON: Skeleton screens for initial load
  - FEEDBACK: Progress indicators for long operations

Task 65: WRITE integration tests for critical flows
  - TEST: Load config → modify modules → save config → verify file
  - TEST: Drag module from palette → configure → save
  - TEST: Validation errors prevent save
  - TOOL: Vitest or Jest with React Testing Library

Task 66: WRITE Rust unit tests for backend
  - TEST: Config parser handles JSONC comments
  - TEST: Backup creation before save
  - TEST: Error handling for missing files
  - PATTERN: #[cfg(test)] mod tests

Task 67: CREATE user documentation
  - WRITE: README.md with installation and usage instructions
  - WRITE: In-app help system with tooltips and guides
  - SCREENSHOTS: Add screenshots of key features

Task 68: OPTIMIZE bundle size and performance
  - ANALYZE: Use Vite bundle analyzer
  - LAZY LOAD: Code split module editors (React.lazy)
  - OPTIMIZE: Minimize Tauri app size (strip debug symbols)
  - TREE SHAKE: Remove unused Monaco languages
```

### Integration Points

```yaml
FILE_SYSTEM:
  - config_dir: "~/.config/waybar/"
  - config_file: "config or config.jsonc"
  - style_file: "style.css"
  - backup_pattern: "config.backup.{timestamp}"

WAYBAR_CONTROL:
  - reload_signal: "SIGUSR2 (pkill -SIGUSR2 waybar)"
  - process_check: "pgrep waybar"
  - config_validation: "Waybar --test (if available)"

COMPOSITOR_DETECTION:
  - environment: "$XDG_CURRENT_DESKTOP, $WAYLAND_DISPLAY"
  - supported: "hyprland, sway, river, dwl, niri, generic"
  - module_filtering: "Hide incompatible modules based on compositor"

STATE_PERSISTENCE:
  - zustand_persist: "localStorage: waybar-config-storage"
  - last_config: "Remember last loaded config path"
  - ui_preferences: "Sidebar state, theme, window size"
```

## Validation Loop

### Level 1: Type Checking & Linting (Immediate Feedback)

```bash
# Frontend type checking
npm run type-check
# or with tsc directly
npx tsc --noEmit

# Linting (if ESLint configured)
npm run lint

# Rust type checking and linting
cd src-tauri
cargo check
cargo clippy -- -D warnings

# Expected: Zero errors before proceeding
```

### Level 2: Unit Tests (Component Validation)

```bash
# Frontend unit tests (if configured with Vitest/Jest)
npm run test

# Rust unit tests
cd src-tauri
cargo test

# Expected: All tests pass
```

### Level 3: Integration Testing (System Validation)

```bash
# Start Tauri dev server
npm run tauri dev

# Manual testing checklist:
# 1. App launches without errors
# 2. Detects existing Waybar config (if present)
# 3. Can create new bar
# 4. Can add modules via drag-and-drop
# 5. Can configure module parameters
# 6. Can edit CSS visually
# 7. Validation shows errors for invalid config
# 8. Save creates backup and writes files
# 9. Saved config loads successfully in Waybar

# Check generated config files
cat ~/.config/waybar/config
cat ~/.config/waybar/style.css

# Verify Waybar can parse config
waybar --test  # (if Waybar supports this flag)
# OR
pkill waybar && waybar &  # Test by running Waybar

# Expected: Waybar loads without errors, displays configured modules
```

### Level 4: End-to-End Validation

```bash
# Full workflow test
# 1. Delete existing Waybar config (backup first!)
mv ~/.config/waybar/config ~/.config/waybar/config.old
mv ~/.config/waybar/style.css ~/.config/waybar/style.old

# 2. Launch app
npm run tauri dev

# 3. Create new configuration from scratch
#    - Add clock, battery, network modules
#    - Configure each module
#    - Style with visual editor
#    - Save configuration

# 4. Reload Waybar
pkill -SIGUSR2 waybar

# 5. Verify Waybar displays correctly with new config

# 6. Test undo/redo
#    - Make changes
#    - Undo (Ctrl+Z)
#    - Redo (Ctrl+Shift+Z)
#    - Verify config state matches

# 7. Test validation
#    - Enter invalid values (negative numbers, invalid formats)
#    - Verify error messages appear
#    - Verify save is disabled when errors exist

# 8. Restore original config
mv ~/.config/waybar/config.old ~/.config/waybar/config
mv ~/.config/waybar/style.old ~/.config/waybar/style.css

# Expected: Full workflow completes without errors
```

## Final Validation Checklist

### Technical Validation

- [ ] TypeScript compiles without errors: `npx tsc --noEmit`
- [ ] Rust compiles without errors: `cargo build`
- [ ] No linting errors: `cargo clippy`, `npm run lint` (if configured)
- [ ] All unit tests pass: `cargo test`, `npm run test`
- [ ] Tauri app builds successfully: `npm run tauri build`

### Feature Validation

- [ ] App detects existing Waybar config at `~/.config/waybar/`
- [ ] User can create a new bar with position, height, spacing settings
- [ ] User can drag modules from palette to left/center/right zones
- [ ] User can reorder modules within a zone
- [ ] User can configure at least 5 core modules (battery, clock, cpu, memory, network)
- [ ] Module configuration forms validate inputs with Zod schemas
- [ ] Real-time validation shows errors in UI
- [ ] User can edit CSS colors and spacing visually
- [ ] Monaco Editor provides CSS syntax highlighting and validation
- [ ] User can save configuration and it creates automatic backup
- [ ] Saved configuration successfully loads in Waybar (no JSON errors)
- [ ] Undo/redo works for all configuration changes
- [ ] App detects Wayland compositor and filters compatible modules

### Code Quality Validation

- [ ] Follows Tauri 2.0 best practices (capabilities, proper error handling)
- [ ] Uses Zustand with Immer for efficient state updates
- [ ] Uses selectors to prevent unnecessary re-renders
- [ ] File system access respects capabilities/permissions
- [ ] Proper TypeScript types throughout (no `any` except in dynamic cases)
- [ ] Error handling uses Result<T, AppError> in Rust
- [ ] Frontend uses .safeParse() for validation (not .parse())
- [ ] CSS selectors match Waybar spec (#module-name, .class)

### User Experience Validation

- [ ] Drag-and-drop feels smooth and responsive (DragOverlay used)
- [ ] Validation errors are clear and actionable
- [ ] Save/load operations provide visual feedback
- [ ] Keyboard shortcuts work (Ctrl+S save, Ctrl+Z undo, Escape close)
- [ ] All interactive elements are keyboard accessible
- [ ] Module palette is organized by category
- [ ] Empty states have helpful messages ("Drop modules here")
- [ ] Status bar shows current state (unsaved changes, validation errors)

### Data Integrity Validation

- [ ] Backup is created before modifying existing config
- [ ] Backup filename includes timestamp for uniqueness
- [ ] Config transformation preserves all module settings
- [ ] Module IDs are unique within a bar
- [ ] CSS properties are valid and don't break Waybar
- [ ] JSONC comments are properly handled (stripped on parse, preserved on save)
- [ ] State changes are properly tracked for undo/redo

---

## Anti-Patterns to Avoid

- ❌ Don't use `.parse()` in Zod - always use `.safeParse()` for user input
- ❌ Don't subscribe to entire Zustand store - use selectors
- ❌ Don't mutate state directly - use Immer middleware
- ❌ Don't forget to configure Monaco web workers - intellisense won't work
- ❌ Don't ignore JSONC comment handling - standard JSON.parse() will fail
- ❌ Don't skip backup before saving config - data loss risk
- ❌ Don't use HTML5 Drag and Drop API - use dnd-kit
- ❌ Don't return plain values from Tauri commands - use Result<T, String>
- ❌ Don't forget Tauri capabilities - file access will be denied
- ❌ Don't hardcode file paths - use $APPCONFIG and path API
- ❌ Don't skip validation - invalid config breaks Waybar
- ❌ Don't create new patterns when existing ones work (follow research docs)

---

## Success Metrics

**Confidence Score: 8/10**

**Rationale**: This PRP provides comprehensive context including:
- ✅ Complete technology stack with specific versions
- ✅ Detailed Waybar configuration reference (all 50+ modules documented)
- ✅ Implementation patterns for all major libraries (5 detailed research docs)
- ✅ Full data models and type definitions
- ✅ Step-by-step tasks with dependency ordering
- ✅ Critical gotchas and anti-patterns identified
- ✅ Validation checklist covering all aspects

**Remaining Risks**:
- Implementing all 50+ module editors is time-intensive (phased approach recommended)
- Monaco Editor configuration can be tricky (follow research doc closely)
- Multi-container drag-and-drop requires careful state management

**Mitigation**:
- Focus on 10 core modules first (battery, clock, cpu, memory, network, workspaces, window, tray, pulseaudio, custom)
- Follow Monaco research doc examples exactly
- Use DragOverlay pattern from dnd-kit research for smooth DnD

**Validation**: An AI agent unfamiliar with this codebase should be able to implement the foundation (Phases 1-8) successfully using only this PRP and the referenced research documents, creating a working prototype with core features within 8 weeks.
