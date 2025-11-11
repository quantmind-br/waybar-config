# 🚀 PLANO DE AÇÃO DETALHADO - Waybar GUI Configuration Tool

**Gerado:** 2025-11-11
**Status Atual:** 70-75% Implementado
**Objetivo:** Tornar a aplicação 100% funcional e completa

---

## 📊 Sumário Executivo

**Tempo Total Estimado:** 30-40 horas
**MVP Funcional:** 12-20 horas (Fases 1-3)
**Implementação Completa:** 30-40 horas (Todas as fases)

### Prioridades

1. 🔴 **CRÍTICO** - Bloqueadores que impedem uso básico (12-20h)
2. 🟠 **ALTO** - Features essenciais faltando (8-12h)
3. 🟡 **MÉDIO** - Melhorias de UX e polishing (6-8h)
4. 🔵 **BAIXO** - Otimizações e documentação (4-6h)

---

# FASE 1: BLOQUEADORES CRÍTICOS 🔴

**Prioridade:** MÁXIMA
**Tempo Estimado:** 12-20 horas
**Status:** DEVE SER FEITO PRIMEIRO

## Task 1.1: Reescrever App.tsx com Integração Completa

**Objetivo:** Transformar o template do Tauri em uma aplicação funcional integrando todos os componentes.

**Problema Atual:**
```typescript
// src/App.tsx - CÓDIGO TEMPLATE NÃO FUNCIONAL
function App() {
  const [greetMsg, setGreetMsg] = useState("");
  const [name, setName] = useState("");
  async function greet() {
    setGreetMsg(await invoke("greet", { name }));
  }
  return (
    <main className="container">
      <h1>Welcome to Tauri + React</h1>
      {/* ... template code ... */}
    </main>
  );
}
```

### Solução Detalhada

#### Passo 1.1.1: Criar App.tsx com Estrutura Básica

**Arquivo:** `src/App.tsx`

```typescript
// ============================================================================
// WAYBAR GUI CONFIGURATION TOOL - MAIN APP
// ============================================================================

import { useEffect, useState } from 'react'
import { ThemeProvider } from './components/common/ThemeProvider'
import { ErrorBoundary } from './components/common/ErrorBoundary'
import { GlobalKeyboardShortcuts } from './components/common/GlobalKeyboardShortcuts'
import MainLayout from './components/layout/MainLayout'
import { BarList } from './components/bars'
import { BarEditor } from './components/bars'
import { ModulePalette } from './components/modules'
import { StyleEditor } from './components/styles'
import { LoadingState } from './components/common/LoadingState'
import { useConfigStore } from './store/config-store'
import { useUIStore } from './store/ui-store'
import { detectConfigPaths, loadConfig } from './lib/tauri/commands'
import { transformWaybarJsonToConfig } from './lib/utils/config-transform'
import './styles/globals.css'

// ============================================================================
// TYPES
// ============================================================================

type AppState = 'loading' | 'ready' | 'error'

interface AppError {
  title: string
  message: string
  suggestion?: string
}

// ============================================================================
// MAIN APP COMPONENT
// ============================================================================

function App() {
  const [appState, setAppState] = useState<AppState>('loading')
  const [error, setError] = useState<AppError | null>(null)

  const { loadConfig: loadConfigToStore } = useConfigStore((state) => ({
    loadConfig: state.loadConfig,
  }))

  // ============================================================================
  // INITIALIZATION: Load Waybar Config on Startup
  // ============================================================================

  useEffect(() => {
    async function initializeApp() {
      try {
        setAppState('loading')

        // Step 1: Detect Waybar config paths
        console.log('[App] Detecting Waybar config paths...')
        const paths = await detectConfigPaths()
        console.log('[App] Config paths detected:', paths)

        // Step 2: Load config file
        console.log('[App] Loading config from:', paths.config_file)
        const configFile = await loadConfig(paths.config_file)

        // Step 3: Parse JSON (JSONC comments already stripped by backend)
        const waybarJson = JSON.parse(configFile.content)

        // Step 4: Transform Waybar JSON to internal format
        const config = transformWaybarJsonToConfig(waybarJson)

        // Step 5: Load into store
        loadConfigToStore(config)

        console.log('[App] Configuration loaded successfully')
        setAppState('ready')
      } catch (err: any) {
        console.error('[App] Failed to load configuration:', err)

        // Handle different error types
        if (err.type === 'NotFound') {
          setError({
            title: 'Waybar Configuration Not Found',
            message: 'No Waybar configuration was found on your system.',
            suggestion: 'Create a new configuration or specify a custom location.',
          })
        } else if (err.type === 'Parse') {
          setError({
            title: 'Invalid Configuration',
            message: 'The Waybar configuration file contains invalid JSON.',
            suggestion: 'Check your config file at ~/.config/waybar/config for syntax errors.',
          })
        } else {
          setError({
            title: 'Initialization Error',
            message: err.message || 'An unexpected error occurred.',
            suggestion: 'Try restarting the application or check the console for details.',
          })
        }

        setAppState('error')
      }
    }

    initializeApp()
  }, [loadConfigToStore])

  // ============================================================================
  // RENDER STATES
  // ============================================================================

  // Loading state
  if (appState === 'loading') {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-gray-900">
        <LoadingState message="Loading Waybar configuration..." />
      </div>
    )
  }

  // Error state
  if (appState === 'error' && error) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-gray-900 p-8">
        <div className="max-w-md rounded-lg border border-red-800 bg-gray-950 p-6">
          <h1 className="mb-2 text-xl font-bold text-red-500">{error.title}</h1>
          <p className="mb-4 text-gray-300">{error.message}</p>
          {error.suggestion && (
            <p className="mb-4 text-sm text-gray-400">{error.suggestion}</p>
          )}
          <button
            onClick={() => window.location.reload()}
            className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  // ============================================================================
  // MAIN APPLICATION UI
  // ============================================================================

  return (
    <ErrorBoundary>
      <ThemeProvider>
        <GlobalKeyboardShortcuts>
          <MainLayout>
            {/* Main Content Area */}
            <div className="flex h-full">
              {/* Left Panel: Bar List & Module Palette */}
              <div className="flex w-80 flex-col border-r border-gray-800">
                {/* Bar List Section */}
                <div className="flex-shrink-0 border-b border-gray-800 p-4">
                  <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-400">
                    Bars
                  </h2>
                  <BarList />
                </div>

                {/* Module Palette Section */}
                <div className="flex-1 overflow-y-auto p-4">
                  <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-400">
                    Module Palette
                  </h2>
                  <ModulePalette />
                </div>
              </div>

              {/* Center Panel: Bar Editor or Style Editor */}
              <div className="flex-1 overflow-y-auto">
                <EditorContent />
              </div>
            </div>
          </MainLayout>
        </GlobalKeyboardShortcuts>
      </ThemeProvider>
    </ErrorBoundary>
  )
}

// ============================================================================
// EDITOR CONTENT COMPONENT
// ============================================================================

/**
 * Renders the appropriate editor based on active tab
 */
function EditorContent() {
  const activeTab = useUIStore((state) => state.activeMainTab)

  switch (activeTab) {
    case 'bars':
      return <BarEditor />
    case 'styles':
      return <StyleEditor />
    default:
      return <BarEditor />
  }
}

export default App
```

**Checklist de Validação:**
- [ ] App compila sem erros TypeScript
- [ ] App carrega e mostra loading state
- [ ] Detecta e carrega config do Waybar
- [ ] Mostra erro se config não existe
- [ ] MainLayout renderiza corretamente
- [ ] BarList aparece na sidebar esquerda
- [ ] ModulePalette aparece na sidebar esquerda
- [ ] BarEditor aparece no painel central

**Tempo Estimado:** 3-4 horas

---

#### Passo 1.1.2: Criar Utility de Transformação de Config

**Objetivo:** Converter JSON do Waybar para o formato interno do app.

**Arquivo:** `src/lib/utils/config-transform.ts` (criar se não existir)

```typescript
// ============================================================================
// CONFIG TRANSFORMATION UTILITIES
// ============================================================================

import type { WaybarConfig, BarDefinition, ModuleInstance } from '../types/config'
import { v4 as uuidv4 } from 'uuid'

/**
 * Transform raw Waybar JSON to internal WaybarConfig format
 */
export function transformWaybarJsonToConfig(waybarJson: any): WaybarConfig {
  // Waybar config can be a single bar (object) or multiple bars (array)
  const bars = Array.isArray(waybarJson) ? waybarJson : [waybarJson]

  const barDefinitions: BarDefinition[] = bars.map((barConfig, index) => {
    // Extract modules from modules-left, modules-center, modules-right
    const modules = extractModules(barConfig)

    return {
      id: uuidv4(),
      name: barConfig.name || `Bar ${index + 1}`,
      enabled: true,
      order: index,
      config: extractBarConfig(barConfig),
      modules,
    }
  })

  return {
    bars: barDefinitions,
    styles: [], // Styles loaded separately from style.css
    metadata: {
      version: '1.0.0',
      createdAt: new Date().toISOString(),
      modifiedAt: new Date().toISOString(),
      appVersion: '0.1.0',
    },
  }
}

/**
 * Extract modules from Waybar config
 */
function extractModules(barConfig: any): ModuleInstance[] {
  const modules: ModuleInstance[] = []
  let order = 0

  // Process modules-left
  if (Array.isArray(barConfig['modules-left'])) {
    for (const moduleName of barConfig['modules-left']) {
      modules.push(createModuleInstance(moduleName, 'left', order++, barConfig))
    }
  }

  // Process modules-center
  if (Array.isArray(barConfig['modules-center'])) {
    for (const moduleName of barConfig['modules-center']) {
      modules.push(createModuleInstance(moduleName, 'center', order++, barConfig))
    }
  }

  // Process modules-right
  if (Array.isArray(barConfig['modules-right'])) {
    for (const moduleName of barConfig['modules-right']) {
      modules.push(createModuleInstance(moduleName, 'right', order++, barConfig))
    }
  }

  return modules
}

/**
 * Create ModuleInstance from module name and config
 */
function createModuleInstance(
  moduleName: string,
  position: 'left' | 'center' | 'right',
  order: number,
  barConfig: any
): ModuleInstance {
  // Parse module name: "battery" or "battery#bat0"
  const [type, customName] = moduleName.includes('#')
    ? moduleName.split('#')
    : [moduleName, undefined]

  // Get module config from barConfig[moduleName]
  const moduleConfig = barConfig[moduleName] || {}

  return {
    id: uuidv4(),
    type: type as any,
    customName,
    position,
    order,
    config: moduleConfig,
    enabled: true,
  }
}

/**
 * Extract bar-level config (excluding modules)
 */
function extractBarConfig(barConfig: any): any {
  const {
    'modules-left': _,
    'modules-center': __,
    'modules-right': ___,
    // Extract all module configs (anything with # in key)
    ...rest
  } = barConfig

  // Remove module-specific configs
  const barLevelConfig: any = {}
  for (const [key, value] of Object.entries(rest)) {
    if (!key.includes('#')) {
      barLevelConfig[key] = value
    }
  }

  return barLevelConfig
}

/**
 * Transform internal WaybarConfig to Waybar JSON format
 */
export function transformConfigToWaybarJson(config: WaybarConfig): any {
  const bars = config.bars
    .filter((bar) => bar.enabled)
    .sort((a, b) => a.order - b.order)
    .map((bar) => transformBarToWaybarJson(bar))

  // If single bar, return object; if multiple, return array
  return bars.length === 1 ? bars[0] : bars
}

/**
 * Transform single bar to Waybar JSON
 */
function transformBarToWaybarJson(bar: BarDefinition): any {
  const waybarJson: any = { ...bar.config }

  // Add name if specified
  if (bar.name) {
    waybarJson.name = bar.name
  }

  // Group modules by position
  const leftModules: string[] = []
  const centerModules: string[] = []
  const rightModules: string[] = []

  const enabledModules = bar.modules
    .filter((m) => m.enabled)
    .sort((a, b) => a.order - b.order)

  for (const module of enabledModules) {
    const moduleName = module.customName
      ? `${module.type}#${module.customName}`
      : module.type

    // Add module to appropriate position array
    switch (module.position) {
      case 'left':
        leftModules.push(moduleName)
        break
      case 'center':
        centerModules.push(moduleName)
        break
      case 'right':
        rightModules.push(moduleName)
        break
    }

    // Add module config to waybarJson
    waybarJson[moduleName] = module.config
  }

  // Add module arrays
  if (leftModules.length > 0) {
    waybarJson['modules-left'] = leftModules
  }
  if (centerModules.length > 0) {
    waybarJson['modules-center'] = centerModules
  }
  if (rightModules.length > 0) {
    waybarJson['modules-right'] = rightModules
  }

  return waybarJson
}
```

**Dependências:**
```bash
npm install uuid
npm install -D @types/uuid
```

**Checklist de Validação:**
- [ ] Função importa corretamente
- [ ] Transforma config simples (1 bar)
- [ ] Transforma config múltiplas bars
- [ ] Extrai módulos de left/center/right
- [ ] Preserva configurações de módulos
- [ ] Gera IDs únicos (UUID)
- [ ] Reverso: config → Waybar JSON funciona

**Tempo Estimado:** 2-3 horas

---

#### Passo 1.1.3: Atualizar UI Store para Suportar Tabs

**Objetivo:** Adicionar state para tab ativa (Bars vs Styles).

**Arquivo:** `src/store/ui-store.ts`

```typescript
// Adicionar ao UIState interface:
interface UIState {
  // ... existing fields
  activeMainTab: 'bars' | 'styles'  // ADD THIS
  activeEditorTab: 'general' | 'modules' | 'styling'
  // ... rest
}

// Adicionar ao UIActions interface:
interface UIActions {
  // ... existing actions
  setActiveMainTab: (tab: 'bars' | 'styles') => void  // ADD THIS
  // ... rest
}

// Adicionar ao store implementation:
export const useUIStore = create<UIStore>()(
  immer((set) => ({
    // Initial state
    activeMainTab: 'bars',  // ADD THIS
    activeEditorTab: 'general',
    // ... rest

    // Actions
    setActiveMainTab: (tab) => set({ activeMainTab: tab }),  // ADD THIS
    // ... rest
  }))
)
```

**Checklist de Validação:**
- [ ] activeMainTab state existe
- [ ] setActiveMainTab action funciona
- [ ] Default é 'bars'
- [ ] Store compila sem erros

**Tempo Estimado:** 30 minutos

---

#### Passo 1.1.4: Implementar GlobalKeyboardShortcuts

**Objetivo:** Adicionar atalhos de teclado globais.

**Arquivo:** `src/components/common/GlobalKeyboardShortcuts.tsx`

```typescript
// ============================================================================
// GLOBAL KEYBOARD SHORTCUTS
// ============================================================================

import { useEffect, type ReactNode } from 'react'
import { useConfigStore } from '../../store/config-store'
import { useUIStore } from '../../store/ui-store'

interface GlobalKeyboardShortcutsProps {
  children: ReactNode
}

/**
 * Global keyboard shortcuts handler
 *
 * Shortcuts:
 * - Ctrl+S: Save configuration
 * - Ctrl+Z: Undo
 * - Ctrl+Shift+Z / Ctrl+Y: Redo
 * - Ctrl+/: Show keyboard shortcuts help
 * - Escape: Close modals
 */
export function GlobalKeyboardShortcuts({ children }: GlobalKeyboardShortcutsProps) {
  const saveConfig = useConfigStore((state) => state.saveConfig)
  const { undo, redo } = useConfigStore.temporal.getState()
  const { setKeyboardShortcutsDialogOpen, closeAllDialogs } = useUIStore((state) => ({
    setKeyboardShortcutsDialogOpen: state.setKeyboardShortcutsDialogOpen,
    closeAllDialogs: state.closeAllDialogs,
  }))

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      // Ctrl+S: Save
      if (event.ctrlKey && event.key === 's') {
        event.preventDefault()
        console.log('[Shortcuts] Ctrl+S: Save config')
        saveConfig()
        return
      }

      // Ctrl+Z: Undo
      if (event.ctrlKey && event.key === 'z' && !event.shiftKey) {
        event.preventDefault()
        console.log('[Shortcuts] Ctrl+Z: Undo')
        undo()
        return
      }

      // Ctrl+Shift+Z or Ctrl+Y: Redo
      if (
        (event.ctrlKey && event.shiftKey && event.key === 'Z') ||
        (event.ctrlKey && event.key === 'y')
      ) {
        event.preventDefault()
        console.log('[Shortcuts] Ctrl+Shift+Z / Ctrl+Y: Redo')
        redo()
        return
      }

      // Ctrl+/: Show keyboard shortcuts
      if (event.ctrlKey && event.key === '/') {
        event.preventDefault()
        console.log('[Shortcuts] Ctrl+/: Show keyboard shortcuts')
        setKeyboardShortcutsDialogOpen(true)
        return
      }

      // Escape: Close modals
      if (event.key === 'Escape') {
        console.log('[Shortcuts] Escape: Close modals')
        closeAllDialogs()
        return
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [saveConfig, undo, redo, setKeyboardShortcutsDialogOpen, closeAllDialogs])

  return <>{children}</>
}
```

**Atualizar ui-store.ts:**
```typescript
// Adicionar ao UIState:
interface UIState {
  // ... existing
  isKeyboardShortcutsDialogOpen: boolean
  isModuleEditorOpen: boolean
  // ... rest
}

// Adicionar ao UIActions:
interface UIActions {
  // ... existing
  setKeyboardShortcutsDialogOpen: (open: boolean) => void
  closeAllDialogs: () => void
  // ... rest
}

// Implementar:
export const useUIStore = create<UIStore>()(
  immer((set) => ({
    // State
    isKeyboardShortcutsDialogOpen: false,
    isModuleEditorOpen: false,
    // ... rest

    // Actions
    setKeyboardShortcutsDialogOpen: (open) =>
      set({ isKeyboardShortcutsDialogOpen: open }),

    closeAllDialogs: () => set((state) => {
      state.isKeyboardShortcutsDialogOpen = false
      state.isModuleEditorOpen = false
      // Close any other dialogs
    }),
    // ... rest
  }))
)
```

**Checklist de Validação:**
- [ ] Ctrl+S chama saveConfig
- [ ] Ctrl+Z faz undo
- [ ] Ctrl+Shift+Z e Ctrl+Y fazem redo
- [ ] Escape fecha modals
- [ ] Ctrl+/ abre dialog de ajuda
- [ ] Não interfere com inputs focados

**Tempo Estimado:** 1-2 horas

---

## Task 1.2: Implementar Fluxo de Save Config

**Objetivo:** Conectar UI de save com backend Rust.

### Passo 1.2.1: Atualizar config-store.ts com Lógica de Save

**Arquivo:** `src/store/config-store.ts`

Modificar a ação `saveConfig`:

```typescript
saveConfig: async () => {
  const state = get()

  try {
    // Step 1: Validate configuration
    const validationErrors = validateFullConfig(state.config)
    if (validationErrors.length > 0) {
      console.error('[Config Store] Cannot save: validation errors exist')
      // Show error notification to user
      useUIStore.getState().showNotification({
        type: 'error',
        title: 'Cannot Save',
        message: `Configuration has ${validationErrors.length} validation error(s). Please fix them first.`,
      })
      return
    }

    // Step 2: Transform to Waybar JSON
    const waybarJson = transformConfigToWaybarJson(state.config)
    const jsonString = JSON.stringify(waybarJson, null, 2)

    // Step 3: Get config path (store it during load)
    const configPath = state.configPath || '~/.config/waybar/config'

    // Step 4: Save to file (backend creates backup automatically)
    console.log('[Config Store] Saving config to:', configPath)
    await invoke('save_config', { path: configPath, content: jsonString })

    // Step 5: Update state
    set({
      isDirty: false,
      lastSaved: new Date(),
    })

    // Step 6: Reload Waybar
    try {
      await invoke('reload_waybar')
      console.log('[Config Store] Waybar reloaded successfully')

      useUIStore.getState().showNotification({
        type: 'success',
        title: 'Saved',
        message: 'Configuration saved and Waybar reloaded successfully.',
      })
    } catch (reloadError) {
      console.warn('[Config Store] Failed to reload Waybar:', reloadError)

      useUIStore.getState().showNotification({
        type: 'warning',
        title: 'Saved',
        message: 'Configuration saved, but failed to reload Waybar. You may need to reload manually.',
      })
    }
  } catch (error: any) {
    console.error('[Config Store] Failed to save config:', error)

    useUIStore.getState().showNotification({
      type: 'error',
      title: 'Save Failed',
      message: error.message || 'An unexpected error occurred while saving.',
    })
  }
},
```

**Adicionar ao ConfigState:**
```typescript
interface ConfigState {
  // ... existing
  configPath: string | null  // ADD THIS: store loaded config path
  // ... rest
}
```

**Modificar loadConfig:**
```typescript
loadConfig: (config, configPath) => set({
  config,
  configPath,  // ADD THIS
  currentBarId: config.bars[0]?.id || null,
  isDirty: false,
  lastSaved: new Date(),
}),
```

**Checklist de Validação:**
- [ ] saveConfig valida antes de salvar
- [ ] Bloqueia save se há erros de validação
- [ ] Transforma config para Waybar JSON
- [ ] Chama backend save_config
- [ ] Backend cria backup automaticamente
- [ ] Recarrega Waybar após save
- [ ] Mostra notificação de sucesso/erro
- [ ] Marca isDirty como false

**Tempo Estimado:** 2-3 horas

---

### Passo 1.2.2: Implementar Sistema de Notificações

**Objetivo:** Adicionar toasts/notificações para feedback ao usuário.

**Arquivo:** `src/components/common/Notification.tsx` (criar)

```typescript
// ============================================================================
// NOTIFICATION SYSTEM (Toast)
// ============================================================================

import { useEffect } from 'react'
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react'
import { useUIStore } from '../../store/ui-store'

type NotificationType = 'success' | 'error' | 'warning' | 'info'

export interface Notification {
  id: string
  type: NotificationType
  title: string
  message: string
  duration?: number
}

/**
 * Notification container - renders at top-right of screen
 */
export function NotificationContainer() {
  const notifications = useUIStore((state) => state.notifications)
  const removeNotification = useUIStore((state) => state.removeNotification)

  return (
    <div className="fixed right-4 top-4 z-50 flex flex-col gap-2">
      {notifications.map((notification) => (
        <NotificationItem
          key={notification.id}
          notification={notification}
          onClose={() => removeNotification(notification.id)}
        />
      ))}
    </div>
  )
}

/**
 * Single notification item
 */
function NotificationItem({
  notification,
  onClose,
}: {
  notification: Notification
  onClose: () => void
}) {
  const { type, title, message, duration = 5000 } = notification

  // Auto-dismiss after duration
  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(onClose, duration)
      return () => clearTimeout(timer)
    }
  }, [duration, onClose])

  const styles = getNotificationStyles(type)
  const Icon = getNotificationIcon(type)

  return (
    <div
      className={`flex min-w-[320px] max-w-md items-start gap-3 rounded-lg border p-4 shadow-lg ${styles.container}`}
    >
      <Icon className={`mt-0.5 h-5 w-5 flex-shrink-0 ${styles.icon}`} />

      <div className="flex-1">
        <h4 className={`mb-1 font-semibold ${styles.title}`}>{title}</h4>
        <p className={`text-sm ${styles.message}`}>{message}</p>
      </div>

      <button
        onClick={onClose}
        className={`flex-shrink-0 rounded p-1 transition-colors ${styles.closeButton}`}
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  )
}

function getNotificationStyles(type: NotificationType) {
  switch (type) {
    case 'success':
      return {
        container: 'border-green-800 bg-green-950',
        icon: 'text-green-500',
        title: 'text-green-100',
        message: 'text-green-200',
        closeButton: 'hover:bg-green-900 text-green-400',
      }
    case 'error':
      return {
        container: 'border-red-800 bg-red-950',
        icon: 'text-red-500',
        title: 'text-red-100',
        message: 'text-red-200',
        closeButton: 'hover:bg-red-900 text-red-400',
      }
    case 'warning':
      return {
        container: 'border-yellow-800 bg-yellow-950',
        icon: 'text-yellow-500',
        title: 'text-yellow-100',
        message: 'text-yellow-200',
        closeButton: 'hover:bg-yellow-900 text-yellow-400',
      }
    case 'info':
      return {
        container: 'border-blue-800 bg-blue-950',
        icon: 'text-blue-500',
        title: 'text-blue-100',
        message: 'text-blue-200',
        closeButton: 'hover:bg-blue-900 text-blue-400',
      }
  }
}

function getNotificationIcon(type: NotificationType) {
  switch (type) {
    case 'success':
      return CheckCircle
    case 'error':
      return AlertCircle
    case 'warning':
      return AlertTriangle
    case 'info':
      return Info
  }
}
```

**Atualizar ui-store.ts:**
```typescript
import { v4 as uuidv4 } from 'uuid'
import type { Notification } from '../components/common/Notification'

interface UIState {
  // ... existing
  notifications: Notification[]
}

interface UIActions {
  // ... existing
  showNotification: (notification: Omit<Notification, 'id'>) => void
  removeNotification: (id: string) => void
  clearNotifications: () => void
}

export const useUIStore = create<UIStore>()(
  immer((set) => ({
    // State
    notifications: [],
    // ... rest

    // Actions
    showNotification: (notification) => set((state) => {
      state.notifications.push({
        ...notification,
        id: uuidv4(),
      })
    }),

    removeNotification: (id) => set((state) => {
      state.notifications = state.notifications.filter((n) => n.id !== id)
    }),

    clearNotifications: () => set({ notifications: [] }),
    // ... rest
  }))
)
```

**Adicionar ao App.tsx:**
```typescript
import { NotificationContainer } from './components/common/Notification'

function App() {
  // ... existing code

  return (
    <ErrorBoundary>
      <ThemeProvider>
        <GlobalKeyboardShortcuts>
          <NotificationContainer />  {/* ADD THIS */}
          <MainLayout>
            {/* ... rest */}
          </MainLayout>
        </GlobalKeyboardShortcuts>
      </ThemeProvider>
    </ErrorBoundary>
  )
}
```

**Checklist de Validação:**
- [ ] Notificações aparecem no canto superior direito
- [ ] Auto-dismiss após 5 segundos
- [ ] Botão X fecha manualmente
- [ ] 4 tipos (success, error, warning, info)
- [ ] Cores corretas para cada tipo
- [ ] Múltiplas notificações empilham

**Tempo Estimado:** 2-3 horas

---

## Task 1.3: Testar Fluxo End-to-End

**Objetivo:** Validar que toda a integração funciona.

### Checklist de Teste Manual

#### Teste 1: Inicialização
- [ ] App inicia sem erros no console
- [ ] Mostra loading state durante carregamento
- [ ] Detecta e carrega config do Waybar
- [ ] Se não existe config, mostra erro amigável
- [ ] MainLayout renderiza corretamente

#### Teste 2: Interface
- [ ] Sidebar esquerda mostra lista de bars
- [ ] Sidebar esquerda mostra module palette
- [ ] Painel central mostra BarEditor
- [ ] StatusBar na parte inferior
- [ ] Navegação entre tabs funciona

#### Teste 3: Drag-and-Drop
- [ ] Arrastar módulo da palette para zona funciona
- [ ] Módulo aparece na zona correta (left/center/right)
- [ ] Reordenar módulos dentro de zona funciona
- [ ] Mover módulo entre zonas funciona

#### Teste 4: Configuração de Módulos
- [ ] Clicar em módulo abre editor
- [ ] Campos do formulário carregam valores corretos
- [ ] Editar campos atualiza config
- [ ] Validação mostra erros em tempo real
- [ ] Fechar editor salva mudanças

#### Teste 5: Save/Reload
- [ ] Botão Save está habilitado quando há mudanças
- [ ] Ctrl+S salva configuração
- [ ] Backup é criado antes de salvar
- [ ] Waybar recarrega automaticamente
- [ ] Notificação de sucesso aparece
- [ ] Se há erros de validação, save é bloqueado

#### Teste 6: Undo/Redo
- [ ] Ctrl+Z desfaz última ação
- [ ] Ctrl+Shift+Z ou Ctrl+Y refaz
- [ ] Histórico funciona corretamente
- [ ] Limite de 50 ações respeitado

#### Teste 7: Atalhos de Teclado
- [ ] Ctrl+S salva
- [ ] Ctrl+Z desfaz
- [ ] Ctrl+Y refaz
- [ ] Ctrl+/ mostra ajuda de atalhos
- [ ] Escape fecha modals

**Tempo de Testes:** 2-3 horas

---

**TEMPO TOTAL FASE 1:** 12-20 horas

**Resultado Esperado:** MVP funcional com load/save/edit básico funcionando.

---

# FASE 2: MODULE EDITORS FALTANDO 🟠

**Prioridade:** ALTA
**Tempo Estimado:** 8-12 horas
**Dependências:** Fase 1 completa

## Task 2.1: Implementar WorkspacesEditor

**Objetivo:** Editor para módulo workspaces (mais complexo - suporta múltiplos WMs).

**Arquivo:** `src/components/modules/editors/WorkspacesEditor.tsx`

```typescript
// ============================================================================
// WORKSPACES MODULE EDITOR
// ============================================================================

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { WorkspacesModuleSchema } from '../../../lib/schemas/module-specific'
import type { WorkspacesModule } from '../../../lib/types/config'
import { Input, Select, Toggle, Button } from '../../common'
import { FormatBuilder } from '../../common/FormatBuilder'

interface WorkspacesEditorProps {
  config: WorkspacesModule
  onSave: (config: WorkspacesModule) => void
  onCancel: () => void
}

export function WorkspacesEditor({ config, onSave, onCancel }: WorkspacesEditorProps) {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<WorkspacesModule>({
    resolver: zodResolver(WorkspacesModuleSchema),
    defaultValues: config,
  })

  const onSubmit = (data: WorkspacesModule) => {
    onSave(data)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Basic Tab */}
      <section>
        <h3 className="mb-4 text-lg font-semibold">Basic Settings</h3>

        {/* Format */}
        <div className="mb-4">
          <label className="mb-2 block text-sm font-medium">Format String</label>
          <FormatBuilder
            value={watch('format') || '{name}'}
            onChange={(value) => setValue('format', value)}
            variables={[
              { name: 'name', description: 'Workspace name' },
              { name: 'id', description: 'Workspace ID' },
              { name: 'index', description: 'Workspace index' },
              { name: 'icon', description: 'Workspace icon' },
            ]}
          />
          {errors.format && (
            <p className="mt-1 text-sm text-red-500">{errors.format.message}</p>
          )}
        </div>

        {/* All Outputs */}
        <div className="mb-4">
          <label className="flex items-center gap-2">
            <Toggle {...register('all-outputs')} />
            <span className="text-sm">Show workspaces from all outputs</span>
          </label>
          <p className="mt-1 text-xs text-gray-400">
            If enabled, shows workspaces from all monitors
          </p>
        </div>

        {/* Active Only */}
        <div className="mb-4">
          <label className="flex items-center gap-2">
            <Toggle {...register('active-only')} />
            <span className="text-sm">Show only active workspace</span>
          </label>
        </div>
      </section>

      {/* Display Tab */}
      <section>
        <h3 className="mb-4 text-lg font-semibold">Display Options</h3>

        {/* Disable Scroll */}
        <div className="mb-4">
          <label className="flex items-center gap-2">
            <Toggle {...register('disable-scroll')} />
            <span className="text-sm">Disable scroll to change workspace</span>
          </label>
        </div>

        {/* Disable Click */}
        <div className="mb-4">
          <label className="flex items-center gap-2">
            <Toggle {...register('disable-click')} />
            <span className="text-sm">Disable click to switch workspace</span>
          </label>
        </div>

        {/* Persistent Workspaces */}
        <div className="mb-4">
          <label className="mb-2 block text-sm font-medium">
            Persistent Workspaces (JSON)
          </label>
          <textarea
            {...register('persistent-workspaces')}
            className="w-full rounded border border-gray-700 bg-gray-900 p-2 font-mono text-sm"
            rows={4}
            placeholder='{\n  "1": ["DP-1"],\n  "2": ["DP-1"],\n  "9": ["eDP-1"]\n}'
          />
          <p className="mt-1 text-xs text-gray-400">
            Workspace to output mapping (JSON format)
          </p>
          {errors['persistent-workspaces'] && (
            <p className="mt-1 text-sm text-red-500">
              {errors['persistent-workspaces'].message}
            </p>
          )}
        </div>
      </section>

      {/* Advanced Tab */}
      <section>
        <h3 className="mb-4 text-lg font-semibold">Advanced</h3>

        {/* Sort by Number */}
        <div className="mb-4">
          <label className="flex items-center gap-2">
            <Toggle {...register('sort-by-number')} />
            <span className="text-sm">Sort workspaces by number</span>
          </label>
        </div>

        {/* Sort by Name */}
        <div className="mb-4">
          <label className="flex items-center gap-2">
            <Toggle {...register('sort-by-name')} />
            <span className="text-sm">Sort workspaces by name</span>
          </label>
        </div>

        {/* Sort by Coordinates */}
        <div className="mb-4">
          <label className="flex items-center gap-2">
            <Toggle {...register('sort-by-coordinates')} />
            <span className="text-sm">Sort workspaces by coordinates</span>
          </label>
        </div>

        {/* Numeric First */}
        <div className="mb-4">
          <label className="flex items-center gap-2">
            <Toggle {...register('numeric-first')} />
            <span className="text-sm">Show numeric workspaces first</span>
          </label>
        </div>
      </section>

      {/* Actions */}
      <div className="flex justify-end gap-3">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" variant="primary">
          Save
        </Button>
      </div>
    </form>
  )
}
```

**Schema em module-specific.ts:**
```typescript
export const WorkspacesModuleSchema = CommonModuleConfigSchema.extend({
  'all-outputs': z.boolean().default(false),
  'active-only': z.boolean().default(false),
  'disable-scroll': z.boolean().default(false),
  'disable-click': z.boolean().default(false),
  'persistent-workspaces': z.record(z.array(z.string())).optional(),
  'sort-by-number': z.boolean().default(false),
  'sort-by-name': z.boolean().default(false),
  'sort-by-coordinates': z.boolean().default(false),
  'numeric-first': z.boolean().default(false),
})

export type WorkspacesModule = z.infer<typeof WorkspacesModuleSchema>
```

**Checklist:**
- [ ] Schema criado e exportado
- [ ] Editor com 3 seções (Basic, Display, Advanced)
- [ ] FormatBuilder para format string
- [ ] Toggles para boolean fields
- [ ] Textarea para persistent-workspaces (JSON)
- [ ] Validação em tempo real
- [ ] Salva corretamente

**Tempo:** 2-3 horas

---

## Task 2.2: Implementar WindowEditor

**Arquivo:** `src/components/modules/editors/WindowEditor.tsx`

```typescript
// ============================================================================
// WINDOW MODULE EDITOR
// ============================================================================

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { WindowModuleSchema } from '../../../lib/schemas/module-specific'
import type { WindowModule } from '../../../lib/types/config'
import { Input, Select, Button } from '../../common'
import { FormatBuilder } from '../../common/FormatBuilder'

interface WindowEditorProps {
  config: WindowModule
  onSave: (config: WindowModule) => void
  onCancel: () => void
}

export function WindowEditor({ config, onSave, onCancel }: WindowEditorProps) {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<WindowModule>({
    resolver: zodResolver(WindowModuleSchema),
    defaultValues: config,
  })

  return (
    <form onSubmit={handleSubmit(onSave)} className="space-y-6">
      <section>
        <h3 className="mb-4 text-lg font-semibold">Window Title</h3>

        {/* Format */}
        <div className="mb-4">
          <label className="mb-2 block text-sm font-medium">Format String</label>
          <FormatBuilder
            value={watch('format') || '{title}'}
            onChange={(value) => setValue('format', value)}
            variables={[
              { name: 'title', description: 'Window title' },
              { name: 'app_id', description: 'Application ID' },
              { name: 'class', description: 'Window class' },
            ]}
          />
        </div>

        {/* Max Length */}
        <div className="mb-4">
          <label className="mb-2 block text-sm font-medium">Max Length</label>
          <Input
            type="number"
            {...register('max-length', { valueAsNumber: true })}
            placeholder="50"
          />
          <p className="mt-1 text-xs text-gray-400">
            Maximum number of characters to display
          </p>
          {errors['max-length'] && (
            <p className="mt-1 text-sm text-red-500">{errors['max-length'].message}</p>
          )}
        </div>

        {/* Separator */}
        <div className="mb-4">
          <label className="mb-2 block text-sm font-medium">Separator</label>
          <Input
            {...register('separator')}
            placeholder=" - "
          />
          <p className="mt-1 text-xs text-gray-400">
            Separator between workspace and window title
          </p>
        </div>

        {/* Rewrite */}
        <div className="mb-4">
          <label className="mb-2 block text-sm font-medium">
            Rewrite Rules (JSON)
          </label>
          <textarea
            {...register('rewrite')}
            className="w-full rounded border border-gray-700 bg-gray-900 p-2 font-mono text-sm"
            rows={4}
            placeholder='{\n  "(.*) - Mozilla Firefox": "$1",\n  "(.*) - Chromium": "$1"\n}'
          />
          <p className="mt-1 text-xs text-gray-400">
            Regex rules to rewrite window titles
          </p>
        </div>
      </section>

      <div className="flex justify-end gap-3">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" variant="primary">
          Save
        </Button>
      </div>
    </form>
  )
}
```

**Schema:**
```typescript
export const WindowModuleSchema = CommonModuleConfigSchema.extend({
  'max-length': z.number().int().positive().optional(),
  separator: z.string().default(' - '),
  rewrite: z.record(z.string()).optional(),
})

export type WindowModule = z.infer<typeof WindowModuleSchema>
```

**Tempo:** 1-2 horas

---

## Task 2.3: Implementar PulseaudioEditor

**Arquivo:** `src/components/modules/editors/PulseaudioEditor.tsx`

```typescript
// ============================================================================
// PULSEAUDIO MODULE EDITOR
// ============================================================================

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { PulseaudioModuleSchema } from '../../../lib/schemas/module-specific'
import type { PulseaudioModule } from '../../../lib/types/config'
import { Input, Select, Toggle, Button } from '../../common'
import { FormatBuilder } from '../../common/FormatBuilder'

interface PulseaudioEditorProps {
  config: PulseaudioModule
  onSave: (config: PulseaudioModule) => void
  onCancel: () => void
}

export function PulseaudioEditor({ config, onSave, onCancel }: PulseaudioEditorProps) {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<PulseaudioModule>({
    resolver: zodResolver(PulseaudioModuleSchema),
    defaultValues: config,
  })

  return (
    <form onSubmit={handleSubmit(onSave)} className="space-y-6">
      <section>
        <h3 className="mb-4 text-lg font-semibold">Audio Settings</h3>

        {/* Format */}
        <div className="mb-4">
          <label className="mb-2 block text-sm font-medium">Format String</label>
          <FormatBuilder
            value={watch('format') || '{volume}% {icon}'}
            onChange={(value) => setValue('format', value)}
            variables={[
              { name: 'volume', description: 'Volume percentage' },
              { name: 'icon', description: 'Volume icon' },
            ]}
          />
        </div>

        {/* Format Muted */}
        <div className="mb-4">
          <label className="mb-2 block text-sm font-medium">Format (Muted)</label>
          <Input
            {...register('format-muted')}
            placeholder="🔇 {volume}%"
          />
        </div>

        {/* Scroll Step */}
        <div className="mb-4">
          <label className="mb-2 block text-sm font-medium">Scroll Step (%)</label>
          <Input
            type="number"
            {...register('scroll-step', { valueAsNumber: true })}
            placeholder="5"
          />
          <p className="mt-1 text-xs text-gray-400">
            Volume change per scroll (1-100)
          </p>
          {errors['scroll-step'] && (
            <p className="mt-1 text-sm text-red-500">{errors['scroll-step'].message}</p>
          )}
        </div>

        {/* Max Volume */}
        <div className="mb-4">
          <label className="mb-2 block text-sm font-medium">Max Volume (%)</label>
          <Input
            type="number"
            {...register('max-volume', { valueAsNumber: true })}
            placeholder="100"
          />
          <p className="mt-1 text-xs text-gray-400">
            Maximum allowed volume (up to 150)
          </p>
          {errors['max-volume'] && (
            <p className="mt-1 text-sm text-red-500">{errors['max-volume'].message}</p>
          )}
        </div>

        {/* Ignored Sinks */}
        <div className="mb-4">
          <label className="mb-2 block text-sm font-medium">
            Ignored Sinks (comma-separated)
          </label>
          <Input
            {...register('ignored-sinks')}
            placeholder="alsa_output.pci-0000_00_1b.0.analog-stereo"
          />
          <p className="mt-1 text-xs text-gray-400">
            Audio sinks to ignore (one per line)
          </p>
        </div>
      </section>

      <div className="flex justify-end gap-3">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" variant="primary">
          Save
        </Button>
      </div>
    </form>
  )
}
```

**Schema:**
```typescript
export const PulseaudioModuleSchema = CommonModuleConfigSchema.extend({
  'format-muted': z.string().optional(),
  'scroll-step': z.number().int().min(1).max(100).default(5),
  'max-volume': z.number().int().min(1).max(150).default(100),
  'ignored-sinks': z.array(z.string()).optional(),
})

export type PulseaudioModule = z.infer<typeof PulseaudioModuleSchema>
```

**Tempo:** 1.5-2 horas

---

## Task 2.4: Implementar TrayEditor

**Arquivo:** `src/components/modules/editors/TrayEditor.tsx`

```typescript
// ============================================================================
// TRAY MODULE EDITOR
// ============================================================================

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { TrayModuleSchema } from '../../../lib/schemas/module-specific'
import type { TrayModule } from '../../../lib/types/config'
import { Input, Select, Toggle, Button } from '../../common'

interface TrayEditorProps {
  config: TrayModule
  onSave: (config: TrayModule) => void
  onCancel: () => void
}

export function TrayEditor({ config, onSave, onCancel }: TrayEditorProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<TrayModule>({
    resolver: zodResolver(TrayModuleSchema),
    defaultValues: config,
  })

  return (
    <form onSubmit={handleSubmit(onSave)} className="space-y-6">
      <section>
        <h3 className="mb-4 text-lg font-semibold">System Tray</h3>

        {/* Icon Size */}
        <div className="mb-4">
          <label className="mb-2 block text-sm font-medium">Icon Size (px)</label>
          <Input
            type="number"
            {...register('icon-size', { valueAsNumber: true })}
            placeholder="21"
          />
          <p className="mt-1 text-xs text-gray-400">
            Size of tray icons (recommended: 16-24)
          </p>
          {errors['icon-size'] && (
            <p className="mt-1 text-sm text-red-500">{errors['icon-size'].message}</p>
          )}
        </div>

        {/* Spacing */}
        <div className="mb-4">
          <label className="mb-2 block text-sm font-medium">Spacing (px)</label>
          <Input
            type="number"
            {...register('spacing', { valueAsNumber: true })}
            placeholder="10"
          />
          <p className="mt-1 text-xs text-gray-400">
            Space between tray icons
          </p>
        </div>

        {/* Reverse Direction */}
        <div className="mb-4">
          <label className="flex items-center gap-2">
            <Toggle {...register('reverse-direction')} />
            <span className="text-sm">Reverse icon order</span>
          </label>
        </div>

        {/* Show Passive Items */}
        <div className="mb-4">
          <label className="flex items-center gap-2">
            <Toggle {...register('show-passive-items')} />
            <span className="text-sm">Show passive items</span>
          </label>
          <p className="mt-1 text-xs text-gray-400">
            Show icons that don't require attention
          </p>
        </div>
      </section>

      <div className="flex justify-end gap-3">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" variant="primary">
          Save
        </Button>
      </div>
    </form>
  )
}
```

**Schema:**
```typescript
export const TrayModuleSchema = CommonModuleConfigSchema.extend({
  'icon-size': z.number().int().min(8).max(48).default(21),
  spacing: z.number().int().min(0).max(50).default(10),
  'reverse-direction': z.boolean().default(false),
  'show-passive-items': z.boolean().default(false),
})

export type TrayModule = z.infer<typeof TrayModuleSchema>
```

**Tempo:** 1-1.5 horas

---

## Task 2.5: Registrar Novos Editores

**Arquivo:** `src/components/modules/editors/index.ts`

```typescript
export { WorkspacesEditor } from './WorkspacesEditor'
export { WindowEditor } from './WindowEditor'
export { PulseaudioEditor } from './PulseaudioEditor'
export { TrayEditor } from './TrayEditor'
// ... existing exports
```

**Arquivo:** `src/components/modules/ModuleEditor.tsx`

Adicionar cases no switch:

```typescript
function getEditorForModule(module: ModuleInstance) {
  switch (module.type) {
    case 'battery':
      return <BatteryEditor config={module.config} onSave={handleSave} onCancel={handleCancel} />
    // ... existing cases
    case 'workspaces':
      return <WorkspacesEditor config={module.config} onSave={handleSave} onCancel={handleCancel} />
    case 'window':
      return <WindowEditor config={module.config} onSave={handleSave} onCancel={handleCancel} />
    case 'pulseaudio':
      return <PulseaudioEditor config={module.config} onSave={handleSave} onCancel={handleCancel} />
    case 'tray':
      return <TrayEditor config={module.config} onSave={handleSave} onCancel={handleCancel} />
    default:
      return <div>No editor available for {module.type}</div>
  }
}
```

**Checklist:**
- [ ] Todos 4 editores implementados
- [ ] Schemas criados e exportados
- [ ] Tipos TypeScript gerados
- [ ] Registrados no ModuleEditor
- [ ] Metadata adicionada em constants/modules.ts

**Tempo Task 2.5:** 30 minutos

---

**TEMPO TOTAL FASE 2:** 8-12 horas

---

# FASE 3: BUG FIXES E VALIDAÇÕES 🟡

**Prioridade:** MÉDIA-ALTA
**Tempo Estimado:** 6-8 horas
**Dependências:** Fase 1 completa

## Task 3.1: Corrigir Validação de Battery States

**Problema:** Battery states são ≤ threshold (inverso de outros módulos).

**Arquivo:** `src/components/modules/editors/BatteryEditor.tsx`

Adicionar aviso visual:

```typescript
<div className="mb-4">
  <label className="mb-2 block text-sm font-medium">
    Battery States (Thresholds)
  </label>

  <div className="mb-3 rounded-lg border border-yellow-800 bg-yellow-950/30 p-3">
    <p className="text-sm text-yellow-200">
      ⚠️ <strong>Important:</strong> Battery states trigger when capacity is{' '}
      <strong>≤ threshold</strong> (opposite of other modules).
    </p>
    <p className="mt-1 text-xs text-yellow-300">
      Example: "warning": 30 will activate at 30% or <strong>below</strong>.
    </p>
  </div>

  <div className="space-y-3">
    <div>
      <label className="mb-1 block text-xs text-gray-400">Warning (%)</label>
      <Input
        type="number"
        {...register('states.warning', { valueAsNumber: true })}
        placeholder="30"
      />
    </div>
    <div>
      <label className="mb-1 block text-xs text-gray-400">Critical (%)</label>
      <Input
        type="number"
        {...register('states.critical', { valueAsNumber: true })}
        placeholder="15"
      />
    </div>
  </div>
</div>
```

**Schema Validation:**

```typescript
export const BatteryModuleSchema = CommonModuleConfigSchema.extend({
  // ... existing fields
  states: z.object({
    warning: z.number().int().min(0).max(100).optional(),
    critical: z.number().int().min(0).max(100).optional(),
  }).optional().superRefine((states, ctx) => {
    // Ensure critical < warning
    if (states?.critical && states?.warning) {
      if (states.critical >= states.warning) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['critical'],
          message: 'Critical threshold must be lower than warning threshold',
        })
      }
    }
  }),
})
```

**Checklist:**
- [ ] Aviso visual no BatteryEditor
- [ ] Documentação clara sobre ≤ threshold
- [ ] Validação: critical < warning
- [ ] Tests para validação

**Tempo:** 1 hora

---

## Task 3.2: Garantir IDs Únicos de Módulos

**Problema:** Usuário pode criar módulos com IDs duplicados.

**Arquivo:** `src/store/config-store.ts`

Modificar `addModule`:

```typescript
addModule: (barId, module) => set((state) => {
  const bar = state.config.bars.find(b => b.id === barId)
  if (!bar) return

  // Generate unique module ID
  const moduleName = module.customName
    ? `${module.type}#${module.customName}`
    : module.type

  // Check for duplicates
  const existingModule = bar.modules.find(m => {
    const existingName = m.customName
      ? `${m.type}#${m.customName}`
      : m.type
    return existingName === moduleName
  })

  if (existingModule) {
    console.error(`[Config Store] Duplicate module ID: ${moduleName}`)

    // Show error notification
    useUIStore.getState().showNotification({
      type: 'error',
      title: 'Duplicate Module',
      message: `Module "${moduleName}" already exists. Please use a different custom name.`,
    })
    return
  }

  // Add module
  const newModule: ModuleInstance = {
    ...module,
    id: crypto.randomUUID(),
  }
  bar.modules.push(newModule)
  state.isDirty = true
}),
```

**Validation Utility:**

```typescript
// src/lib/utils/validation.ts

export function validateUniqueModuleIds(bar: BarDefinition): string[] {
  const errors: string[] = []
  const moduleNames = new Set<string>()

  for (const module of bar.modules) {
    const moduleName = module.customName
      ? `${module.type}#${module.customName}`
      : module.type

    if (moduleNames.has(moduleName)) {
      errors.push(`Duplicate module ID: ${moduleName}`)
    } else {
      moduleNames.add(moduleName)
    }
  }

  return errors
}
```

**Checklist:**
- [ ] addModule verifica duplicatas
- [ ] Mostra erro se ID já existe
- [ ] Validação em validateFullConfig
- [ ] Tests para duplicatas

**Tempo:** 1.5 horas

---

## Task 3.3: Preservar Comentários JSONC

**Problema:** Comentários do usuário são perdidos ao salvar.

**Análise:** Backend `strip_jsonc_comments` remove todos comentários. `add_config_comments` adiciona novos genéricos.

**Solução:** Armazenar comentários originais e reinseri-los.

**Arquivo:** `src-tauri/src/config/parser.rs`

```rust
use regex::Regex;
use std::collections::HashMap;

/// Extract comments from JSONC and store their positions
pub fn extract_comments(jsonc: &str) -> HashMap<usize, Vec<String>> {
    let mut comments = HashMap::new();
    let mut line_num = 0;

    for line in jsonc.lines() {
        line_num += 1;
        let trimmed = line.trim();

        // Single-line comment
        if let Some(comment_pos) = trimmed.find("//") {
            let comment = trimmed[comment_pos..].to_string();
            comments.entry(line_num).or_insert_with(Vec::new).push(comment);
        }

        // TODO: Handle multi-line comments /* */
    }

    comments
}

/// Reinsert comments into JSON at appropriate positions
pub fn reinsert_comments(json: &str, comments: HashMap<usize, Vec<String>>) -> String {
    let mut result = String::new();
    let mut line_num = 0;

    for line in json.lines() {
        line_num += 1;

        // Add original comments before this line
        if let Some(line_comments) = comments.get(&line_num) {
            for comment in line_comments {
                result.push_str("  ");
                result.push_str(comment);
                result.push('\n');
            }
        }

        result.push_str(line);
        result.push('\n');
    }

    result
}
```

**Modificar writer.rs:**

```rust
pub fn write_config_file(path: &str, content: &str) -> Result<()> {
    // If file exists, extract comments first
    let comments = if let Ok(existing) = std::fs::read_to_string(path) {
        parser::extract_comments(&existing)
    } else {
        HashMap::new()
    };

    // Create backup
    create_backup(path)?;

    // Add default header if no comments exist
    let with_comments = if comments.is_empty() {
        writer::add_config_comments(content)
    } else {
        parser::reinsert_comments(content, comments)
    };

    // Write file
    std::fs::write(path, with_comments)?;

    Ok(())
}
```

**Checklist:**
- [ ] extract_comments implementado
- [ ] reinsert_comments implementado
- [ ] Tests para preservação
- [ ] Suporte para // e /* */

**Tempo:** 2-3 horas

---

## Task 3.4: Configurar Collision Detection (dnd-kit)

**Problema:** Collision detection pode estar incorreto.

**Arquivo:** `src/components/bars/BarEditor.tsx`

```typescript
import { closestCenter, closestCorners } from '@dnd-kit/core'

<DndContext
  sensors={sensors}
  collisionDetection={closestCenter}  // ADD THIS - for lists
  onDragStart={handleDragStart}
  onDragOver={handleDragOver}
  onDragEnd={handleDragEnd}
>
```

**PRP recomenda:**
- `closestCenter` para listas (vertical/horizontal)
- `closestCorners` para grids

Nossa ModuleZone é uma lista vertical, então `closestCenter` está correto.

**Checklist:**
- [ ] collisionDetection definido
- [ ] Usar closestCenter
- [ ] Drag suave e preciso
- [ ] Sem "jank" ou saltos

**Tempo:** 30 minutos

---

## Task 3.5: Implementar Debounce na Validação

**Problema:** Validação em tempo real sem debounce pode causar lag.

**Arquivo:** `src/store/validation-store.ts`

```typescript
import { debounce } from 'lodash-es'

// Debounced validation function
const debouncedValidate = debounce((config: WaybarConfig) => {
  const errors = validateFullConfig(config)
  useValidationStore.getState().setErrors(errors)
}, 300)

// Hook para validação automática
export function useAutoValidation() {
  const config = useConfigStore((state) => state.config)

  useEffect(() => {
    debouncedValidate(config)
  }, [config])
}
```

**Usar em App.tsx:**

```typescript
import { useAutoValidation } from './store/validation-store'

function App() {
  useAutoValidation()  // ADD THIS

  // ... rest
}
```

**Dependências:**
```bash
npm install lodash-es
npm install -D @types/lodash-es
```

**Checklist:**
- [ ] Debounce de 300ms implementado
- [ ] Validação não bloqueia UI
- [ ] Performance aceitável com configs grandes

**Tempo:** 1 hora

---

## Task 3.6: Verificar Monaco Editor Workers

**Problema:** Monaco pode não ter intellisense se workers não configurados.

**Arquivo:** `vite.config.ts`

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import monacoEditorPlugin from 'vite-plugin-monaco-editor'

export default defineConfig({
  plugins: [
    react(),
    monacoEditorPlugin({
      languageWorkers: ['css', 'json'],
      customWorkers: [
        {
          label: 'editorWorkerService',
          entry: 'monaco-editor/esm/vs/editor/editor.worker',
        },
      ],
    }),
  ],
  // ... rest
})
```

**Dependências:**
```bash
npm install -D vite-plugin-monaco-editor
```

**Arquivo:** `src/components/styles/CodeEditor.tsx`

Verificar imports:

```typescript
import * as monaco from 'monaco-editor'
import { loader } from '@monaco-editor/react'

// Configure Monaco
loader.config({ monaco })

export function CodeEditor({ value, onChange, language }: CodeEditorProps) {
  return (
    <MonacoEditor
      height="400px"
      language={language}
      value={value}
      onChange={onChange}
      theme="vs-dark"
      options={{
        minimap: { enabled: false },
        fontSize: 14,
        lineNumbers: 'on',
        automaticLayout: true,
      }}
    />
  )
}
```

**Checklist:**
- [ ] vite-plugin-monaco-editor instalado
- [ ] Workers configurados em vite.config.ts
- [ ] CSS autocomplete funciona
- [ ] JSON autocomplete funciona
- [ ] Sem errors no console sobre workers

**Tempo:** 1-2 horas

---

**TEMPO TOTAL FASE 3:** 6-8 horas

---

# FASE 4: UX ENHANCEMENTS 🟡

**Prioridade:** MÉDIA
**Tempo Estimado:** 8-10 horas
**Dependências:** Fases 1-3 completas

## Task 4.1: Implementar Theme Toggle

**Objetivo:** Dark/Light theme com sistema de preferência.

**Arquivo:** `src/components/common/ThemeProvider.tsx`

```typescript
// ============================================================================
// THEME PROVIDER
// ============================================================================

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'

type Theme = 'light' | 'dark' | 'system'

interface ThemeContextType {
  theme: Theme
  actualTheme: 'light' | 'dark'
  setTheme: (theme: Theme) => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(() => {
    // Load from localStorage
    const saved = localStorage.getItem('waybar-gui-theme')
    return (saved as Theme) || 'system'
  })

  const [actualTheme, setActualTheme] = useState<'light' | 'dark'>('dark')

  // Detect system theme
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')

    const updateActualTheme = () => {
      if (theme === 'system') {
        setActualTheme(mediaQuery.matches ? 'dark' : 'light')
      } else {
        setActualTheme(theme)
      }
    }

    updateActualTheme()
    mediaQuery.addEventListener('change', updateActualTheme)
    return () => mediaQuery.removeEventListener('change', updateActualTheme)
  }, [theme])

  // Apply theme class to document
  useEffect(() => {
    const root = window.document.documentElement
    root.classList.remove('light', 'dark')
    root.classList.add(actualTheme)
  }, [actualTheme])

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme)
    localStorage.setItem('waybar-gui-theme', newTheme)
  }

  return (
    <ThemeContext.Provider value={{ theme, actualTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider')
  }
  return context
}
```

**Arquivo:** `src/components/common/ThemeToggle.tsx`

```typescript
// ============================================================================
// THEME TOGGLE BUTTON
// ============================================================================

import { Sun, Moon, Monitor } from 'lucide-react'
import { useTheme } from './ThemeProvider'

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  const cycleTheme = () => {
    const next = theme === 'system' ? 'light' : theme === 'light' ? 'dark' : 'system'
    setTheme(next)
  }

  const Icon = theme === 'system' ? Monitor : theme === 'light' ? Sun : Moon

  return (
    <button
      onClick={cycleTheme}
      className="rounded p-2 hover:bg-gray-800"
      title={`Theme: ${theme}`}
    >
      <Icon className="h-5 w-5" />
    </button>
  )
}
```

**Adicionar ao StatusBar:**

```typescript
import { ThemeToggle } from '../common/ThemeToggle'

export function StatusBar() {
  return (
    <div className="flex items-center justify-between border-t border-gray-800 bg-gray-950 px-4 py-2">
      {/* ... existing content */}

      <div className="flex items-center gap-2">
        <ThemeToggle />  {/* ADD THIS */}
      </div>
    </div>
  )
}
```

**Configurar Tailwind:**

```javascript
// tailwind.config.js
module.exports = {
  darkMode: 'class',  // ADD THIS
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  // ... rest
}
```

**Checklist:**
- [ ] Theme provider funciona
- [ ] Theme persiste em localStorage
- [ ] Sistema detecta prefers-color-scheme
- [ ] Toggle cicla: system → light → dark → system
- [ ] Classes CSS aplicadas ao root
- [ ] Tailwind dark: classes funcionam

**Tempo:** 2-3 horas

---

## Task 4.2: Adicionar Loading States

**Objetivo:** Feedback visual para operações assíncronas.

**Arquivo:** `src/components/common/LoadingSpinner.tsx` (já existe?)

Verificar se já existe, senão criar:

```typescript
// ============================================================================
// LOADING SPINNER
// ============================================================================

import { Loader2 } from 'lucide-react'

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function LoadingSpinner({ size = 'md', className = '' }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
  }

  return (
    <Loader2
      className={`animate-spin text-blue-500 ${sizeClasses[size]} ${className}`}
    />
  )
}
```

**Arquivo:** `src/components/common/LoadingState.tsx` (já existe?)

```typescript
// ============================================================================
// LOADING STATE (Full screen or inline)
// ============================================================================

import { LoadingSpinner } from './LoadingSpinner'

interface LoadingStateProps {
  message?: string
  inline?: boolean
}

export function LoadingState({ message, inline = false }: LoadingStateProps) {
  if (inline) {
    return (
      <div className="flex items-center gap-3 p-4">
        <LoadingSpinner size="sm" />
        {message && <span className="text-sm text-gray-400">{message}</span>}
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center gap-4">
      <LoadingSpinner size="lg" />
      {message && <p className="text-gray-300">{message}</p>}
    </div>
  )
}
```

**Usar em operações assíncronas:**

```typescript
// Example: Save button with loading state
function SaveButton() {
  const [isSaving, setIsSaving] = useState(false)
  const saveConfig = useConfigStore((state) => state.saveConfig)

  const handleSave = async () => {
    setIsSaving(true)
    try {
      await saveConfig()
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Button onClick={handleSave} disabled={isSaving}>
      {isSaving ? (
        <>
          <LoadingSpinner size="sm" className="mr-2" />
          Saving...
        </>
      ) : (
        'Save'
      )}
    </Button>
  )
}
```

**Checklist:**
- [ ] LoadingSpinner component
- [ ] LoadingState component
- [ ] Loading durante save config
- [ ] Loading durante load config
- [ ] Loading em ModuleEditor ao salvar
- [ ] Skeleton states (opcional)

**Tempo:** 1-2 horas

---

## Task 4.3: Implementar Dialogs Restantes

**Objetivo:** Import/Export/Template/Settings dialogs.

### Task 4.3.1: ImportDialog

**Arquivo:** `src/components/dialogs/ImportDialog.tsx`

```typescript
// ============================================================================
// IMPORT CONFIGURATION DIALOG
// ============================================================================

import { useState } from 'react'
import { Upload, File } from 'lucide-react'
import { Button, Input } from '../common'
import { Modal } from '../common/Modal'
import { useConfigStore } from '../../store/config-store'
import { detectConfigPaths, loadConfig } from '../../lib/tauri/commands'
import { transformWaybarJsonToConfig } from '../../lib/utils/config-transform'

interface ImportDialogProps {
  isOpen: boolean
  onClose: () => void
}

export function ImportDialog({ isOpen, onClose }: ImportDialogProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [customPath, setCustomPath] = useState('')
  const loadConfigToStore = useConfigStore((state) => state.loadConfig)

  const handleImportDefault = async () => {
    setIsLoading(true)
    try {
      const paths = await detectConfigPaths()
      const configFile = await loadConfig(paths.config_file)
      const waybarJson = JSON.parse(configFile.content)
      const config = transformWaybarJsonToConfig(waybarJson)
      loadConfigToStore(config, paths.config_file)
      onClose()
    } catch (error: any) {
      alert(`Failed to import: ${error.message}`)
    } finally {
      setIsLoading(false)
    }
  }

  const handleImportCustom = async () => {
    if (!customPath.trim()) return

    setIsLoading(true)
    try {
      const configFile = await loadConfig(customPath)
      const waybarJson = JSON.parse(configFile.content)
      const config = transformWaybarJsonToConfig(waybarJson)
      loadConfigToStore(config, customPath)
      onClose()
    } catch (error: any) {
      alert(`Failed to import: ${error.message}`)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Import Configuration">
      <div className="space-y-6">
        {/* Import from default location */}
        <div>
          <h3 className="mb-2 font-semibold">Default Location</h3>
          <p className="mb-3 text-sm text-gray-400">
            Import from ~/.config/waybar/config
          </p>
          <Button
            onClick={handleImportDefault}
            disabled={isLoading}
            variant="primary"
          >
            <File className="mr-2 h-4 w-4" />
            Import Default Config
          </Button>
        </div>

        {/* Import from custom path */}
        <div>
          <h3 className="mb-2 font-semibold">Custom Path</h3>
          <div className="flex gap-2">
            <Input
              value={customPath}
              onChange={(e) => setCustomPath(e.target.value)}
              placeholder="/path/to/config.jsonc"
              className="flex-1"
            />
            <Button
              onClick={handleImportCustom}
              disabled={isLoading || !customPath.trim()}
            >
              <Upload className="mr-2 h-4 w-4" />
              Import
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  )
}
```

**Tempo:** 1 hora

---

### Task 4.3.2: ExportDialog

**Arquivo:** `src/components/dialogs/ExportDialog.tsx`

```typescript
// ============================================================================
// EXPORT CONFIGURATION DIALOG
// ============================================================================

import { useState } from 'react'
import { Download } from 'lucide-react'
import { Button, Input } from '../common'
import { Modal } from '../common/Modal'
import { useConfigStore } from '../../store/config-store'
import { transformConfigToWaybarJson } from '../../lib/utils/config-transform'
import { saveConfig } from '../../lib/tauri/commands'

interface ExportDialogProps {
  isOpen: boolean
  onClose: () => void
}

export function ExportDialog({ isOpen, onClose }: ExportDialogProps) {
  const [exportPath, setExportPath] = useState('')
  const [isExporting, setIsExporting] = useState(false)
  const config = useConfigStore((state) => state.config)

  const handleExport = async () => {
    if (!exportPath.trim()) return

    setIsExporting(true)
    try {
      const waybarJson = transformConfigToWaybarJson(config)
      const jsonString = JSON.stringify(waybarJson, null, 2)
      await saveConfig(exportPath, jsonString)
      alert('Configuration exported successfully!')
      onClose()
    } catch (error: any) {
      alert(`Failed to export: ${error.message}`)
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Export Configuration">
      <div className="space-y-4">
        <p className="text-sm text-gray-400">
          Export the current configuration to a file
        </p>

        <div>
          <label className="mb-2 block text-sm font-medium">Export Path</label>
          <Input
            value={exportPath}
            onChange={(e) => setExportPath(e.target.value)}
            placeholder="/path/to/export/config.json"
          />
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleExport}
            disabled={isExporting || !exportPath.trim()}
          >
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>
    </Modal>
  )
}
```

**Tempo:** 45 minutos

---

### Task 4.3.3: TemplateDialog

**Arquivo:** `src/components/dialogs/TemplateDialog.tsx`

```typescript
// ============================================================================
// TEMPLATE SELECTION DIALOG
// ============================================================================

import { Button } from '../common'
import { Modal } from '../common/Modal'
import { useConfigStore } from '../../store/config-store'
import { TEMPLATES } from '../../lib/constants/templates'

interface TemplateDialogProps {
  isOpen: boolean
  onClose: () => void
}

export function TemplateDialog({ isOpen, onClose }: TemplateDialogProps) {
  const loadConfig = useConfigStore((state) => state.loadConfig)

  const handleSelectTemplate = (template: any) => {
    loadConfig(template.config, null)
    onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Choose Template">
      <div className="grid grid-cols-2 gap-4">
        {TEMPLATES.map((template) => (
          <button
            key={template.id}
            onClick={() => handleSelectTemplate(template)}
            className="rounded-lg border border-gray-800 p-4 text-left hover:border-blue-600 hover:bg-gray-900"
          >
            <h3 className="mb-2 font-semibold">{template.name}</h3>
            <p className="text-sm text-gray-400">{template.description}</p>
          </button>
        ))}
      </div>
    </Modal>
  )
}
```

**Criar Templates:**

**Arquivo:** `src/lib/constants/templates.ts`

```typescript
// ============================================================================
// CONFIGURATION TEMPLATES
// ============================================================================

import type { WaybarConfig } from '../types/config'
import { v4 as uuidv4 } from 'uuid'

interface Template {
  id: string
  name: string
  description: string
  config: WaybarConfig
}

export const TEMPLATES: Template[] = [
  {
    id: 'minimal',
    name: 'Minimal',
    description: 'Simple bar with clock, CPU, and memory',
    config: {
      bars: [
        {
          id: uuidv4(),
          name: 'Minimal Bar',
          enabled: true,
          order: 0,
          config: {
            position: 'top',
            height: 30,
            spacing: 4,
          },
          modules: [
            {
              id: uuidv4(),
              type: 'cpu',
              position: 'left',
              order: 0,
              config: { format: '💻 {usage}%' },
              enabled: true,
            },
            {
              id: uuidv4(),
              type: 'memory',
              position: 'left',
              order: 1,
              config: { format: '🧠 {percentage}%' },
              enabled: true,
            },
            {
              id: uuidv4(),
              type: 'clock',
              position: 'center',
              order: 0,
              config: { format: '{:%H:%M:%S}' },
              enabled: true,
            },
          ],
        },
      ],
      styles: [],
      metadata: {
        version: '1.0.0',
        createdAt: new Date().toISOString(),
        modifiedAt: new Date().toISOString(),
        appVersion: '0.1.0',
      },
    },
  },
  // TODO: Add more templates (Full Featured, Workspaces Focused, etc.)
]
```

**Tempo:** 1.5 horas

---

### Task 4.3.4: SettingsDialog

**Arquivo:** `src/components/dialogs/SettingsDialog.tsx`

```typescript
// ============================================================================
// APP SETTINGS DIALOG
// ============================================================================

import { useState } from 'react'
import { Button, Toggle, Select } from '../common'
import { Modal } from '../common/Modal'

interface SettingsDialogProps {
  isOpen: boolean
  onClose: () => void
}

export function SettingsDialog({ isOpen, onClose }: SettingsDialogProps) {
  const [settings, setSettings] = useState({
    autoSave: false,
    validateOnChange: true,
    backupLimit: 10,
    editorFontSize: 14,
  })

  const handleSave = () => {
    // Save to localStorage
    localStorage.setItem('waybar-gui-settings', JSON.stringify(settings))
    onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Settings">
      <div className="space-y-6">
        {/* Auto Save */}
        <div>
          <label className="flex items-center gap-2">
            <Toggle
              checked={settings.autoSave}
              onChange={(checked) => setSettings({ ...settings, autoSave: checked })}
            />
            <span>Auto-save on changes</span>
          </label>
          <p className="mt-1 text-xs text-gray-400">
            Automatically save configuration after each change
          </p>
        </div>

        {/* Validate on Change */}
        <div>
          <label className="flex items-center gap-2">
            <Toggle
              checked={settings.validateOnChange}
              onChange={(checked) =>
                setSettings({ ...settings, validateOnChange: checked })
              }
            />
            <span>Validate on change</span>
          </label>
          <p className="mt-1 text-xs text-gray-400">
            Run validation after each configuration change
          </p>
        </div>

        {/* Backup Limit */}
        <div>
          <label className="mb-2 block text-sm font-medium">
            Backup Limit
          </label>
          <input
            type="number"
            value={settings.backupLimit}
            onChange={(e) =>
              setSettings({ ...settings, backupLimit: parseInt(e.target.value) })
            }
            className="w-full rounded border border-gray-700 bg-gray-900 p-2"
          />
          <p className="mt-1 text-xs text-gray-400">
            Maximum number of backup files to keep
          </p>
        </div>

        {/* Editor Font Size */}
        <div>
          <label className="mb-2 block text-sm font-medium">
            Code Editor Font Size
          </label>
          <input
            type="number"
            value={settings.editorFontSize}
            onChange={(e) =>
              setSettings({ ...settings, editorFontSize: parseInt(e.target.value) })
            }
            className="w-full rounded border border-gray-700 bg-gray-900 p-2"
          />
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSave}>
            Save Settings
          </Button>
        </div>
      </div>
    </Modal>
  )
}
```

**Tempo:** 1 hora

---

## Task 4.4: Criar Modal Base Component

**Objetivo:** Componente reutilizável para modals.

**Arquivo:** `src/components/common/Modal.tsx`

```typescript
// ============================================================================
// MODAL COMPONENT
// ============================================================================

import { useEffect, type ReactNode } from 'react'
import { X } from 'lucide-react'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: ReactNode
  size?: 'sm' | 'md' | 'lg' | 'xl'
}

export function Modal({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
}: ModalProps) {
  // Close on Escape
  useEffect(() => {
    if (!isOpen) return

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [isOpen, onClose])

  if (!isOpen) return null

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-2xl',
    lg: 'max-w-4xl',
    xl: 'max-w-6xl',
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className={`relative ${sizeClasses[size]} w-full rounded-lg border border-gray-800 bg-gray-950 shadow-2xl`}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-800 p-4">
          <h2 className="text-lg font-semibold">{title}</h2>
          <button
            onClick={onClose}
            className="rounded p-1 hover:bg-gray-800"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="max-h-[70vh] overflow-y-auto p-6">
          {children}
        </div>
      </div>
    </div>
  )
}
```

**Tempo:** 30 minutos

---

**TEMPO TOTAL FASE 4:** 8-10 horas

---

# FASE 5: TESTING & DOCUMENTATION 🔵

**Prioridade:** BAIXA
**Tempo Estimado:** 6-8 horas
**Dependências:** Todas as fases anteriores

## Task 5.1: Adicionar Integration Tests

**Objetivo:** Testar fluxos críticos do usuário.

**Arquivo:** `src/test/integration/full-workflow.test.tsx`

```typescript
import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from '../../App'
import * as tauriCommands from '../../lib/tauri/commands'

// Mock Tauri commands
vi.mock('../../lib/tauri/commands', () => ({
  detectConfigPaths: vi.fn().mockResolvedValue({
    config_dir: '/home/user/.config/waybar',
    config_file: '/home/user/.config/waybar/config',
    style_file: '/home/user/.config/waybar/style.css',
  }),
  loadConfig: vi.fn().mockResolvedValue({
    content: '{"modules-left": ["cpu"]}',
    path: '/home/user/.config/waybar/config',
  }),
  saveConfig: vi.fn().mockResolvedValue(undefined),
  reloadWaybar: vi.fn().mockResolvedValue(undefined),
}))

describe('Full Workflow Integration Test', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should complete full workflow: load → edit → save', async () => {
    const user = userEvent.setup()

    // Render app
    render(<App />)

    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.queryByText(/loading/i)).not.toBeInTheDocument()
    })

    // Verify bar list loaded
    expect(screen.getByText(/Bar 1/i)).toBeInTheDocument()

    // Drag module from palette to zone
    const cpuModule = screen.getByText(/CPU/i)
    const leftZone = screen.getByTestId('module-zone-left')

    // Simulate drag-and-drop
    fireEvent.dragStart(cpuModule)
    fireEvent.drop(leftZone)
    fireEvent.dragEnd(cpuModule)

    // Verify module added
    await waitFor(() => {
      expect(screen.getByText(/cpu/i)).toBeInTheDocument()
    })

    // Click save button
    const saveButton = screen.getByRole('button', { name: /save/i })
    await user.click(saveButton)

    // Verify save was called
    await waitFor(() => {
      expect(tauriCommands.saveConfig).toHaveBeenCalled()
      expect(tauriCommands.reloadWaybar).toHaveBeenCalled()
    })

    // Verify success notification
    expect(screen.getByText(/saved/i)).toBeInTheDocument()
  })

  it('should block save when validation errors exist', async () => {
    const user = userEvent.setup()

    render(<App />)

    await waitFor(() => {
      expect(screen.queryByText(/loading/i)).not.toBeInTheDocument()
    })

    // Create invalid config (somehow trigger validation error)
    // ...

    // Try to save
    const saveButton = screen.getByRole('button', { name: /save/i })
    await user.click(saveButton)

    // Verify save was NOT called
    expect(tauriCommands.saveConfig).not.toHaveBeenCalled()

    // Verify error notification
    expect(screen.getByText(/validation error/i)).toBeInTheDocument()
  })

  it('should undo and redo actions correctly', async () => {
    const user = userEvent.setup()

    render(<App />)

    await waitFor(() => {
      expect(screen.queryByText(/loading/i)).not.toBeInTheDocument()
    })

    // Make a change (add module)
    // ...

    // Undo
    await user.keyboard('{Control>}z{/Control}')

    // Verify change was undone
    // ...

    // Redo
    await user.keyboard('{Control>}{Shift>}z{/Shift}{/Control}')

    // Verify change was redone
    // ...
  })
})
```

**Tempo:** 3-4 horas

---

## Task 5.2: Adicionar E2E Tests (Opcional)

**Objetivo:** Testar com Tauri real (não mocked).

**Setup:** Playwright ou Tauri E2E testing

**Tempo:** 2-3 horas (se implementado)

---

## Task 5.3: Criar Documentação

### README.md

Atualizar com:
- Screenshots da aplicação funcionando
- Instruções de instalação
- Guia de uso rápido
- Link para documentação completa

### In-App Help

**Arquivo:** `src/components/dialogs/KeyboardShortcutsHelp.tsx`

```typescript
// ============================================================================
// KEYBOARD SHORTCUTS HELP DIALOG
// ============================================================================

import { Modal } from '../common/Modal'

interface KeyboardShortcutsHelpProps {
  isOpen: boolean
  onClose: () => void
}

const SHORTCUTS = [
  { key: 'Ctrl+S', description: 'Save configuration' },
  { key: 'Ctrl+Z', description: 'Undo last change' },
  { key: 'Ctrl+Shift+Z', description: 'Redo' },
  { key: 'Ctrl+Y', description: 'Redo (alternative)' },
  { key: 'Ctrl+/', description: 'Show this help' },
  { key: 'Escape', description: 'Close modal' },
  { key: 'Delete', description: 'Delete selected module' },
]

export function KeyboardShortcutsHelp({ isOpen, onClose }: KeyboardShortcutsHelpProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Keyboard Shortcuts" size="md">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-800">
            <th className="pb-2 text-left text-sm font-semibold">Shortcut</th>
            <th className="pb-2 text-left text-sm font-semibold">Action</th>
          </tr>
        </thead>
        <tbody>
          {SHORTCUTS.map((shortcut) => (
            <tr key={shortcut.key} className="border-b border-gray-900">
              <td className="py-2">
                <code className="rounded bg-gray-900 px-2 py-1 text-sm font-mono">
                  {shortcut.key}
                </code>
              </td>
              <td className="py-2 text-sm text-gray-300">{shortcut.description}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </Modal>
  )
}
```

**Tempo:** 1-2 horas

---

**TEMPO TOTAL FASE 5:** 6-8 horas

---

# 📋 CHECKLIST FINAL DE VALIDAÇÃO

## ✅ Funcionalidades Core

### Inicialização
- [ ] App inicia sem erros
- [ ] Detecta config do Waybar
- [ ] Carrega config existente
- [ ] Transforma JSON para formato interno
- [ ] Mostra erro se config não existe
- [ ] Loading state durante inicialização

### Interface
- [ ] MainLayout renderiza
- [ ] Sidebar com BarList e ModulePalette
- [ ] BarEditor no centro
- [ ] StatusBar na parte inferior
- [ ] Theme toggle funciona
- [ ] Notificações aparecem

### Drag-and-Drop
- [ ] Arrastar módulo da palette funciona
- [ ] Soltar em zona adiciona módulo
- [ ] Reordenar dentro de zona
- [ ] Mover entre zonas
- [ ] DragOverlay aparece
- [ ] Collision detection correto

### Configuração de Módulos
- [ ] Clicar em módulo abre editor
- [ ] 10 editores implementados:
  - [ ] Battery
  - [ ] Clock
  - [ ] CPU
  - [ ] Memory
  - [ ] Network
  - [ ] Custom
  - [ ] Workspaces
  - [ ] Window
  - [ ] Pulseaudio
  - [ ] Tray
- [ ] Formulários validam com Zod
- [ ] Erros aparecem em tempo real
- [ ] Salvar atualiza config

### Save/Load
- [ ] Ctrl+S salva configuração
- [ ] Validação bloqueia save se há erros
- [ ] Backend cria backup automaticamente
- [ ] Waybar recarrega após save
- [ ] Notificação de sucesso
- [ ] Comentários JSONC preservados

### Undo/Redo
- [ ] Ctrl+Z desfaz
- [ ] Ctrl+Shift+Z refaz
- [ ] Histórico funciona
- [ ] Limite de 50 ações

### Validação
- [ ] Real-time com debounce 300ms
- [ ] Battery states (≤ threshold) documentado
- [ ] Module IDs únicos verificados
- [ ] Errors bloqueiam save
- [ ] Warnings permitem save

### CSS Editor
- [ ] StyleEditor funciona
- [ ] VisualEditor com ColorPicker
- [ ] CodeEditor com Monaco
- [ ] Intellisense/autocomplete funciona
- [ ] Workers configurados

### Atalhos de Teclado
- [ ] Ctrl+S: Save
- [ ] Ctrl+Z: Undo
- [ ] Ctrl+Shift+Z / Ctrl+Y: Redo
- [ ] Ctrl+/: Keyboard shortcuts help
- [ ] Escape: Close modals

### Dialogs
- [ ] ImportDialog
- [ ] ExportDialog
- [ ] TemplateDialog
- [ ] SettingsDialog
- [ ] KeyboardShortcutsHelp

### Temas
- [ ] System theme detection
- [ ] Light theme
- [ ] Dark theme
- [ ] Theme toggle
- [ ] Persiste em localStorage

## ✅ Qualidade de Código

### TypeScript
- [ ] Zero erros de compilação
- [ ] Types explícitos
- [ ] No `any` desnecessários
- [ ] Zod schemas exportam types

### Rust
- [ ] Compila sem warnings
- [ ] Testes unitários passam
- [ ] Error handling com Result<T>
- [ ] Backups funcionam

### Tests
- [ ] 3+ integration tests
- [ ] Rust unit tests
- [ ] Coverage > 60% (opcional)

### Performance
- [ ] Validação com debounce
- [ ] Drag-drop suave
- [ ] UI não trava

### UX
- [ ] Loading states
- [ ] Error boundaries
- [ ] Notificações claras
- [ ] Tooltips onde necessário

## ✅ Documentação

- [ ] README.md atualizado
- [ ] Screenshots incluídos
- [ ] CLAUDE.md atualizado
- [ ] In-app help implementado
- [ ] Comentários em código complexo

---

# 🎯 CRONOGRAMA RESUMIDO

| Fase | Descrição | Tempo | Prioridade |
|------|-----------|-------|------------|
| **1** | Bloqueadores Críticos (App.tsx, integração) | 12-20h | 🔴 CRÍTICO |
| **2** | Module Editors Faltando (4 editores) | 8-12h | 🟠 ALTO |
| **3** | Bug Fixes e Validações | 6-8h | 🟡 MÉDIO |
| **4** | UX Enhancements (dialogs, theme, loading) | 8-10h | 🟡 MÉDIO |
| **5** | Testing & Documentation | 6-8h | 🔵 BAIXO |

**TOTAL:** 40-58 horas
**MVP Funcional (Fases 1-3):** 26-40 horas
**Implementação Completa (Todas):** 40-58 horas

---

# 🚀 ORDEM DE EXECUÇÃO RECOMENDADA

## Semana 1: MVP Funcional

**Dias 1-3:**
- Task 1.1: App.tsx rewrite (3-4h)
- Task 1.1.2: Config transform utils (2-3h)
- Task 1.1.3: UI store updates (30min)
- Task 1.1.4: Keyboard shortcuts (1-2h)
- **Checkpoint:** App carrega e mostra UI básica

**Dias 4-5:**
- Task 1.2: Save config flow (2-3h)
- Task 1.2.2: Notification system (2-3h)
- Task 1.3: Testes end-to-end (2-3h)
- **Checkpoint:** Load/Save funciona

## Semana 2: Module Editors e Bug Fixes

**Dias 6-8:**
- Task 2.1-2.4: 4 module editors (6-8h)
- Task 2.5: Registrar editores (30min)
- **Checkpoint:** 10 module editors completos

**Dias 9-10:**
- Task 3.1-3.6: Bug fixes (6-8h)
- **Checkpoint:** Validações e bugs críticos corrigidos

## Semana 3: UX e Polishing

**Dias 11-13:**
- Task 4.1: Theme toggle (2-3h)
- Task 4.2: Loading states (1-2h)
- Task 4.3: Dialogs (4-5h)
- Task 4.4: Modal component (30min)
- **Checkpoint:** UX completa

**Dias 14-15:**
- Task 5.1-5.3: Tests e documentação (6-8h)
- **Checkpoint:** Aplicação 100% completa

---

# 📝 NOTAS FINAIS

## Priorização

Para MVP rápido (2 semanas):
1. **FAZER:** Fases 1-3
2. **PULAR:** Fase 4 (exceto loading states básicos)
3. **PULAR:** Fase 5 (fazer depois)

Para implementação completa (3 semanas):
- Fazer todas as fases em ordem

## Riscos e Mitigações

**Risco 1:** Config transformation complexa
**Mitigação:** Testar com configs reais do Waybar desde o início

**Risco 2:** Monaco workers não funcionam
**Mitigação:** Task 3.6 resolve isso, prioritário

**Risco 3:** Drag-drop buggy
**Mitigação:** Task 3.4 configura collision detection

## Próximos Passos Imediatos

1. Começar com Task 1.1.1 (App.tsx rewrite)
2. Testar manualmente cada subtask antes de prosseguir
3. Commit frequentemente
4. Usar este documento como checklist

---

**Boa sorte! 🚀**
