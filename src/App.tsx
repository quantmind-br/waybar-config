// ============================================================================
// WAYBAR GUI CONFIGURATION TOOL - MAIN APP
// ============================================================================

import { useEffect, useState } from 'react'
import { ThemeProvider } from './components/common/ThemeProvider'
import { ErrorBoundary } from './components/common/ErrorBoundary'
import { GlobalKeyboardShortcuts } from './components/common/GlobalKeyboardShortcuts'
import { LoadingSpinner } from './components/common/LoadingSpinner'
import { NotificationContainer } from './components/common/Notification'
import MainLayout from './components/layout/MainLayout'
import { BarList } from './components/bars'
import { BarEditor } from './components/bars'
import { ModulePalette } from './components/modules'
import { StyleEditor } from './components/styles'
import { useConfigStore } from './store/config-store'
import { useUIStore } from './store/ui-store'
import { detectConfigPaths, loadConfig as tauriLoadConfig } from './lib/tauri/commands'
import { transform } from './lib/utils/config-transform'
import './App.css'

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

  const loadConfig = useConfigStore((state) => state.loadConfig)

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

        // Step 2: Load config file (JSONC comments stripped by backend)
        console.log('[App] Loading config from:', paths.config_file)
        const configFile = await tauriLoadConfig(paths.config_file)

        // Step 3: Parse and transform to internal format
        const transformResult = transform.jsonToWaybarConfig(
          JSON.parse(configFile.content)
        )

        // Log any transformation warnings
        if (transformResult.warnings.length > 0) {
          console.warn('[App] Config transformation warnings:', transformResult.warnings)
        }

        // Step 4: Load into store with config path
        loadConfig(transformResult.data, paths.config_file)

        console.log('[App] Configuration loaded successfully')
        setAppState('ready')
      } catch (err: any) {
        console.error('[App] Failed to load configuration:', err)

        // Handle different error types
        const errorMessage = err?.message || String(err)

        if (errorMessage.includes('not found') || errorMessage.includes('NotFound')) {
          setError({
            title: 'Waybar Configuration Not Found',
            message: 'No Waybar configuration was found on your system.',
            suggestion: 'Make sure Waybar is installed and configured at ~/.config/waybar/config',
          })
        } else if (errorMessage.includes('parse') || errorMessage.includes('Parse') || errorMessage.includes('JSON')) {
          setError({
            title: 'Invalid Configuration',
            message: 'The Waybar configuration file contains invalid JSON.',
            suggestion: 'Check your config file at ~/.config/waybar/config for syntax errors.',
          })
        } else {
          setError({
            title: 'Initialization Error',
            message: errorMessage,
            suggestion: 'Try restarting the application or check the console for details.',
          })
        }

        setAppState('error')
      }
    }

    initializeApp()
  }, [loadConfig])

  // ============================================================================
  // RENDER STATES
  // ============================================================================

  // Loading state
  if (appState === 'loading') {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-gray-900">
        <LoadingSpinner size="xl" label="Loading Waybar configuration..." />
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
        <NotificationContainer />
        <GlobalKeyboardShortcuts />
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

            {/* Center Panel: Editor Content */}
            <div className="flex-1 overflow-y-auto">
              <EditorContent />
            </div>
          </div>
        </MainLayout>
      </ThemeProvider>
    </ErrorBoundary>
  )
}

// ============================================================================
// EDITOR CONTENT COMPONENT
// ============================================================================

/**
 * Renders the appropriate editor based on active main tab
 */
function EditorContent() {
  const activeMainTab = useUIStore((state) => state.activeMainTab)

  switch (activeMainTab) {
    case 'bars':
      return <BarEditor />
    case 'styles':
      return <StyleEditor />
    default:
      return <BarEditor />
  }
}

export default App
