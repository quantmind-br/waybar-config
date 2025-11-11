# Code Style and Conventions

## TypeScript

### Configuration
- **TypeScript ~5.8.3** with strict mode enabled
- Compiler target: ES2020
- Module system: ESNext (bundler mode)
- JSX: react-jsx

### Strict Checks Enabled
- `strict: true`
- `noUnusedLocals: true`
- `noUnusedParameters: true`
- `noFallthroughCasesInSwitch: true`

### Naming Conventions
- **Components**: PascalCase (e.g., `ModuleCard.tsx`, `BarEditor.tsx`)
- **Hooks**: camelCase with `use` prefix (e.g., `useConfigStore`, `useValidation`)
- **Utilities**: camelCase (e.g., `stripJsoncComments`)
- **Types/Interfaces**: PascalCase (e.g., `ConfigState`, `ModuleInstance`)
- **Constants**: PascalCase for schemas, UPPER_SNAKE_CASE for true constants

### File Organization
- One component per file
- Co-locate related files in same directory
- Use `index.ts` for barrel exports
- Separate types in `types/` directory
- Keep schemas in `schemas/` directory

### Module Structure
```typescript
// File header comment
// ============================================================================
// COMPONENT/MODULE NAME
// ============================================================================

// Imports
import { ... } from '...'

// Types/Interfaces
interface MyType { ... }

// Component/Implementation
export function MyComponent() { ... }
```

## Rust

### Configuration
- **Rust Edition 2021**
- Uses standard Rust formatting (rustfmt)

### Error Handling
- Custom `AppError` enum with `thiserror`
- Result type alias: `pub type Result<T> = std::result::Result<T, AppError>`
- Structured error types: Io, Config, Parse, Validation, NotFound, etc.
- Errors are serializable (serde) for Tauri IPC

### Naming Conventions
- **Modules**: snake_case (e.g., `config/parser.rs`)
- **Functions**: snake_case (e.g., `strip_jsonc_comments`)
- **Types/Structs**: PascalCase (e.g., `WaybarConfigFile`, `ConfigPaths`)
- **Tauri commands**: snake_case with `#[tauri::command]` attribute

### Module Structure
```rust
// File header comment
// ============================================================================
// MODULE NAME
// ============================================================================

// Public exports
pub mod parser;
pub mod writer;

// Types
pub struct MyType { ... }

// Implementation
impl MyType { ... }
```

## State Management Pattern

### Zustand Store Structure
```typescript
// 1. Define state and actions separately
interface MyState { ... }
interface MyActions { ... }
type MyStore = MyState & MyActions

// 2. Use Immer for mutations
// 3. Use temporal() for undo/redo (config-store only)
export const useMyStore = create<MyStore>()(
  devtools(
    persist(
      temporal(  // Only for config-store
        immer((set) => ({
          // state
          items: [],
          // actions
          addItem: (item) => set((state) => {
            state.items.push(item)  // Direct mutation with Immer
          })
        }))
      )
    )
  )
)
```

### Important Patterns
- **ALWAYS use direct mutations with Immer** (no spreads)
- Only `config-store` uses `temporal()` middleware
- UI and validation stores do NOT use temporal
- Access undo/redo: `useConfigStore.temporal.getState()`

## Validation

### Zod Schema Pattern
```typescript
// Define schema
export const MySchema = z.object({
  field: z.string().min(1),
  optional: z.number().optional(),
})

// Export inferred type
export type MyType = z.infer<typeof MySchema>
```

### Field Path Convention
- Use dot notation: `'modules.0.format'`
- Array indices in paths: `'bars.1.height'`
- Query validation store by path: `useFieldErrors('modules.0.format')`

## Component Organization

### Directory Structure
- `components/layout/` - App layout (Sidebar, StatusBar, MainLayout)
- `components/bars/` - Bar-related components
- `components/modules/` - Module components and editors
- `components/styles/` - Style editor components
- `components/dialogs/` - Modals and dialogs
- `components/common/` - Reusable UI components

### File Naming
- Component files: `ComponentName.tsx`
- Test files: `ComponentName.test.tsx` or `feature.test.ts`
- Type files: `types.ts` or `config.ts`
- Schema files: `schema-name.ts`
