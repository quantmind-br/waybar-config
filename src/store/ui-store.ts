// ============================================================================
// UI STATE STORE
// ============================================================================

import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

// ============================================================================
// STATE INTERFACES
// ============================================================================

interface UIState {
  // Module editor modal
  selectedModuleId: string | null
  isModuleEditorOpen: boolean

  // Sidebar
  isSidebarCollapsed: boolean

  // Theme
  theme: 'light' | 'dark' | 'system'

  // Active tab in bar editor
  activeEditorTab: 'general' | 'modules' | 'styling'

  // Active tab in style editor
  activeStyleTab: 'visual' | 'code' | 'preview'
}

interface UIActions {
  // Module editor
  selectModule: (id: string | null) => void
  openModuleEditor: (moduleId: string) => void
  closeModuleEditor: () => void

  // Sidebar
  toggleSidebar: () => void
  setSidebarCollapsed: (collapsed: boolean) => void

  // Theme
  setTheme: (theme: 'light' | 'dark' | 'system') => void

  // Tabs
  setActiveEditorTab: (tab: 'general' | 'modules' | 'styling') => void
  setActiveStyleTab: (tab: 'visual' | 'code' | 'preview') => void
}

type UIStore = UIState & UIActions

// ============================================================================
// STORE IMPLEMENTATION
// ============================================================================

export const useUIStore = create<UIStore>()(
  devtools(
    (set) => ({
      // ============================================================================
      // INITIAL STATE
      // ============================================================================
      selectedModuleId: null,
      isModuleEditorOpen: false,
      isSidebarCollapsed: false,
      theme: 'dark',
      activeEditorTab: 'general',
      activeStyleTab: 'visual',

      // ============================================================================
      // MODULE EDITOR ACTIONS
      // ============================================================================

      selectModule: (id) => set({ selectedModuleId: id }),

      openModuleEditor: (moduleId) =>
        set({
          selectedModuleId: moduleId,
          isModuleEditorOpen: true,
        }),

      closeModuleEditor: () =>
        set({
          isModuleEditorOpen: false,
          selectedModuleId: null,
        }),

      // ============================================================================
      // SIDEBAR ACTIONS
      // ============================================================================

      toggleSidebar: () =>
        set((state) => ({
          isSidebarCollapsed: !state.isSidebarCollapsed,
        })),

      setSidebarCollapsed: (collapsed) =>
        set({ isSidebarCollapsed: collapsed }),

      // ============================================================================
      // THEME ACTIONS
      // ============================================================================

      setTheme: (theme) => set({ theme }),

      // ============================================================================
      // TAB ACTIONS
      // ============================================================================

      setActiveEditorTab: (tab) => set({ activeEditorTab: tab }),

      setActiveStyleTab: (tab) => set({ activeStyleTab: tab }),
    }),
    { name: 'UIStore' }
  )
)
