// ============================================================================
// TEST UTILITIES
// Helper functions and custom render for React Testing Library
// ============================================================================

import { ReactElement, ReactNode } from 'react'
import { render, RenderOptions } from '@testing-library/react'
import { DndContext } from '@dnd-kit/core'
import type { WaybarConfig, BarDefinition, ModuleInstance } from '../lib/types/config'

// ============================================================================
// CUSTOM RENDER
// ============================================================================

/**
 * All providers wrapper for testing
 */
function AllProviders({ children }: { children: ReactNode }) {
  return (
    <DndContext>
      {children}
    </DndContext>
  )
}

/**
 * Custom render with all providers
 */
export function renderWithProviders(
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) {
  return render(ui, { wrapper: AllProviders, ...options })
}

// ============================================================================
// TEST DATA FACTORIES
// ============================================================================

/**
 * Create a test bar configuration
 */
export function createTestBar(overrides?: Partial<BarDefinition>): BarDefinition {
  return {
    id: 'test-bar-1',
    name: 'Test Bar',
    enabled: true,
    order: 0,
    config: {
      layer: 'top',
      position: 'top',
      height: 30,
      spacing: 4,
    },
    modules: [],
    ...overrides,
  }
}

/**
 * Create a test module instance
 */
export function createTestModule(overrides?: Partial<ModuleInstance>): ModuleInstance {
  return {
    id: 'test-module-1',
    type: 'clock',
    position: 'left',
    order: 0,
    enabled: true,
    config: {
      format: '{:%H:%M}',
      tooltip: true,
    },
    ...overrides,
  }
}

/**
 * Create a test waybar configuration
 */
export function createTestConfig(overrides?: Partial<WaybarConfig>): WaybarConfig {
  return {
    bars: [createTestBar()],
    styles: [],
    metadata: {
      version: '1.0.0',
      createdAt: new Date().toISOString(),
      modifiedAt: new Date().toISOString(),
      appVersion: '1.0.0',
    },
    ...overrides,
  }
}

/**
 * Create a battery module
 */
export function createBatteryModule(overrides?: Partial<ModuleInstance>): ModuleInstance {
  return createTestModule({
    type: 'battery',
    config: {
      format: '{capacity}% {icon}',
      'format-icons': ['', '', '', '', ''],
      states: {
        warning: 30,
        critical: 15,
      },
    },
    ...overrides,
  })
}

/**
 * Create a network module
 */
export function createNetworkModule(overrides?: Partial<ModuleInstance>): ModuleInstance {
  return createTestModule({
    type: 'network',
    config: {
      format: '{ifname}',
      'format-wifi': '{essid} ({signalStrength}%) ',
      'format-ethernet': '{ipaddr}/{cidr} ',
      'format-disconnected': 'Disconnected ⚠',
    },
    ...overrides,
  })
}

/**
 * Create a workspaces module (Hyprland)
 */
export function createWorkspacesModule(overrides?: Partial<ModuleInstance>): ModuleInstance {
  return createTestModule({
    type: 'hyprland/workspaces',
    config: {
      format: '{name}: {icon}',
      'format-icons': {
        active: '',
        default: '',
      },
    },
    ...overrides,
  })
}

// ============================================================================
// WAIT UTILITIES
// ============================================================================

/**
 * Wait for a condition to be true
 */
export function waitFor(
  condition: () => boolean,
  timeout = 5000,
  interval = 100
): Promise<void> {
  return new Promise((resolve, reject) => {
    const startTime = Date.now()

    const check = () => {
      if (condition()) {
        resolve()
        return
      }

      if (Date.now() - startTime >= timeout) {
        reject(new Error('Timeout waiting for condition'))
        return
      }

      setTimeout(check, interval)
    }

    check()
  })
}

/**
 * Wait for next tick (useful for state updates)
 */
export function nextTick(): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, 0))
}

// ============================================================================
// ASSERTIONS
// ============================================================================

/**
 * Assert that a module exists in the bar
 */
export function assertModuleExists(bar: BarDefinition, moduleType: string): void {
  const module = bar.modules.find((m) => m.type === moduleType)
  if (!module) {
    throw new Error(`Module ${moduleType} not found in bar`)
  }
}

/**
 * Assert that a module has specific config
 */
export function assertModuleConfig(
  bar: BarDefinition,
  moduleType: string,
  config: Record<string, unknown>
): void {
  const module = bar.modules.find((m) => m.type === moduleType)
  if (!module) {
    throw new Error(`Module ${moduleType} not found in bar`)
  }

  for (const [key, value] of Object.entries(config)) {
    if (module.config[key] !== value) {
      throw new Error(
        `Module ${moduleType} config mismatch: expected ${key}=${value}, got ${module.config[key]}`
      )
    }
  }
}

/**
 * Assert that modules are in specific order
 */
export function assertModuleOrder(
  bar: BarDefinition,
  position: 'left' | 'center' | 'right',
  expectedTypes: string[]
): void {
  const modules = bar.modules
    .filter((m) => m.position === position)
    .sort((a, b) => a.order - b.order)

  const actualTypes = modules.map((m) => m.type)

  if (actualTypes.length !== expectedTypes.length) {
    throw new Error(
      `Module count mismatch in ${position}: expected ${expectedTypes.length}, got ${actualTypes.length}`
    )
  }

  for (let i = 0; i < expectedTypes.length; i++) {
    if (actualTypes[i] !== expectedTypes[i]) {
      throw new Error(
        `Module order mismatch in ${position} at index ${i}: expected ${expectedTypes[i]}, got ${actualTypes[i]}`
      )
    }
  }
}

// ============================================================================
// MOCK EVENT HANDLERS
// ============================================================================

/**
 * Create a mock drag event
 */
export function createDragEvent(type: string, dataTransfer?: DataTransfer) {
  return new DragEvent(type, {
    bubbles: true,
    cancelable: true,
    dataTransfer: dataTransfer || new DataTransfer(),
  })
}

/**
 * Create a mock keyboard event
 */
export function createKeyboardEvent(
  type: string,
  key: string,
  modifiers?: {
    ctrl?: boolean
    shift?: boolean
    alt?: boolean
    meta?: boolean
  }
) {
  return new KeyboardEvent(type, {
    key,
    bubbles: true,
    cancelable: true,
    ctrlKey: modifiers?.ctrl ?? false,
    shiftKey: modifiers?.shift ?? false,
    altKey: modifiers?.alt ?? false,
    metaKey: modifiers?.meta ?? false,
  })
}

// Re-export everything from @testing-library/react
export * from '@testing-library/react'
