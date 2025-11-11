// ============================================================================
// INTEGRATION TEST: Configuration Flow
// Test: Load config → modify modules → save config → verify file
// ============================================================================

import { describe, it, expect, beforeEach } from 'vitest'
import { useConfigStore } from '../../store/config-store'
import { setupTauriMocks, resetTauriMocks, mockInvoke } from '../mocks/tauri'
import { createTestBar, createBatteryModule, createNetworkModule } from '../test-utils'
import { loadConfig, saveConfig } from '../../lib/tauri/commands'

// Setup Tauri mocks
setupTauriMocks()

describe('Configuration Flow Integration', () => {
  beforeEach(() => {
    // Reset store to initial state
    useConfigStore.getState().resetConfig()
    resetTauriMocks()
  })

  it('should load config, modify modules, and save successfully', async () => {
    // ========================================
    // STEP 1: Load configuration
    // ========================================
    const loadedConfig = await loadConfig('/home/user/.config/waybar/config')
    expect(loadedConfig).toBeDefined()
    expect(loadedConfig.content).toBeTruthy()

    // Parse loaded config
    const parsedConfig = JSON.parse(loadedConfig.content)
    expect(parsedConfig).toHaveProperty('modules-left')
    expect(parsedConfig).toHaveProperty('modules-center')
    expect(parsedConfig).toHaveProperty('modules-right')

    // ========================================
    // STEP 2: Create bar and add to store
    // ========================================
    const store = useConfigStore.getState()

    // Create a new bar
    const testBar = createTestBar({
      name: 'My Bar',
      config: {
        layer: 'top',
        position: 'top',
        height: 30,
        spacing: 4,
      },
    })

    store.createBar(testBar)

    // Verify bar was created
    const currentState = useConfigStore.getState()
    expect(currentState.config.bars).toHaveLength(1)
    expect(currentState.config.bars[0].name).toBe('My Bar')

    // ========================================
    // STEP 3: Add modules to bar
    // ========================================
    const barId = currentState.config.bars[0].id

    // Add clock module to left
    const clockModule = {
      type: 'clock' as const,
      position: 'left' as const,
      order: 0,
      enabled: true,
      config: {
        format: '{:%H:%M}',
        tooltip: true,
        'tooltip-format': '{:%Y-%m-%d}',
      },
    }
    store.addModule(barId, clockModule)

    // Add battery module to left
    const batteryModule = createBatteryModule({
      position: 'left',
      order: 1,
    })
    store.addModule(barId, batteryModule)

    // Add workspaces to center
    const workspacesModule = {
      type: 'hyprland/workspaces' as const,
      position: 'center' as const,
      order: 0,
      enabled: true,
      config: {
        format: '{name}',
      },
    }
    store.addModule(barId, workspacesModule)

    // Add network and tray to right
    const networkModule = createNetworkModule({
      position: 'right',
      order: 0,
    })
    store.addModule(barId, networkModule)

    const trayModule = {
      type: 'tray' as const,
      position: 'right' as const,
      order: 1,
      enabled: true,
      config: {
        spacing: 10,
      },
    }
    store.addModule(barId, trayModule)

    // Verify modules were added
    const updatedState = useConfigStore.getState()
    const bar = updatedState.config.bars[0]
    expect(bar.modules).toHaveLength(5)

    // Verify module positions
    const leftModules = bar.modules.filter((m) => m.position === 'left')
    const centerModules = bar.modules.filter((m) => m.position === 'center')
    const rightModules = bar.modules.filter((m) => m.position === 'right')

    expect(leftModules).toHaveLength(2)
    expect(centerModules).toHaveLength(1)
    expect(rightModules).toHaveLength(2)

    // ========================================
    // STEP 4: Modify module configuration
    // ========================================
    const batteryModuleId = bar.modules.find((m) => m.type === 'battery')?.id
    expect(batteryModuleId).toBeDefined()

    store.updateModule(barId, batteryModuleId!, {
      config: {
        format: '{capacity}% ⚡',
        states: {
          warning: 25,
          critical: 10,
        },
      },
    })

    // Verify module was updated
    const finalState = useConfigStore.getState()
    const updatedBattery = finalState.config.bars[0].modules.find((m) => m.id === batteryModuleId)
    expect(updatedBattery?.config.format).toBe('{capacity}% ⚡')
    expect(updatedBattery?.config.states?.warning).toBe(25)

    // ========================================
    // STEP 5: Save configuration
    // ========================================
    // Generate waybar config JSON
    const waybarConfig = {
      layer: bar.config.layer,
      position: bar.config.position,
      height: bar.config.height,
      spacing: bar.config.spacing,
      'modules-left': leftModules
        .sort((a, b) => a.order - b.order)
        .map((m) => m.type),
      'modules-center': centerModules
        .sort((a, b) => a.order - b.order)
        .map((m) => m.type),
      'modules-right': rightModules
        .sort((a, b) => a.order - b.order)
        .map((m) => m.type),
      // Module configurations
      ...Object.fromEntries(
        bar.modules.map((m) => [m.type, m.config])
      ),
    }

    // Save config
    await saveConfig('/home/user/.config/waybar/config', JSON.stringify(waybarConfig, null, 2))

    // Verify save was called
    expect(mockInvoke).toHaveBeenCalledWith('save_config', {
      path: '/home/user/.config/waybar/config',
      content: expect.stringContaining('modules-left'),
    })

    // ========================================
    // STEP 6: Verify saved configuration
    // ========================================
    const savedContent = mockInvoke.mock.calls.find(
      (call) => call[0] === 'save_config'
    )?.[1]?.content as string

    expect(savedContent).toBeDefined()
    const savedConfig = JSON.parse(savedContent)

    // Verify structure
    expect(savedConfig).toHaveProperty('modules-left')
    expect(savedConfig).toHaveProperty('modules-center')
    expect(savedConfig).toHaveProperty('modules-right')

    // Verify modules
    expect(savedConfig['modules-left']).toEqual(['clock', 'battery'])
    expect(savedConfig['modules-center']).toEqual(['hyprland/workspaces'])
    expect(savedConfig['modules-right']).toEqual(['network', 'tray'])

    // Verify battery config
    expect(savedConfig.battery).toBeDefined()
    expect(savedConfig.battery.format).toBe('{capacity}% ⚡')
    expect(savedConfig.battery.states.warning).toBe(25)

    // Verify isDirty was set during modifications
    expect(finalState.isDirty).toBe(true)
  })

  it('should handle save errors gracefully', async () => {
    // Setup store with a bar
    const store = useConfigStore.getState()
    const testBar = createTestBar()
    store.createBar(testBar)

    // Mock save to fail
    ;(mockInvoke.mockImplementationOnce as any)(() => Promise.reject(new Error('Failed to write file')))

    // Attempt to save
    await expect(
      saveConfig('/home/user/.config/waybar/config', '{}')
    ).rejects.toThrow('Failed to save config')
  })

  it('should maintain state consistency during modifications', () => {
    const store = useConfigStore.getState()

    // Create bar
    const bar = createTestBar()
    store.createBar(bar)

    const barId = useConfigStore.getState().config.bars[0].id

    // Add multiple modules rapidly
    for (let i = 0; i < 10; i++) {
      store.addModule(barId, {
        type: 'custom',
        position: 'left',
        order: i,
        enabled: true,
        config: {
          exec: `echo ${i}`,
        },
      })
    }

    // Verify all modules were added
    const state = useConfigStore.getState()
    expect(state.config.bars[0].modules).toHaveLength(10)

    // Verify order is correct
    const modules = state.config.bars[0].modules
      .filter((m) => m.position === 'left')
      .sort((a, b) => a.order - b.order)

    for (let i = 0; i < 10; i++) {
      expect(modules[i].order).toBe(i)
      expect(modules[i].config.exec).toBe(`echo ${i}`)
    }
  })

  it('should track dirty state correctly', () => {
    const store = useConfigStore.getState()

    // Initially not dirty
    expect(store.isDirty).toBe(false)

    // Create bar - should mark dirty
    store.createBar(createTestBar())
    expect(useConfigStore.getState().isDirty).toBe(true)

    // Mark clean
    store.markClean()
    expect(useConfigStore.getState().isDirty).toBe(false)

    // Modify bar - should mark dirty again
    const barId = useConfigStore.getState().config.bars[0].id
    store.updateBar(barId, { name: 'Updated Name' })
    expect(useConfigStore.getState().isDirty).toBe(true)
  })
})
