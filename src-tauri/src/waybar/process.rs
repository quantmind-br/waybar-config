// ============================================================================
// WAYBAR PROCESS MANAGEMENT
// ============================================================================

use crate::error::{AppError, Result};
use std::process::Command;

// ============================================================================
// CONSTANTS
// ============================================================================

/// Signal to reload Waybar configuration (SIGUSR2)
const RELOAD_SIGNAL: &str = "SIGUSR2";

/// Process name for Waybar
const WAYBAR_PROCESS: &str = "waybar";

// ============================================================================
// PROCESS OPERATIONS
// ============================================================================

/**
 * Send SIGUSR2 signal to Waybar process to reload configuration
 *
 * This is the recommended way to reload Waybar without restarting.
 * Waybar will reload both config and style files when it receives SIGUSR2.
 *
 * Uses `pkill -SIGUSR2 waybar` to send the signal.
 *
 * Returns:
 * - Ok(()) if signal sent successfully (or if Waybar is not running)
 * - Err if pkill command fails
 */
#[tauri::command]
pub async fn reload_waybar() -> Result<()> {
    // Check if Waybar is running first
    if !is_waybar_running().await? {
        // Not an error - Waybar just isn't running
        return Ok(());
    }

    // Send SIGUSR2 signal to Waybar
    let output = Command::new("pkill")
        .arg(format!("-{}", RELOAD_SIGNAL))
        .arg(WAYBAR_PROCESS)
        .output()
        .map_err(|e| {
            AppError::Internal(format!("Failed to execute pkill command: {}", e))
        })?;

    // pkill returns 0 if signal was sent successfully
    if output.status.success() {
        Ok(())
    } else {
        // Get error message from stderr if available
        let stderr = String::from_utf8_lossy(&output.stderr);
        if !stderr.is_empty() {
            Err(AppError::Internal(format!(
                "Failed to reload Waybar: {}",
                stderr.trim()
            )))
        } else {
            // pkill returns 1 if no processes matched, but we already checked if running
            Ok(())
        }
    }
}

/**
 * Check if Waybar process is currently running
 *
 * Uses `pgrep waybar` to check for running Waybar instances.
 *
 * Returns:
 * - Ok(true) if Waybar is running
 * - Ok(false) if Waybar is not running
 * - Err if pgrep command fails
 */
#[tauri::command]
pub async fn is_waybar_running() -> Result<bool> {
    let output = Command::new("pgrep")
        .arg(WAYBAR_PROCESS)
        .output()
        .map_err(|e| {
            AppError::Internal(format!("Failed to execute pgrep command: {}", e))
        })?;

    // pgrep returns 0 if processes found, 1 if none found
    Ok(output.status.success())
}

/**
 * Get Waybar process ID(s)
 *
 * Returns:
 * - Ok(Vec<u32>) with process IDs if Waybar is running
 * - Ok(empty Vec) if Waybar is not running
 * - Err if command fails
 */
#[tauri::command]
pub async fn get_waybar_pids() -> Result<Vec<u32>> {
    let output = Command::new("pgrep")
        .arg(WAYBAR_PROCESS)
        .output()
        .map_err(|e| {
            AppError::Internal(format!("Failed to execute pgrep command: {}", e))
        })?;

    if !output.status.success() {
        // No processes found
        return Ok(Vec::new());
    }

    // Parse PIDs from output
    let stdout = String::from_utf8_lossy(&output.stdout);
    let pids: Vec<u32> = stdout
        .lines()
        .filter_map(|line| line.trim().parse::<u32>().ok())
        .collect();

    Ok(pids)
}

/**
 * Start Waybar process
 *
 * Launches Waybar as a background process.
 * Does nothing if Waybar is already running.
 *
 * Returns:
 * - Ok(()) if Waybar started successfully or already running
 * - Err if command fails
 */
#[tauri::command]
pub async fn start_waybar() -> Result<()> {
    // Check if already running
    if is_waybar_running().await? {
        return Ok(());
    }

    // Start Waybar in background
    Command::new("waybar")
        .spawn()
        .map_err(|e| {
            AppError::Internal(format!("Failed to start Waybar: {}", e))
        })?;

    Ok(())
}

/**
 * Stop Waybar process
 *
 * Sends SIGTERM to Waybar process to gracefully shut it down.
 * Uses `pkill waybar` (default signal is SIGTERM).
 *
 * Returns:
 * - Ok(()) if Waybar stopped successfully or not running
 * - Err if command fails
 */
#[tauri::command]
pub async fn stop_waybar() -> Result<()> {
    // Check if running first
    if !is_waybar_running().await? {
        return Ok(());
    }

    // Send SIGTERM to Waybar
    let output = Command::new("pkill")
        .arg(WAYBAR_PROCESS)
        .output()
        .map_err(|e| {
            AppError::Internal(format!("Failed to execute pkill command: {}", e))
        })?;

    if output.status.success() {
        Ok(())
    } else {
        let stderr = String::from_utf8_lossy(&output.stderr);
        if !stderr.is_empty() {
            Err(AppError::Internal(format!(
                "Failed to stop Waybar: {}",
                stderr.trim()
            )))
        } else {
            Ok(())
        }
    }
}

/**
 * Restart Waybar process
 *
 * Stops and then starts Waybar.
 * Useful when configuration changes require a full restart.
 *
 * Returns:
 * - Ok(()) if restart successful
 * - Err if stop or start fails
 */
#[tauri::command]
pub async fn restart_waybar() -> Result<()> {
    stop_waybar().await?;

    // Give Waybar time to fully shut down
    std::thread::sleep(std::time::Duration::from_millis(500));

    start_waybar().await?;

    Ok(())
}

// ============================================================================
// TESTS
// ============================================================================

#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn test_is_waybar_running() {
        // This test will pass regardless of whether Waybar is running
        let result = is_waybar_running().await;
        assert!(result.is_ok());
    }

    #[tokio::test]
    async fn test_get_waybar_pids() {
        let result = get_waybar_pids().await;
        assert!(result.is_ok());

        // If result is Ok, it should be a Vec (empty or with PIDs)
        if let Ok(pids) = result {
            assert!(pids.len() >= 0); // Always true, but documents expected type
        }
    }

    #[tokio::test]
    async fn test_reload_waybar() {
        // Test should not fail even if Waybar is not running
        let result = reload_waybar().await;
        assert!(result.is_ok());
    }
}
