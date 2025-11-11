// ============================================================================
// SIDEBAR - Navigation and Quick Access
// ============================================================================

import { useState } from 'react'
import {
  LayoutDashboard,
  Package,
  Palette,
  FileText,
  Settings,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import { useUIStore } from '../../store'

// ============================================================================
// TYPES
// ============================================================================

type SidebarSection = 'bars' | 'modules' | 'styles' | 'templates' | 'settings'

interface SidebarItemProps {
  icon: React.ReactNode
  label: string
  active: boolean
  collapsed: boolean
  onClick: () => void
}

// ============================================================================
// SIDEBAR ITEM COMPONENT
// ============================================================================

function SidebarItem({ icon, label, active, collapsed, onClick }: SidebarItemProps) {
  return (
    <button
      onClick={onClick}
      className={`
        flex
        w-full
        items-center
        gap-3
        px-4
        py-3
        transition-colors
        ${active ? 'bg-blue-600 text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-gray-100'}
        ${collapsed ? 'justify-center' : ''}
      `}
      title={collapsed ? label : undefined}
    >
      <span className="flex-shrink-0">{icon}</span>
      {!collapsed && <span className="text-sm font-medium">{label}</span>}
    </button>
  )
}

// ============================================================================
// MAIN SIDEBAR COMPONENT
// ============================================================================

/**
 * Sidebar navigation component
 *
 * Sections:
 * - Bars: List of configured bars
 * - Modules: Module palette
 * - Styles: Style editor
 * - Templates: Configuration templates
 * - Settings: Application settings
 */
export default function Sidebar() {
  const [activeSection, setActiveSection] = useState<SidebarSection>('bars')
  const { isSidebarCollapsed, toggleSidebar } = useUIStore((state) => ({
    isSidebarCollapsed: state.isSidebarCollapsed,
    toggleSidebar: state.toggleSidebar,
  }))

  return (
    <div className="flex h-full flex-col">
      {/* Header with Toggle */}
      <div className="flex items-center justify-between border-b border-gray-800 p-4">
        {!isSidebarCollapsed && (
          <h1 className="text-lg font-bold text-blue-400">Waybar Config</h1>
        )}
        <button
          onClick={toggleSidebar}
          className="rounded p-1 text-gray-400 hover:bg-gray-800 hover:text-gray-100"
          title={isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isSidebarCollapsed ? (
            <ChevronRight className="h-5 w-5" />
          ) : (
            <ChevronLeft className="h-5 w-5" />
          )}
        </button>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 overflow-y-auto py-2">
        <SidebarItem
          icon={<LayoutDashboard className="h-5 w-5" />}
          label="Bars"
          active={activeSection === 'bars'}
          collapsed={isSidebarCollapsed}
          onClick={() => setActiveSection('bars')}
        />
        <SidebarItem
          icon={<Package className="h-5 w-5" />}
          label="Modules"
          active={activeSection === 'modules'}
          collapsed={isSidebarCollapsed}
          onClick={() => setActiveSection('modules')}
        />
        <SidebarItem
          icon={<Palette className="h-5 w-5" />}
          label="Styles"
          active={activeSection === 'styles'}
          collapsed={isSidebarCollapsed}
          onClick={() => setActiveSection('styles')}
        />
        <SidebarItem
          icon={<FileText className="h-5 w-5" />}
          label="Templates"
          active={activeSection === 'templates'}
          collapsed={isSidebarCollapsed}
          onClick={() => setActiveSection('templates')}
        />
      </nav>

      {/* Settings at Bottom */}
      <div className="border-t border-gray-800">
        <SidebarItem
          icon={<Settings className="h-5 w-5" />}
          label="Settings"
          active={activeSection === 'settings'}
          collapsed={isSidebarCollapsed}
          onClick={() => setActiveSection('settings')}
        />
      </div>
    </div>
  )
}
