# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Overview

A Tauri 2.0 desktop application providing a visual GUI for configuring Waybar (Wayland bar). Users can drag-and-drop modules, edit configurations visually, and save changes with automatic backups.

**Tech Stack:**
- **Frontend**: React 19 + TypeScript, Vite, TailwindCSS
- **State Management**: Zustand with Immer (mutations) and Zundo (undo/redo)
- **Validation**: Zod schemas
- **Drag & Drop**: dnd-kit
- **Code Editor**: Monaco Editor
- **Testing**: Vitest with jsdom
- **Backend**: Rust (Tauri 2.0)

## Common Development Commands

### Frontend Development

```bash
# Run dev server (frontend + Tauri)
npm run dev

# Build frontend only
npm run build

# Preview production build
npm run preview
```

### Tauri Development

```bash
# Run Tauri dev mode (recommended for full app development)
npm run tauri dev

# Build production application
npm run tauri build

# Build output: src-tauri/target/release/bundle/
```

### Testing

```bash
# Run all tests
npm test

# Run tests with UI
npm run test:ui

# Generate coverage report
npm run test:coverage
# Opens coverage.html with detailed report
```

### Rust Backend

```bash
cd src-tauri

# Run Rust tests
cargo test

# Run specific test
cargo test test_name

# Build backend only
cargo build

# Run with verbose output
cargo test -- --nocapture
```

## Code Architecture

### Frontend Structure

```
src/
├── components/
│   ├── bars/         - Bar list, editor, settings
│   ├── modules/      - Module cards, palette, zone (drag-drop), editors
│   ├── styles/       - Visual CSS editor, code editor
│   ├── dialogs/      - Keyboard shortcuts, modals
│   ├── common/       - Reusable UI components
│   └── layout/       - Sidebar, status bar, main layout
├── lib/
│   ├── schemas/      - Zod validation schemas (bar-config, modules, module-specific)
│   ├── types/        - TypeScript type definitions
│   ├── constants/    - Module definitions, format variables, icons
│   ├── tauri/        - Tauri command wrappers
│   ├── hooks/        - Custom React hooks (useValidation, useHistory, useKeyboardShortcuts)
│   └── utils/        - Validation, config transforms, file operations
└── store/
    ├── config-store.ts      - Waybar configuration state
    ├── ui-store.ts          - UI state (theme, dialogs, selected items)
    └── validation-store.ts  - Validation errors and warnings
```

### Backend Structure

```
src-tauri/src/
├── commands.rs       - Tauri command handlers (load_config, save_config, etc.)
├── config/
│   ├── parser.rs     - JSONC comment stripping, JSON validation
│   └── writer.rs     - Config file writing with backups
├── waybar/           - Waybar process management (reload, restart)
├── system/           - System integration utilities
└── error.rs          - Error types and Result alias
```

### State Management Pattern

**Zustand stores with temporal (undo/redo) support:**

1. **config-store.ts**: Central Waybar configuration state
   - Manages bars, modules, positions
   - Wrapped with `temporal()` from Zundo for undo/redo
   - Mutations handled via Immer for immutability

2. **ui-store.ts**: Ephemeral UI state
   - Selected bar/module, active tab, theme
   - Dialog/modal visibility
   - Does NOT use temporal (no undo for UI state)

3. **validation-store.ts**: Real-time validation results
   - Field-level errors and warnings
   - Aggregated counts for UI indicators

**Store Usage Pattern:**
```typescript
// Define state and actions separately
type ConfigState = { ... }
type ConfigActions = { ... }
type ConfigStore = ConfigState & ConfigActions

// Create store with temporal for undo/redo
export const useConfigStore = create<ConfigStore>()(
  temporal(
    immer((set) => ({
      // state
      bars: [],
      // actions
      addBar: (bar) => set((state) => {
        state.bars.push(bar)
      })
    }))
  )
)

// Access undo/redo from temporal store
const { undo, redo } = useConfigStore.temporal.getState()
```

### Validation Flow

1. **Schema Definition**: Zod schemas in `lib/schemas/`
   - `BarConfigSchema` - Bar-level properties
   - `ModuleSchema` - Base module properties
   - Module-specific schemas (e.g., `BatteryModuleSchema`)

2. **Real-time Validation**: `useValidation` hook
   - Validates on config changes
   - Stores results in `validation-store`
   - Components query errors/warnings by field path

3. **Pre-save Validation**: Blocks save if errors exist
   - Warnings allow save but show user notification

### Tauri Command Bridge

**Frontend → Backend communication:**

```typescript
// Frontend: src/lib/tauri/commands.ts
import { invoke } from '@tauri-apps/api/core'

export async function loadConfig(path: string) {
  return invoke<WaybarConfigFile>('load_config', { path })
}
```

```rust
// Backend: src-tauri/src/commands.rs
#[tauri::command]
pub async fn load_config(path: String) -> Result<WaybarConfigFile> {
  // Implementation
}
```

**Key Commands:**
- `detect_config_paths` - Find Waybar config directory
- `load_config` - Read and parse JSONC config
- `save_config` - Write config with backup
- `reload_waybar` - Signal Waybar to reload
- `restart_waybar` - Kill and restart Waybar process

### JSONC Support

The backend handles JSON with comments (JSONC):
- `parser::strip_jsonc_comments()` removes comments before parsing
- Preserves formatting when possible during writes
- Frontend receives/sends JSON, backend handles JSONC conversion

### Drag & Drop Architecture

Using `dnd-kit` with three drop zones (left, center, right):

1. **ModulePalette** - Draggable module templates
2. **ModuleZone** - Droppable zones for each position
3. **ModuleCard** - Draggable items within zones

**Module Movement:**
- Palette → Zone: Creates new module instance
- Zone → Zone: Moves module between positions
- Within Zone: Reorders modules

**Data Structure:**
```typescript
modules: {
  'modules-left': ['battery#bat0', 'cpu', 'memory'],
  'modules-center': ['clock'],
  'modules-right': ['tray', 'network']
}
```

## Development Guidelines

### Adding a New Module Editor

1. Define schema in `src/lib/schemas/module-specific.ts`
2. Create editor component in `src/components/modules/editors/`
3. Export from `src/components/modules/editors/index.ts`
4. Add to `ModuleEditor.tsx` switch statement
5. Add module definition to `src/lib/constants/modules.ts`

### Adding a New Tauri Command

1. Define command in `src-tauri/src/commands.rs`:
   ```rust
   #[tauri::command]
   pub async fn my_command(param: String) -> Result<MyType> { ... }
   ```

2. Register in `src-tauri/src/lib.rs`:
   ```rust
   tauri::Builder::default()
     .invoke_handler(tauri::generate_handler![..., my_command])
   ```

3. Add wrapper in `src/lib/tauri/commands.ts`:
   ```typescript
   export async function myCommand(param: string): Promise<MyType> {
     return invoke('my_command', { param })
   }
   ```

### Testing Strategy

**Frontend Tests** (Vitest + Testing Library):
- Unit tests for utilities and hooks
- Integration tests for user flows (`src/test/integration/`)
- Mock Tauri API using `src/test/mocks/tauri.ts`

**Backend Tests** (Cargo):
- Unit tests inline with Rust modules
- Use `tempfile` crate for file operation tests
- Mock file system when needed

### State Mutations

**ALWAYS use Immer patterns in config-store:**

```typescript
// ✅ Correct - Direct mutation with Immer
addModule: (barId, module) => set((state) => {
  state.bars[barId].modules.push(module)
})

// ❌ Wrong - Spreads bypass Immer
addModule: (barId, module) => set((state) => ({
  ...state,
  bars: [...state.bars]
}))
```

### Undo/Redo Integration

Only `config-store` uses temporal middleware:

```typescript
// Access temporal actions
const { undo, redo, clear } = useConfigStore.temporal.getState()

// Keyboard shortcuts (already implemented in GlobalKeyboardShortcuts)
// Ctrl+Z: undo
// Ctrl+Shift+Z / Ctrl+Y: redo
```

**Do NOT add temporal to:**
- `ui-store` - UI state shouldn't be undoable
- `validation-store` - Derived from config, not user actions

### Validation Schema Updates

When adding/modifying module properties:

1. Update Zod schema in `lib/schemas/`
2. Export types: `export type MyModule = z.infer<typeof MyModuleSchema>`
3. Validation runs automatically via `useValidation` hook
4. Check `validation-store` for errors: `useFieldErrors('modules.0.property')`

## Key Environment Variables

- `TAURI_DEV_HOST` - Custom dev server host (internal use)
- `TAURI_DEBUG` - Enable source maps and verbose logging
- `TAURI_PLATFORM` - Build target platform (windows/linux/mac)

## Config File Locations

**Waybar config (user):**
- `~/.config/waybar/config` or `config.jsonc`
- `~/.config/waybar/style.css`

**App settings (this GUI):**
- `~/.config/waybar-config-gui/settings.json`

**Backups:**
- `~/.config/waybar/config.backup.<timestamp>`
