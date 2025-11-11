# Design Patterns and Guidelines

## State Management Patterns

### 1. Zustand Store Pattern
```typescript
// Separate state and actions
interface MyState {
  items: Item[]
  selectedId: string | null
}

interface MyActions {
  addItem: (item: Item) => void
  selectItem: (id: string) => void
}

type MyStore = MyState & MyActions

// Use middleware in order: devtools → persist → temporal → immer
export const useMyStore = create<MyStore>()(
  devtools(
    persist(
      temporal(  // Only for undo/redo stores
        immer((set) => ({
          // Initial state
          items: [],
          selectedId: null,
          
          // Actions with Immer mutations
          addItem: (item) => set((state) => {
            state.items.push(item)  // Direct mutation
          }),
          selectItem: (id) => set((state) => {
            state.selectedId = id
          }),
        }))
      )
    )
  )
)
```

### 2. Immer Mutation Pattern
**ALWAYS use direct mutations with Immer:**
```typescript
// ✅ Correct - Direct mutation
addModule: (module) => set((state) => {
  state.modules.push(module)
  state.isDirty = true
})

// ✅ Correct - Nested mutation
updateModule: (id, updates) => set((state) => {
  const module = state.modules.find(m => m.id === id)
  if (module) {
    Object.assign(module, updates)
  }
})

// ❌ Wrong - Spreads bypass Immer
addModule: (module) => set((state) => ({
  ...state,
  modules: [...state.modules, module]
}))
```

### 3. Temporal (Undo/Redo) Pattern
**Only use temporal for user-editable state:**
```typescript
// config-store: YES - user edits configuration
export const useConfigStore = create<ConfigStore>()(
  temporal(immer(...))
)

// ui-store: NO - ephemeral UI state
export const useUIStore = create<UIStore>()(
  immer(...)  // No temporal
)

// validation-store: NO - derived from config
export const useValidationStore = create<ValidationStore>()(
  immer(...)  // No temporal
)
```

**Accessing undo/redo:**
```typescript
const { undo, redo, clear } = useConfigStore.temporal.getState()
```

## Validation Patterns

### 1. Zod Schema Definition
```typescript
// Base schema
export const ModuleSchema = z.object({
  id: z.string(),
  type: z.string(),
  position: z.enum(['left', 'center', 'right']),
})

// Module-specific schema
export const BatteryModuleSchema = ModuleSchema.extend({
  type: z.literal('battery'),
  format: z.string().default('{capacity}%'),
  states: z.object({
    warning: z.number().int().min(0).max(100).optional(),
    critical: z.number().int().min(0).max(100).optional(),
  }).optional(),
})

// Export inferred type
export type BatteryModule = z.infer<typeof BatteryModuleSchema>
```

### 2. Validation Hook Pattern
```typescript
// Custom hook for validation
export function useValidation() {
  const config = useConfigStore(state => state.config)
  const { setErrors, clearErrors } = useValidationStore()
  
  useEffect(() => {
    const result = ConfigSchema.safeParse(config)
    if (!result.success) {
      setErrors(result.error.flatten())
    } else {
      clearErrors()
    }
  }, [config])
}
```

### 3. Field-Level Error Display
```typescript
// Query errors by field path
const errors = useFieldErrors('modules.0.format')
const hasError = useHasFieldError('bars.1.height')

// Show in component
{errors.map(error => (
  <ValidationMessage key={error} type="error">
    {error}
  </ValidationMessage>
))}
```

## Component Patterns

### 1. Custom Hook Pattern
```typescript
// Extract logic to custom hooks
export function useWaybar() {
  const [isRunning, setIsRunning] = useState(false)
  
  const reload = useCallback(async () => {
    await invoke('reload_waybar')
  }, [])
  
  const restart = useCallback(async () => {
    await invoke('restart_waybar')
  }, [])
  
  return { isRunning, reload, restart }
}
```

### 2. Error Boundary Pattern
```typescript
// Wrap components with error boundaries
<ErrorBoundary fallback={<ErrorFallback />}>
  <ModuleEditor />
</ErrorBoundary>
```

### 3. Loading State Pattern
```typescript
// Consistent loading states
{isLoading && <LoadingSpinner />}
{error && <ErrorMessage error={error} />}
{data && <ContentComponent data={data} />}
```

## Tauri Integration Patterns

### 1. Command Definition Pattern
```rust
// Backend command
#[tauri::command]
pub async fn my_command(param: String) -> Result<MyType> {
    // Implementation
    Ok(result)
}

// Register in lib.rs
tauri::Builder::default()
    .invoke_handler(tauri::generate_handler![
        my_command,
        // ... other commands
    ])
```

```typescript
// Frontend wrapper
export async function myCommand(param: string): Promise<MyType> {
  return invoke<MyType>('my_command', { param })
}
```

### 2. Error Handling Pattern
```rust
// Backend returns structured errors
pub enum AppError {
    Validation(String),
    NotFound(String),
    // ...
}

// Frontend catches and displays
try {
  await myCommand(param)
} catch (error) {
  if (error.type === 'Validation') {
    showValidationError(error.message)
  } else if (error.type === 'NotFound') {
    showNotFoundError(error.message)
  }
}
```

## File Organization Patterns

### 1. Module Exports
```typescript
// components/modules/index.ts - Barrel export
export { ModuleCard } from './ModuleCard'
export { ModulePalette } from './ModulePalette'
export { ModuleEditor } from './ModuleEditor'
export * from './editors'

// Import from barrel
import { ModuleCard, ModulePalette } from '@/components/modules'
```

### 2. Type Organization
```typescript
// lib/types/config.ts
export interface WaybarConfig {
  bars: BarDefinition[]
  styles: StyleDefinition[]
}

export interface BarDefinition {
  id: string
  name: string
  modules: ModuleInstance[]
}

// Import types
import type { WaybarConfig, BarDefinition } from '@/lib/types/config'
```

## Drag & Drop Patterns (dnd-kit)

### 1. Draggable Item Pattern
```typescript
const { attributes, listeners, setNodeRef, transform } = useDraggable({
  id: module.id,
  data: { type: 'module', module },
})

return (
  <div
    ref={setNodeRef}
    {...attributes}
    {...listeners}
    style={{ transform: CSS.Translate.toString(transform) }}
  >
    {children}
  </div>
)
```

### 2. Droppable Zone Pattern
```typescript
const { setNodeRef, isOver } = useDroppable({
  id: `zone-${position}`,
  data: { type: 'zone', position },
})

return (
  <div
    ref={setNodeRef}
    className={isOver ? 'highlight' : ''}
  >
    {children}
  </div>
)
```

### 3. Drag End Handler Pattern
```typescript
function handleDragEnd(event: DragEndEvent) {
  const { active, over } = event
  
  if (!over) return
  
  if (active.data.current?.type === 'module-template') {
    // Create new module from template
    addModule(over.data.current.position, active.data.current.module)
  } else if (active.data.current?.type === 'module') {
    // Move existing module
    moveModule(active.id, over.data.current.position, over.data.current.index)
  }
}
```

## Anti-Patterns to Avoid

### ❌ Don't Use Spreads with Immer
```typescript
// Wrong - bypasses Immer
set((state) => ({ ...state, items: [...state.items, newItem] }))

// Correct
set((state) => { state.items.push(newItem) })
```

### ❌ Don't Add Temporal to All Stores
```typescript
// Wrong - UI state shouldn't be undoable
export const useUIStore = create(temporal(immer(...)))

// Correct
export const useUIStore = create(immer(...))
```

### ❌ Don't Mutate State Outside Actions
```typescript
// Wrong
const items = useStore(state => state.items)
items.push(newItem)  // Direct mutation

// Correct
const addItem = useStore(state => state.addItem)
addItem(newItem)
```

### ❌ Don't Use `any` Type
```typescript
// Wrong
function processData(data: any) { ... }

// Correct
function processData(data: unknown) {
  if (isValidData(data)) {
    // Type guard narrows to specific type
  }
}
```
