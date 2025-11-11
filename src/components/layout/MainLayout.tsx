// ============================================================================
// MAIN LAYOUT - App Shell Layout
// ============================================================================

import { ReactNode } from 'react'
import { useUIStore } from '../../store'
import Sidebar from './Sidebar'
import StatusBar from './StatusBar'
import { ModuleEditor } from '../modules'

// ============================================================================
// TYPES
// ============================================================================

interface MainLayoutProps {
  children: ReactNode
}

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * Main application layout with sidebar, editor panel, and status bar
 *
 * Layout structure:
 * - Sidebar: Fixed left (280px when expanded, 64px when collapsed)
 * - Editor Panel: Flexible center area (children)
 * - Status Bar: Fixed bottom (32px)
 */
export default function MainLayout({ children }: MainLayoutProps) {
  const isSidebarCollapsed = useUIStore((state) => state.isSidebarCollapsed)

  return (
    <div className="flex h-screen w-screen flex-col overflow-hidden bg-gray-900 text-gray-100">
      {/* Main Content Area - Sidebar + Editor */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar - Fixed width, scrollable */}
        <aside
          className={`
            flex-shrink-0
            overflow-y-auto
            border-r
            border-gray-800
            bg-gray-950
            transition-all
            duration-300
            ease-in-out
            ${isSidebarCollapsed ? 'w-16' : 'w-70'}
          `}
        >
          <Sidebar />
        </aside>

        {/* Editor Panel - Flexible, scrollable */}
        <main className="flex-1 overflow-y-auto bg-gray-900">
          {children}
        </main>
      </div>

      {/* Status Bar - Fixed height */}
      <footer className="flex-shrink-0 border-t border-gray-800 bg-gray-950">
        <StatusBar />
      </footer>

      {/* Module Editor Modal - Rendered outside main layout */}
      <ModuleEditor />
    </div>
  )
}
