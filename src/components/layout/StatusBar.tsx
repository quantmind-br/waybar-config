// ============================================================================
// STATUS BAR - Application Status and Actions
// ============================================================================

import { Save, AlertCircle, CheckCircle, RefreshCw, Circle } from 'lucide-react'
import { useConfigStore, useCurrentBar, useErrorCount } from '../../store'

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * Status bar component
 *
 * Displays:
 * - Current bar name
 * - Save status (saved/unsaved changes)
 * - Validation error count
 * - Waybar status (running/stopped)
 *
 * Actions:
 * - Save configuration button
 * - Reload Waybar button
 */
export default function StatusBar() {
  const currentBar = useCurrentBar()
  const errorCount = useErrorCount()
  const { isDirty, lastSaved, saveConfig } = useConfigStore((state) => ({
    isDirty: state.isDirty,
    lastSaved: state.lastSaved,
    saveConfig: state.saveConfig,
  }))

  // Format last saved time
  const getLastSavedText = () => {
    if (!lastSaved) return 'Never saved'
    const now = new Date()
    const diff = now.getTime() - lastSaved.getTime()
    const seconds = Math.floor(diff / 1000)
    const minutes = Math.floor(seconds / 60)
    const hours = Math.floor(minutes / 60)

    if (seconds < 60) return 'Saved just now'
    if (minutes < 60) return `Saved ${minutes}m ago`
    if (hours < 24) return `Saved ${hours}h ago`
    return `Saved ${Math.floor(hours / 24)}d ago`
  }

  const handleSave = async () => {
    try {
      await saveConfig()
    } catch (error) {
      console.error('Failed to save config:', error)
      // TODO: Show error toast/notification
    }
  }

  const handleReload = () => {
    // TODO: Implement Waybar reload via Tauri command
    console.log('Reload Waybar clicked')
  }

  return (
    <div className="flex h-8 items-center justify-between bg-gray-950 px-4 text-xs text-gray-400">
      {/* Left Section - Current Bar */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="text-gray-500">Bar:</span>
          <span className="font-medium text-gray-300">
            {currentBar?.name || 'No bar selected'}
          </span>
        </div>

        {/* Save Status */}
        <div className="flex items-center gap-2">
          {isDirty ? (
            <>
              <Circle className="h-2 w-2 fill-yellow-500 text-yellow-500" />
              <span className="text-yellow-500">Unsaved changes</span>
            </>
          ) : (
            <>
              <CheckCircle className="h-3 w-3 text-green-500" />
              <span className="text-gray-500">{getLastSavedText()}</span>
            </>
          )}
        </div>

        {/* Validation Errors */}
        {errorCount > 0 && (
          <div className="flex items-center gap-2 text-red-500">
            <AlertCircle className="h-3 w-3" />
            <span>{errorCount} error{errorCount !== 1 ? 's' : ''}</span>
          </div>
        )}
      </div>

      {/* Right Section - Actions */}
      <div className="flex items-center gap-2">
        {/* Waybar Status (TODO: Implement actual detection) */}
        <div className="flex items-center gap-2">
          <Circle className="h-2 w-2 fill-green-500 text-green-500" />
          <span className="text-gray-500">Waybar running</span>
        </div>

        {/* Action Buttons */}
        <button
          onClick={handleSave}
          disabled={!isDirty || errorCount > 0}
          className={`
            flex
            items-center
            gap-1
            rounded
            px-2
            py-1
            transition-colors
            ${
              isDirty && errorCount === 0
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'cursor-not-allowed bg-gray-800 text-gray-600'
            }
          `}
          title={
            errorCount > 0
              ? 'Fix validation errors before saving'
              : !isDirty
              ? 'No changes to save'
              : 'Save configuration (Ctrl+S)'
          }
        >
          <Save className="h-3 w-3" />
          <span>Save</span>
        </button>

        <button
          onClick={handleReload}
          className="flex items-center gap-1 rounded bg-gray-800 px-2 py-1 text-gray-300 transition-colors hover:bg-gray-700"
          title="Reload Waybar"
        >
          <RefreshCw className="h-3 w-3" />
          <span>Reload</span>
        </button>
      </div>
    </div>
  )
}
