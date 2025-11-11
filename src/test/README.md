# Test Suite

Comprehensive integration tests for the Waybar Configuration GUI application.

## Setup

Install test dependencies:

```bash
npm install
```

## Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode (recommended during development)
npm test -- --watch

# Run tests with UI
npm run test:ui

# Run tests with coverage
npm run test:coverage

# Run specific test file
npm test -- src/test/integration/config-flow.test.ts
```

## Test Structure

```
src/test/
├── README.md                     # This file
├── setup.ts                      # Global test setup and mocks
├── test-utils.tsx                # Custom render and test utilities
├── mocks/
│   └── tauri.ts                  # Tauri command mocks
└── integration/
    ├── config-flow.test.ts       # Configuration management flow
    ├── module-drag.test.tsx      # Drag-and-drop functionality
    └── validation.test.ts        # Validation system
```

## Test Coverage

### Integration Tests

#### 1. Configuration Flow (`config-flow.test.ts`)

Tests the complete configuration management flow:

- **Load config → modify modules → save config → verify file**
  - Loads existing Waybar configuration
  - Creates bar and adds modules
  - Modifies module configuration
  - Saves configuration
  - Verifies saved file structure

- **Handle save errors gracefully**
  - Tests error handling when save fails

- **Maintain state consistency during modifications**
  - Ensures state remains consistent with rapid changes

- **Track dirty state correctly**
  - Verifies isDirty flag is set/cleared appropriately

#### 2. Module Drag and Drop (`module-drag.test.tsx`)

Tests drag-and-drop functionality:

- **Drag module from palette to drop zone**
  - Simulates dragging module from palette
  - Verifies module is added to correct zone

- **Configure dragged module and save**
  - Opens module editor
  - Modifies configuration
  - Saves changes

- **Reorder modules within a zone**
  - Changes module order
  - Verifies new order is maintained

- **Move module between zones**
  - Moves module from one zone to another
  - Verifies position and order updates

- **Delete module from zone**
  - Removes module
  - Verifies module list updates

- **Handle multiple module instances with unique IDs**
  - Tests custom module names (e.g., battery#bat0, battery#bat1)
  - Ensures unique IDs are generated

#### 3. Validation (`validation.test.ts`)

Tests validation system:

- **Validate bar configuration and detect errors**
  - Tests BarConfigSchema validation
  - Detects invalid values (negative height, etc.)

- **Validate module configuration and detect errors**
  - Tests module-specific schemas
  - Detects invalid module parameters

- **Prevent save when validation errors exist**
  - Ensures save is blocked with validation errors

- **Detect duplicate module IDs**
  - Identifies conflicting module IDs
  - Reports duplicate errors

- **Validate all modules in a bar**
  - Batch validation of multiple modules
  - Collects all errors

- **Clear errors when configuration is fixed**
  - Removes errors when valid values are set

- **Show user-friendly error messages**
  - Verifies error messages are clear
  - Tests message formatting

- **Count total errors and warnings**
  - Aggregates validation issues
  - Separates errors from warnings

## Test Utilities

### Custom Render

```typescript
import { renderWithProviders } from '../test/test-utils'

const { getByTestId } = renderWithProviders(<MyComponent />)
```

Renders components with all necessary providers (DndContext, etc.).

### Test Data Factories

```typescript
import {
  createTestBar,
  createTestModule,
  createTestConfig,
  createBatteryModule,
  createNetworkModule,
  createWorkspacesModule,
} from '../test/test-utils'

const bar = createTestBar({ name: 'Custom Bar' })
const module = createBatteryModule({ position: 'left' })
```

### Assertions

```typescript
import {
  assertModuleExists,
  assertModuleConfig,
  assertModuleOrder,
} from '../test/test-utils'

assertModuleExists(bar, 'clock')
assertModuleConfig(bar, 'battery', { interval: 60 })
assertModuleOrder(bar, 'left', ['clock', 'battery', 'cpu'])
```

### Wait Utilities

```typescript
import { waitFor, nextTick } from '../test/test-utils'

await waitFor(() => element.textContent === 'Updated')
await nextTick() // Wait for state updates
```

## Mocking Tauri Commands

All Tauri backend commands are mocked in `mocks/tauri.ts`:

```typescript
import { setupTauriMocks, mockInvoke, mockTauriError } from '../test/mocks/tauri'

// Setup mocks before tests
setupTauriMocks()

// Mock a specific command to fail
mockTauriError('save_config', 'Failed to write file')

// Verify command was called
expect(mockInvoke).toHaveBeenCalledWith('load_config', { path: '/path/to/config' })
```

## Writing New Tests

### Integration Test Template

```typescript
import { describe, it, expect, beforeEach } from 'vitest'
import { useConfigStore } from '../../store/config-store'
import { setupTauriMocks, resetTauriMocks } from '../mocks/tauri'
import { createTestBar } from '../test-utils'

setupTauriMocks()

describe('My Feature', () => {
  beforeEach(() => {
    useConfigStore.getState().resetConfig()
    resetTauriMocks()
  })

  it('should do something', () => {
    // Arrange
    const store = useConfigStore.getState()
    const bar = createTestBar()

    // Act
    store.createBar(bar)

    // Assert
    const state = useConfigStore.getState()
    expect(state.config.bars).toHaveLength(1)
  })
})
```

### Component Test Template

```typescript
import { describe, it, expect } from 'vitest'
import { screen, fireEvent } from '@testing-library/react'
import { renderWithProviders } from '../test/test-utils'
import { MyComponent } from '../../components/MyComponent'

describe('MyComponent', () => {
  it('should render correctly', () => {
    renderWithProviders(<MyComponent />)

    expect(screen.getByText('Expected Text')).toBeDefined()
  })

  it('should handle user interaction', () => {
    renderWithProviders(<MyComponent />)

    const button = screen.getByRole('button')
    fireEvent.click(button)

    expect(screen.getByText('Updated')).toBeDefined()
  })
})
```

## Continuous Integration

Tests should run in CI pipeline:

```yaml
# .github/workflows/test.yml
name: Test

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm install
      - run: npm test
      - run: npm run test:coverage
```

## Coverage Goals

- **Statements**: >80%
- **Branches**: >75%
- **Functions**: >80%
- **Lines**: >80%

## Debugging Tests

### VS Code Configuration

Add to `.vscode/launch.json`:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Vitest: Current File",
      "runtimeExecutable": "${workspaceFolder}/node_modules/.bin/vitest",
      "args": ["${file}"],
      "console": "integratedTerminal",
      "internalConsoleOptions": "neverOpen"
    }
  ]
}
```

### Common Issues

1. **Tests fail with "Cannot find module"**
   - Check `vitest.config.ts` path aliases
   - Ensure imports use correct paths

2. **Async tests timeout**
   - Increase timeout in test file: `it('test', async () => {...}, 10000)`
   - Check for unresolved promises

3. **Mock not working**
   - Verify `setupTauriMocks()` is called
   - Check mock implementation in `mocks/tauri.ts`

4. **Store state persists between tests**
   - Ensure `beforeEach` resets stores
   - Call `resetConfig()` and `clearErrors()`

## Best Practices

1. **Test Isolation**: Each test should be independent
2. **Descriptive Names**: Use clear, descriptive test names
3. **Arrange-Act-Assert**: Follow AAA pattern
4. **Mock External Dependencies**: Always mock Tauri commands
5. **Test User Behavior**: Focus on user interactions, not implementation details
6. **Keep Tests Fast**: Integration tests should run in <5s total
7. **Avoid Implementation Details**: Test public API and behavior
8. **Use TypeScript**: Leverage type safety in tests

## Resources

- [Vitest Documentation](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/react)
- [Testing Library User Events](https://testing-library.com/docs/user-event/intro)
- [Zod Testing](https://zod.dev/?id=safeparse)
- [Zustand Testing](https://docs.pmnd.rs/zustand/guides/testing)
