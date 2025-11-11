// ============================================================================
// CONFIG STORE - Zustand State Management
// ============================================================================

import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'
import { temporal } from 'zundo'
import type {
  WaybarConfig,
  BarDefinition,
  ModuleInstance,
  StyleDefinition,
} from '../lib/types/config'

// ============================================================================
// STATE INTERFACES
// ============================================================================

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

// ============================================================================
// STORE IMPLEMENTATION
// ============================================================================

export const useConfigStore = create<ConfigStore>()(
  devtools(
    persist(
      temporal(
        immer((set) => ({
          // ============================================================================
          // INITIAL STATE
          // ============================================================================
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

          // ============================================================================
          // BAR ACTIONS
          // ============================================================================

          createBar: (bar) =>
            set((state) => {
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

          updateBar: (id, updates) =>
            set((state) => {
              const bar = state.config.bars.find((b) => b.id === id)
              if (bar) {
                Object.assign(bar, updates)
                state.isDirty = true
              }
            }),

          deleteBar: (id) =>
            set((state) => {
              state.config.bars = state.config.bars.filter((b) => b.id !== id)
              if (state.currentBarId === id) {
                state.currentBarId = state.config.bars[0]?.id || null
              }
              state.isDirty = true
            }),

          duplicateBar: (id) =>
            set((state) => {
              const bar = state.config.bars.find((b) => b.id === id)
              if (bar) {
                const newBar: BarDefinition = {
                  ...JSON.parse(JSON.stringify(bar)),
                  id: crypto.randomUUID(),
                  name: `${bar.name} (Copy)`,
                  modules: bar.modules.map((m) => ({
                    ...m,
                    id: crypto.randomUUID(),
                  })),
                }
                state.config.bars.push(newBar)
                state.isDirty = true
              }
            }),

          setCurrentBar: (id) => set({ currentBarId: id }),

          // ============================================================================
          // MODULE ACTIONS
          // ============================================================================

          addModule: (barId, module) =>
            set((state) => {
              const bar = state.config.bars.find((b) => b.id === barId)
              if (bar) {
                const newModule: ModuleInstance = {
                  ...module,
                  id: crypto.randomUUID(),
                }
                bar.modules.push(newModule)
                state.isDirty = true
              }
            }),

          updateModule: (barId, moduleId, updates) =>
            set((state) => {
              const bar = state.config.bars.find((b) => b.id === barId)
              if (bar) {
                const module = bar.modules.find((m) => m.id === moduleId)
                if (module) {
                  Object.assign(module, updates)
                  state.isDirty = true
                }
              }
            }),

          deleteModule: (barId, moduleId) =>
            set((state) => {
              const bar = state.config.bars.find((b) => b.id === barId)
              if (bar) {
                bar.modules = bar.modules.filter((m) => m.id !== moduleId)
                state.isDirty = true
              }
            }),

          reorderModules: (barId, position, moduleIds) =>
            set((state) => {
              const bar = state.config.bars.find((b) => b.id === barId)
              if (bar) {
                const positionModules = bar.modules.filter((m) => m.position === position)
                positionModules.forEach((module) => {
                  const newIndex = moduleIds.indexOf(module.id)
                  if (newIndex !== -1) {
                    module.order = newIndex
                  }
                })
                state.isDirty = true
              }
            }),

          moveModule: (barId, moduleId, toPosition, toIndex) =>
            set((state) => {
              const bar = state.config.bars.find((b) => b.id === barId)
              if (bar) {
                const module = bar.modules.find((m) => m.id === moduleId)
                if (module) {
                  module.position = toPosition
                  module.order = toIndex
                  state.isDirty = true
                }
              }
            }),

          // ============================================================================
          // STYLE ACTIONS
          // ============================================================================

          addStyle: (style) =>
            set((state) => {
              const newStyle: StyleDefinition = {
                ...style,
                id: crypto.randomUUID(),
              }
              state.config.styles.push(newStyle)
              state.isDirty = true
            }),

          updateStyle: (id, updates) =>
            set((state) => {
              const style = state.config.styles.find((s) => s.id === id)
              if (style) {
                Object.assign(style, updates)
                state.isDirty = true
              }
            }),

          deleteStyle: (id) =>
            set((state) => {
              state.config.styles = state.config.styles.filter((s) => s.id !== id)
              state.isDirty = true
            }),

          // ============================================================================
          // FILE OPERATIONS
          // ============================================================================

          loadConfig: (config) =>
            set({
              config,
              currentBarId: config.bars[0]?.id || null,
              isDirty: false,
              lastSaved: new Date(),
            }),

          saveConfig: async () => {
            // TODO: Implement actual save using Tauri commands
            // const state = get()
            // await invoke('save_config', { config: state.config })
            // For now, just mark as saved
            set({
              isDirty: false,
              lastSaved: new Date(),
            })
          },

          resetConfig: () =>
            set((state) => {
              state.config.bars = []
              state.config.styles = []
              state.currentBarId = null
              state.isDirty = false
            }),

          // ============================================================================
          // METADATA
          // ============================================================================

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

// ============================================================================
// SELECTOR HOOKS (Performance Optimization)
// ============================================================================

/**
 * Get the currently selected bar
 */
export const useCurrentBar = () =>
  useConfigStore((state) => {
    const barId = state.currentBarId
    return barId ? state.config.bars.find((b) => b.id === barId) : null
  })

/**
 * Get all modules for the current bar
 */
export const useCurrentBarModules = () =>
  useConfigStore((state) => {
    const barId = state.currentBarId
    const bar = barId ? state.config.bars.find((b) => b.id === barId) : null
    return bar?.modules || []
  })

/**
 * Get modules for a specific position in the current bar
 */
export const useModulesByPosition = (position: 'left' | 'center' | 'right') =>
  useConfigStore((state) => {
    const barId = state.currentBarId
    const bar = barId ? state.config.bars.find((b) => b.id === barId) : null
    return (
      bar?.modules
        .filter((m) => m.position === position)
        .sort((a, b) => a.order - b.order) || []
    )
  })
