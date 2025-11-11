// ============================================================================
// UI STATE STORE
// ============================================================================

import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'
import type { Notification } from '../components/common/Notification'

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

  // Main app tab (Bars vs Styles)
  activeMainTab: 'bars' | 'styles'

  // Active tab in bar editor
  activeEditorTab: 'general' | 'modules' | 'styling'

  // Active tab in style editor
  activeStyleTab: 'visual' | 'code' | 'preview'

  // Notifications
  notifications: Notification[]
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
  setActiveMainTab: (tab: 'bars' | 'styles') => void
  setActiveEditorTab: (tab: 'general' | 'modules' | 'styling') => void
  setActiveStyleTab: (tab: 'visual' | 'code' | 'preview') => void

  // Notifications
  showNotification: (notification: Omit<Notification, 'id'>) => void
  removeNotification: (id: string) => void
  clearNotifications: () => void
}

type UIStore = UIState & UIActions

// ============================================================================
// STORE IMPLEMENTATION
// ============================================================================

export const useUIStore = create<UIStore>()(
  devtools(
    persist(
      (set) => ({
      // ============================================================================
      // INITIAL STATE
      // ============================================================================
      selectedModuleId: null,
      isModuleEditorOpen: false,
      isSidebarCollapsed: false,
      theme: 'dark',
      activeMainTab: 'bars',
      activeEditorTab: 'general',
      activeStyleTab: 'visual',
      notifications: [],

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

      setActiveMainTab: (tab) => set({ activeMainTab: tab }),

      setActiveEditorTab: (tab) => set({ activeEditorTab: tab }),

      setActiveStyleTab: (tab) => set({ activeStyleTab: tab }),

      // ============================================================================
      // NOTIFICATION ACTIONS
      // ============================================================================

      showNotification: (notification) =>
        set((state) => ({
          notifications: [
            ...state.notifications,
            {
              ...notification,
              id: crypto.randomUUID(),
            },
          ],
        })),

      removeNotification: (id) =>
        set((state) => ({
          notifications: state.notifications.filter((n) => n.id !== id),
        })),

      clearNotifications: () => set({ notifications: [] }),
      }),
      {
        name: 'waybar-ui-storage',
        partialize: (state) => ({
          theme: state.theme,
          isSidebarCollapsed: state.isSidebarCollapsed,
        }),
      }
    ),
    { name: 'UIStore' }
  )
)
