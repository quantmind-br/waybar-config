# Architecture

## Application Architecture

### High-Level Structure
```
┌─────────────────────────────────────┐
│     React Frontend (TypeScript)     │
│  - Components (UI)                  │
│  - Stores (Zustand)                 │
│  - Schemas (Zod)                    │
└──────────┬──────────────────────────┘
           │ Tauri IPC (invoke)
┌──────────▼──────────────────────────┐
│      Rust Backend (Tauri 2.0)       │
│  - Commands (IPC handlers)          │
│  - Config parser/writer             │
│  - Waybar process control           │
│  - File system operations           │
└─────────────────────────────────────┘
```

## Frontend Architecture

### State Management (Three Stores)

1. **config-store.ts** - Configuration state
   - Manages Waybar bars and modules
   - Wrapped with `temporal()` for undo/redo
   - Uses Immer for immutable mutations
   - Persisted to localStorage
   - Selectors: `useConfigStore`, `useCurrentBar`, `useModulesByPosition`

2. **ui-store.ts** - UI state
   - Selected bar/module, active tab, theme
   - Dialog visibility
   - Does NOT use temporal (ephemeral state)
   - Selector: `useUIStore`

3. **validation-store.ts** - Validation results
   - Field-level errors and warnings
   - Real-time validation from Zod schemas
   - Aggregated counts for UI indicators
   - Selectors: `useFieldErrors`, `useFieldWarnings`, `useErrorCount`

### Component Hierarchy
```
App
├── ThemeProvider
│   └── MainLayout
│       ├── Sidebar
│       │   ├── ModulePalette (draggable templates)
│       │   └── BarList
│       ├── Content Area
│       │   ├── BarEditor
│       │   │   ├── ModuleZone (left/center/right - droppable)
│       │   │   │   └── ModuleCard (draggable)
│       │   │   └── ModuleEditor (forms)
│       │   └── StyleEditor
│       │       ├── VisualEditor (CSS GUI)
│       │       └── CodeEditor (Monaco)
│       └── StatusBar
└── ErrorBoundary
```

### Drag & Drop Flow (dnd-kit)
1. **DragStart**: User drags from ModulePalette or ModuleCard
2. **DragOver**: Highlight valid drop zones (ModuleZone)
3. **DragEnd**: Update config-store based on drop location
   - Palette → Zone: Create new module instance
   - Zone → Zone: Move module between positions
   - Within Zone: Reorder modules

### Validation Flow
1. Config changes trigger validation hook (`useValidation`)
2. Zod schemas validate entire config
3. Errors/warnings stored in validation-store
4. Components query validation-store by field path
5. UI shows red (error) or yellow (warning) indicators
6. Save blocked if errors exist

## Backend Architecture

### Module Structure
```
src-tauri/src/
├── main.rs          - Entry point
├── lib.rs           - Tauri app builder, command registration
├── commands.rs      - IPC command handlers
├── error.rs         - Custom error types
├── config/
│   ├── mod.rs       - Config types and paths
│   ├── parser.rs    - JSONC comment stripping
│   └── writer.rs    - Config writing with backups
├── waybar/
│   ├── mod.rs       - Waybar integration
│   └── process.rs   - Process control (reload/restart)
└── system/
    ├── mod.rs       - System utilities
    └── compositor.rs - Wayland compositor detection
```

### Key Commands
- `detect_config_paths` - Find Waybar config directory
- `load_config` - Read config file (strips JSONC comments)
- `save_config` - Write config (creates backup first)
- `load_style` - Read style.css
- `save_style` - Write style.css
- `reload_waybar` - Send SIGUSR2 to Waybar
- `restart_waybar` - Kill and restart Waybar
- `create_backup` - Manual backup creation

### JSONC Handling
- Frontend sends/receives pure JSON
- Backend handles JSONC (JSON with comments)
- `parser::strip_jsonc_comments()` removes `//, /* */` comments
- Preserves formatting where possible

### Error Handling
```rust
pub enum AppError {
    Io(String),
    Config(String),
    Parse(String),
    Validation(String),
    NotFound(String),
    PermissionDenied(String),
    AlreadyExists(String),
    Internal(String),
}
```
- Serializable for Tauri IPC
- Structured error responses to frontend
- Automatic conversion from `std::io::Error` and `serde_json::Error`

## Data Flow

### Loading Config
```
User opens app
  → detect_config_paths() [Rust]
  → load_config(path) [Rust]
  → Strip JSONC comments
  → Parse JSON
  → Send to frontend
  → config-store.loadConfig()
  → Validate with Zod
  → Update validation-store
```

### Saving Config
```
User clicks Save (Ctrl+S)
  → Check validation-store for errors
  → If errors exist, show notification and block
  → config-store.saveConfig()
  → send JSON to backend
  → save_config(path, content) [Rust]
  → Create backup first
  → Write new config
  → Mark config-store as clean
  → Show success notification
```

### Module Drag & Drop
```
User drags module from palette to zone
  → DragStart event
  → DragOver highlights drop zone
  → DragEnd event
  → Determine drop position
  → config-store.addModule(barId, module)
  → Immer mutation adds module
  → Component re-renders
  → Validation runs automatically
  → Temporal middleware records undo state
```

## Testing Strategy

### Frontend Tests (Vitest)
- Unit tests: Utilities, hooks, store logic
- Integration tests: User flows (config-flow, module-drag, validation)
- Mocked Tauri API: `src/test/mocks/tauri.ts`
- Test environment: jsdom
- Coverage: v8 provider

### Backend Tests (Cargo)
- Unit tests: Inline with modules
- Integration tests: File operations with tempfile
- Test helpers: `#[cfg(test)]` modules

## File Paths and Locations

### User Config
- `~/.config/waybar/config` or `config.jsonc`
- `~/.config/waybar/style.css`

### Backups
- `~/.config/waybar/config.backup.<timestamp>`

### App Settings (future)
- `~/.config/waybar-config-gui/settings.json`
