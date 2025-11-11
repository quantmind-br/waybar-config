# Zustand State Management Research

Research findings for managing complex configuration state with Zustand.

**Source**: Official Zustand docs and configuration UI patterns.

## Quick Reference

- **Docs**: https://zustand.docs.pmnd.rs/
- **GitHub**: https://github.com/pmndrs/zustand
- **Bundle Size**: 1.5KB

## Critical Patterns for Configuration UIs

### 1. Always Use Selectors (Performance)

```typescript
// ❌ BAD - Re-renders on ANY state change
const { theme, colors, fontSize } = useConfigStore()

// ✅ GOOD - Only re-renders when specific value changes
const theme = useConfigStore(state => state.config.theme)
const colors = useConfigStore(state => state.config.colors)
```

### 2. Use Immer Middleware for Nested Updates

```typescript
import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'

const useConfigStore = create<ConfigStore>()(
  immer((set) => ({
    config: defaultConfig,

    // Immer allows "mutations" (actually immutable)
    updateThemeColor: (key, value) =>
      set((state) => {
        state.config.appearance.colors[key] = value
      })
  }))
)
```

**Benefits**: Reduces code by 70% for nested updates, prevents mutation bugs.

### 3. Undo/Redo with Zundo

```bash
npm install zundo
```

```typescript
import { temporal } from 'zundo'

const useConfigStore = create<ConfigStore>()(
  temporal(
    (set) => ({
      config: defaultConfig,
      updateConfig: (updates) => set((state) => ({ ...state, ...updates }))
    }),
    { limit: 50 } // Keep last 50 states
  )
)

// In component
const { undo, redo, clear, pastStates, futureStates } =
  useConfigStore.temporal.getState()
```

### 4. Middleware Stack Order

```typescript
const useConfigStore = create<ConfigStore>()(
  devtools(
    persist(
      temporal(
        immer((set) => ({ /* state */ })),
        { limit: 50 }
      ),
      { name: 'config-storage' }
    ),
    { name: 'ConfigStore' }
  )
)
```

**Order**: immer → temporal → persist → devtools

### 5. Persist Middleware for Config Saving

```typescript
import { persist } from 'zustand/middleware'

persist(
  (set) => ({ /* state */ }),
  {
    name: 'waybar-config-storage',
    partialize: (state) => ({ config: state.config }), // Only persist config
    version: 1,
    migrate: (persistedState: any, version: number) => {
      // Handle version migrations
      return persistedState
    }
  }
)
```

### 6. Real-Time Preview Pattern (Debounced)

```typescript
import { debounce } from 'lodash'

const useConfigStore = create<ConfigStore>((set) => {
  const updatePreview = (value: any) => {
    set({ previewValue: value })
  }

  const updateCommitted = debounce((value: any) => {
    set({ committedValue: value })
  }, 300)

  return {
    previewValue: null,
    committedValue: null,
    updateValue: (value) => {
      updatePreview(value)
      updateCommitted(value)
    }
  }
})
```

### 7. Separate Actions from State (Avoid Re-subscriptions)

```typescript
const useConfigStore = create<ConfigStore>((set) => ({
  // State
  config: defaultConfig,

  // Actions namespace
  actions: {
    updateTheme: (theme) =>
      set((state) => ({ config: { ...state.config, theme } })),
  }
}))

// Usage - actions don't trigger re-renders
function Component() {
  const theme = useConfigStore((state) => state.config.theme)
  const { updateTheme } = useConfigStore((state) => state.actions)
}
```

### 8. Using useShallow for Multiple Values

```typescript
import { useShallow } from 'zustand/react/shallow'

// ✅ Shallow comparison prevents unnecessary re-renders
const { theme, colors } = useConfigStore(
  useShallow((state) => ({
    theme: state.config.theme,
    colors: state.config.colors
  }))
)
```

## Common Pitfalls

1. **Don't create stores inside components** - create at module level
2. **Don't mutate state directly** - always use set()
3. **Don't subscribe to entire store** - use selectors
4. **Don't forget shallow comparison** - for arrays/objects
