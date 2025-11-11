// ============================================================================
// INTEGRATION TEST: Module Drag and Drop
// Test: Drag module from palette → configure → save
// ============================================================================

import { describe, it, expect, beforeEach } from 'vitest'
import { screen, fireEvent } from '@testing-library/react'
import { renderWithProviders, createTestBar } from '../test-utils'
import { useConfigStore } from '../../store/config-store'
import { setupTauriMocks, resetTauriMocks } from '../mocks/tauri'
import { ReactNode } from 'react'

// Setup Tauri mocks
setupTauriMocks()

// Mock components for testing drag behavior
function ModulePaletteItem({ type, label }: { type: string; label: string }) {
  return (
    <div data-testid={`palette-${type}`} draggable>
      {label}
    </div>
  )
}

function ModuleDropZone({
  position,
  onDrop,
  children,
}: {
  position: 'left' | 'center' | 'right'
  onDrop: (type: string) => void
  children: ReactNode
}) {
  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault()
    const moduleType = event.dataTransfer.getData('moduleType')
    if (moduleType) {
      onDrop(moduleType)
    }
  }

  return (
    <div
      data-testid={`dropzone-${position}`}
      onDrop={handleDrop}
      onDragOver={(e) => e.preventDefault()}
    >
      {children}
    </div>
  )
}

function ModuleEditor({
  module,
  onSave,
  onClose,
}: {
  module: { type: string; config: Record<string, unknown> }
  onSave: (config: Record<string, unknown>) => void
  onClose: () => void
}) {
  return (
    <div data-testid="module-editor">
      <h2>Edit {module.type}</h2>
      <input
        data-testid="config-format"
        defaultValue={module.config.format as string}
        onChange={(e) => {
          module.config.format = e.target.value
        }}
      />
      <button data-testid="save-btn" onClick={() => onSave(module.config)}>
        Save
      </button>
      <button data-testid="close-btn" onClick={onClose}>
        Close
      </button>
    </div>
  )
}

describe('Module Drag and Drop Integration', () => {
  beforeEach(() => {
    // Reset store to initial state
    useConfigStore.getState().resetConfig()
    resetTauriMocks()

    // Create a test bar
    const store = useConfigStore.getState()
    store.createBar(createTestBar())
  })

  it('should drag module from palette to drop zone', async () => {
    const store = useConfigStore.getState()
    const barId = store.config.bars[0].id

    // Render module palette
    const { getByTestId } = renderWithProviders(
      <>
        <ModulePaletteItem type="clock" label="Clock" />
        <ModuleDropZone
          position="left"
          onDrop={(type) => {
            store.addModule(barId, {
              type: type as any,
              position: 'left',
              order: 0,
              enabled: true,
              config: {},
            })
          }}
        >
          <div data-testid="modules-left">Left Zone</div>
        </ModuleDropZone>
      </>
    )

    // Simulate drag
    const paletteItem = getByTestId('palette-clock')
    const dropZone = getByTestId('dropzone-left')

    // Start drag
    const dragStartEvent = new DragEvent('dragstart', { bubbles: true })
    Object.defineProperty(dragStartEvent, 'dataTransfer', {
      value: {
        setData: (type: string, value: string) => {
          if (type === 'moduleType') {
            dragStartEvent.dataTransfer!.getData = () => value
          }
        },
        getData: () => 'clock',
      },
    })
    fireEvent(paletteItem, dragStartEvent)

    // Drop on zone
    const dropEvent = new DragEvent('drop', { bubbles: true })
    Object.defineProperty(dropEvent, 'dataTransfer', {
      value: {
        getData: (type: string) => (type === 'moduleType' ? 'clock' : ''),
      },
    })
    fireEvent(dropZone, dropEvent)

    // Verify module was added
    const state = useConfigStore.getState()
    const bar = state.config.bars[0]
    expect(bar.modules).toHaveLength(1)
    expect(bar.modules[0].type).toBe('clock')
    expect(bar.modules[0].position).toBe('left')
  })

  it('should configure dragged module and save', async () => {
    const store = useConfigStore.getState()
    const barId = store.config.bars[0].id

    // Add a clock module
    store.addModule(barId, {
      type: 'clock',
      position: 'left',
      order: 0,
      enabled: true,
      config: {
        format: '{:%H:%M}',
      },
    })

    const state = useConfigStore.getState()
    const module = state.config.bars[0].modules[0]

    // Open editor
    const { getByTestId } = renderWithProviders(
      <ModuleEditor
        module={module}
        onSave={(config) => {
          store.updateModule(barId, module.id, { config })
        }}
        onClose={() => {}}
      />
    )

    // Verify editor is open
    expect(screen.getByTestId('module-editor')).toBeDefined()

    // Modify configuration
    const formatInput = getByTestId('config-format')
    fireEvent.change(formatInput, { target: { value: '{:%Y-%m-%d %H:%M}' } })

    // Save changes
    const saveBtn = getByTestId('save-btn')
    fireEvent.click(saveBtn)

    // Verify configuration was updated
    const updatedState = useConfigStore.getState()
    const updatedModule = updatedState.config.bars[0].modules[0]
    expect(updatedModule.config.format).toBe('{:%Y-%m-%d %H:%M}')
    expect(updatedState.isDirty).toBe(true)
  })

  it('should reorder modules within a zone', () => {
    const store = useConfigStore.getState()
    const barId = store.config.bars[0].id

    // Add multiple modules to left zone
    store.addModule(barId, {
      type: 'clock',
      position: 'left',
      order: 0,
      enabled: true,
      config: {},
    })

    store.addModule(barId, {
      type: 'battery',
      position: 'left',
      order: 1,
      enabled: true,
      config: {},
    })

    store.addModule(barId, {
      type: 'cpu',
      position: 'left',
      order: 2,
      enabled: true,
      config: {},
    })

    // Verify initial order
    let state = useConfigStore.getState()
    let leftModules = state.config.bars[0].modules
      .filter((m) => m.position === 'left')
      .sort((a, b) => a.order - b.order)

    expect(leftModules[0].type).toBe('clock')
    expect(leftModules[1].type).toBe('battery')
    expect(leftModules[2].type).toBe('cpu')

    // Reorder: move battery to first position
    const moduleIds = leftModules.map((m) => m.id)
    const reorderedIds = [moduleIds[1], moduleIds[0], moduleIds[2]] // battery, clock, cpu

    store.reorderModules(barId, 'left', reorderedIds)

    // Verify new order
    state = useConfigStore.getState()
    leftModules = state.config.bars[0].modules
      .filter((m) => m.position === 'left')
      .sort((a, b) => a.order - b.order)

    expect(leftModules[0].type).toBe('battery')
    expect(leftModules[1].type).toBe('clock')
    expect(leftModules[2].type).toBe('cpu')
  })

  it('should move module between zones', () => {
    const store = useConfigStore.getState()
    const barId = store.config.bars[0].id

    // Add modules to different zones
    store.addModule(barId, {
      type: 'clock',
      position: 'left',
      order: 0,
      enabled: true,
      config: {},
    })

    store.addModule(barId, {
      type: 'battery',
      position: 'right',
      order: 0,
      enabled: true,
      config: {},
    })

    // Verify initial positions
    let state = useConfigStore.getState()
    let clockModule = state.config.bars[0].modules.find((m) => m.type === 'clock')
    let batteryModule = state.config.bars[0].modules.find((m) => m.type === 'battery')

    expect(clockModule?.position).toBe('left')
    expect(batteryModule?.position).toBe('right')

    // Move clock from left to center
    store.moveModule(barId, clockModule!.id, 'center', 0)

    // Verify new position
    state = useConfigStore.getState()
    clockModule = state.config.bars[0].modules.find((m) => m.type === 'clock')
    expect(clockModule?.position).toBe('center')
    expect(clockModule?.order).toBe(0)
  })

  it('should delete module from zone', () => {
    const store = useConfigStore.getState()
    const barId = store.config.bars[0].id

    // Add a module
    store.addModule(barId, {
      type: 'clock',
      position: 'left',
      order: 0,
      enabled: true,
      config: {},
    })

    // Verify module exists
    let state = useConfigStore.getState()
    expect(state.config.bars[0].modules).toHaveLength(1)

    // Delete module
    const moduleId = state.config.bars[0].modules[0].id
    store.deleteModule(barId, moduleId)

    // Verify module was deleted
    state = useConfigStore.getState()
    expect(state.config.bars[0].modules).toHaveLength(0)
    expect(state.isDirty).toBe(true)
  })

  it('should handle multiple module instances with unique IDs', () => {
    const store = useConfigStore.getState()
    const barId = store.config.bars[0].id

    // Add two battery modules with custom names
    store.addModule(barId, {
      type: 'battery',
      customName: 'bat0',
      position: 'left',
      order: 0,
      enabled: true,
      config: {
        bat: 'BAT0',
      },
    })

    store.addModule(barId, {
      type: 'battery',
      customName: 'bat1',
      position: 'left',
      order: 1,
      enabled: true,
      config: {
        bat: 'BAT1',
      },
    })

    // Verify both modules exist with unique IDs
    const state = useConfigStore.getState()
    const batteryModules = state.config.bars[0].modules.filter((m) => m.type === 'battery')

    expect(batteryModules).toHaveLength(2)
    expect(batteryModules[0].id).not.toBe(batteryModules[1].id)
    expect(batteryModules[0].customName).toBe('bat0')
    expect(batteryModules[1].customName).toBe('bat1')
  })
})
