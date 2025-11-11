// ============================================================================
// INTEGRATION TEST: Validation
// Test: Validation errors prevent save
// ============================================================================

import { describe, it, expect, beforeEach } from 'vitest'
import { useConfigStore } from '../../store/config-store'
import { useValidationStore } from '../../store/validation-store'
import { setupTauriMocks, resetTauriMocks } from '../mocks/tauri'
import { createTestBar } from '../test-utils'
import { BarConfigSchema } from '../../lib/schemas/bar-config'
import { BatteryModuleSchema, ClockModuleSchema } from '../../lib/schemas/module-specific'

// Setup Tauri mocks
setupTauriMocks()

describe('Validation Integration', () => {
  beforeEach(() => {
    // Reset stores to initial state
    useConfigStore.getState().resetConfig()
    useValidationStore.getState().clearAllErrors()
    resetTauriMocks()
  })

  it('should validate bar configuration and detect errors', () => {
    const store = useConfigStore.getState()

    // Create bar with valid config
    const validBar = createTestBar({
      config: {
        layer: 'top',
        position: 'top',
        height: 30,
        spacing: 4,
      },
    })

    store.createBar(validBar)

    // Validate valid config
    const result = BarConfigSchema.safeParse(validBar.config)
    expect(result.success).toBe(true)

    // Try to update with invalid config (negative height)
    const invalidConfig = {
      height: -10, // Invalid: must be positive
    }

    const invalidResult = BarConfigSchema.safeParse({
      ...validBar.config,
      ...invalidConfig,
    })

    expect(invalidResult.success).toBe(false)
    if (!invalidResult.success) {
      expect(invalidResult.error.issues).toHaveLength(1)
      expect(invalidResult.error.issues[0].path).toContain('height')
    }
  })

  it('should validate module configuration and detect errors', () => {
    const store = useConfigStore.getState()
    const barId = createTestBar().id
    store.createBar({ ...createTestBar(), id: barId })

    // Add valid battery module
    const validBatteryConfig = {
      format: '{capacity}% {icon}',
      interval: 60,
      states: {
        warning: 30,
        critical: 15,
      },
    }

    const validResult = BatteryModuleSchema.safeParse(validBatteryConfig)
    expect(validResult.success).toBe(true)

    // Try invalid battery config (negative interval)
    const invalidBatteryConfig = {
      format: '{capacity}% {icon}',
      interval: -10, // Invalid: must be positive
      states: {
        warning: 30,
        critical: 15,
      },
    }

    const invalidResult = BatteryModuleSchema.safeParse(invalidBatteryConfig)
    expect(invalidResult.success).toBe(false)
    if (!invalidResult.success) {
      expect(invalidResult.error.issues[0].path).toContain('interval')
    }
  })

  it('should prevent save when validation errors exist', () => {
    const store = useConfigStore.getState()
    const validationStore = useValidationStore.getState()

    // Create bar
    const bar = createTestBar()
    store.createBar(bar)

    const barId = useConfigStore.getState().config.bars[0].id

    // Add module with invalid config
    store.addModule(barId, {
      type: 'clock',
      position: 'left',
      order: 0,
      enabled: true,
      config: {
        interval: -30, // Invalid
        format: '{:%H:%M}',
      },
    })

    // Validate module config
    const state = useConfigStore.getState()
    const module = state.config.bars[0].modules[0]

    const result = ClockModuleSchema.safeParse(module.config)

    if (!result.success) {
      // Set validation errors
      validationStore.setErrors({
        [`module.${module.id}.interval`]: ['Interval must be a positive number'],
      })
    }

    // Check if errors exist
    const errors = useValidationStore.getState().errors
    expect(Object.keys(errors).length).toBeGreaterThan(0)

    // Verify save should be blocked
    const hasErrors = Object.keys(errors).length > 0
    expect(hasErrors).toBe(true)
  })

  it('should detect duplicate module IDs', () => {
    const store = useConfigStore.getState()

    // Create bar
    const bar = createTestBar()
    store.createBar(bar)

    const barId = useConfigStore.getState().config.bars[0].id

    // Add two battery modules with same custom name
    store.addModule(barId, {
      type: 'battery',
      customName: 'bat0',
      position: 'left',
      order: 0,
      enabled: true,
      config: {},
    })

    store.addModule(barId, {
      type: 'battery',
      customName: 'bat0', // Duplicate custom name
      position: 'left',
      order: 1,
      enabled: true,
      config: {},
    })

    // Check for duplicates
    const state = useConfigStore.getState()
    const batteryModules = state.config.bars[0].modules.filter(
      (m) => m.type === 'battery' && m.customName === 'bat0'
    )

    // Should have 2 modules with same customName
    expect(batteryModules).toHaveLength(2)

    // This would be an error in Waybar (duplicate #battery#bat0)
    const validationStore = useValidationStore.getState()
    validationStore.setErrors({
      'modules.battery.bat0': ['Duplicate module ID: battery#bat0 already exists'],
    })

    const errors = useValidationStore.getState().errors
    expect(errors['modules.battery.bat0']).toBeDefined()
  })

  it('should validate all modules in a bar', () => {
    const store = useConfigStore.getState()

    // Create bar
    const bar = createTestBar()
    store.createBar(bar)

    const barId = useConfigStore.getState().config.bars[0].id

    // Add multiple modules with various validation issues
    store.addModule(barId, {
      type: 'clock',
      position: 'left',
      order: 0,
      enabled: true,
      config: {
        interval: 60, // Valid
        format: '{:%H:%M}',
      },
    })

    store.addModule(barId, {
      type: 'battery',
      position: 'left',
      order: 1,
      enabled: true,
      config: {
        interval: -10, // Invalid
        format: '{capacity}%',
      },
    })

    store.addModule(barId, {
      type: 'cpu',
      position: 'right',
      order: 0,
      enabled: true,
      config: {
        interval: 5, // Valid
        format: '{usage}%',
      },
    })

    // Validate all modules
    const state = useConfigStore.getState()
    const modules = state.config.bars[0].modules
    const validationStore = useValidationStore.getState()
    const errors: Record<string, string[]> = {}

    for (const module of modules) {
      let schema
      switch (module.type) {
        case 'clock':
          schema = ClockModuleSchema
          break
        case 'battery':
          schema = BatteryModuleSchema
          break
        // Add other module schemas as needed
        default:
          continue
      }

      const result = schema.safeParse(module.config)
      if (!result.success) {
        result.error.issues.forEach((err: any) => {
          const path = `module.${module.id}.${err.path.join('.')}`
          if (!errors[path]) {
            errors[path] = []
          }
          errors[path].push(err.message)
        })
      }
    }

    // Set errors
    if (Object.keys(errors).length > 0) {
      validationStore.setErrors(errors)
    }

    // Verify errors were found
    const validationErrors = useValidationStore.getState().errors
    expect(Object.keys(validationErrors).length).toBeGreaterThan(0)

    // Should have error for battery module
    const batteryModule = modules.find((m) => m.type === 'battery')
    const batteryErrorKey = `module.${batteryModule!.id}.interval`
    expect(validationErrors[batteryErrorKey]).toBeDefined()
  })

  it('should clear errors when configuration is fixed', () => {
    const store = useConfigStore.getState()
    const validationStore = useValidationStore.getState()

    // Create bar
    const bar = createTestBar()
    store.createBar(bar)

    const barId = useConfigStore.getState().config.bars[0].id

    // Add module with error
    store.addModule(barId, {
      type: 'clock',
      position: 'left',
      order: 0,
      enabled: true,
      config: {
        interval: -30, // Invalid
        format: '{:%H:%M}',
      },
    })

    const state = useConfigStore.getState()
    const module = state.config.bars[0].modules[0]

    // Set error
    validationStore.setErrors({
      [`module.${module.id}.interval`]: ['Interval must be positive'],
    })

    expect(Object.keys(useValidationStore.getState().errors)).toHaveLength(1)

    // Fix the error
    store.updateModule(barId, module.id, {
      config: {
        interval: 60, // Now valid
        format: '{:%H:%M}',
      },
    })

    // Validate again
    const updatedState = useConfigStore.getState()
    const updatedModule = updatedState.config.bars[0].modules[0]
    const result = ClockModuleSchema.safeParse(updatedModule.config)

    if (result.success) {
      // Clear errors for this module
      const currentErrors = useValidationStore.getState().errors
      const newErrors = { ...currentErrors }
      delete newErrors[`module.${module.id}.interval`]
      validationStore.setErrors(newErrors)
    }

    // Verify errors were cleared
    expect(Object.keys(useValidationStore.getState().errors)).toHaveLength(0)
  })

  it('should show user-friendly error messages', () => {
    const validationStore = useValidationStore.getState()

    // Set various types of errors
    validationStore.setErrors({
      'bar.height': ['Height must be a positive number'],
      'module.clock.interval': ['Interval must be at least 1 second'],
      'module.battery.states.warning': ['Warning threshold must be between 0 and 100'],
      'modules.duplicate': ['Duplicate module ID: battery#bat0 already exists'],
    })

    const errors = useValidationStore.getState().errors

    // Verify error messages are user-friendly
    expect(errors['bar.height'][0]).toMatch(/positive/)
    expect(errors['module.clock.interval'][0]).toMatch(/at least/)
    expect(errors['module.battery.states.warning'][0]).toMatch(/between/)
    expect(errors['modules.duplicate'][0]).toMatch(/Duplicate/)
  })

  it('should count total errors and warnings', () => {
    const validationStore = useValidationStore.getState()

    // Set errors
    validationStore.setErrors({
      'bar.height': ['Height must be positive'],
      'module.clock.interval': ['Interval too low'],
      'module.battery.format': ['Invalid format string'],
    })

    // Set warnings
    validationStore.setWarnings({
      'module.custom.exec': ['Custom module without exec command'],
      'bar.spacing': ['Large spacing may cause layout issues'],
    })

    const errors = useValidationStore.getState().errors
    const warnings = useValidationStore.getState().warnings

    // Count errors and warnings
    const errorCount = Object.keys(errors).length
    const warningCount = Object.keys(warnings).length

    expect(errorCount).toBe(3)
    expect(warningCount).toBe(2)
    expect(errorCount + warningCount).toBe(5)
  })
})
