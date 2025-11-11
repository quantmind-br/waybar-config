// ============================================================================
// WAYLAND COMPOSITOR DETECTION
// ============================================================================

use crate::error::{AppError, Result};
use std::env;

// ============================================================================
// TYPES
// ============================================================================

/**
 * Detected Wayland compositor
 */
#[derive(Debug, Clone, PartialEq, Eq, serde::Serialize, serde::Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum Compositor {
    /// Hyprland compositor
    Hyprland,
    /// Sway compositor
    Sway,
    /// River compositor
    River,
    /// DWL compositor
    Dwl,
    /// Niri compositor
    Niri,
    /// Generic Wayland compositor (or unknown)
    Unknown,
}

impl Compositor {
    /// Get compositor as lowercase string
    pub fn as_str(&self) -> &'static str {
        match self {
            Compositor::Hyprland => "hyprland",
            Compositor::Sway => "sway",
            Compositor::River => "river",
            Compositor::Dwl => "dwl",
            Compositor::Niri => "niri",
            Compositor::Unknown => "unknown",
        }
    }

    /// Check if compositor is known (not Unknown)
    pub fn is_known(&self) -> bool {
        !matches!(self, Compositor::Unknown)
    }
}

impl std::fmt::Display for Compositor {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        write!(f, "{}", self.as_str())
    }
}

impl From<&str> for Compositor {
    fn from(s: &str) -> Self {
        let lower = s.to_lowercase();
        match lower.as_str() {
            "hyprland" => Compositor::Hyprland,
            "sway" => Compositor::Sway,
            "river" => Compositor::River,
            "dwl" => Compositor::Dwl,
            "niri" => Compositor::Niri,
            _ => Compositor::Unknown,
        }
    }
}

// ============================================================================
// DETECTION
// ============================================================================

/**
 * Detect the currently running Wayland compositor
 *
 * Detection strategy:
 * 1. Check $XDG_CURRENT_DESKTOP environment variable
 * 2. Check $WAYLAND_DISPLAY to confirm Wayland is running
 * 3. Check process list for known compositor names (fallback)
 *
 * Returns:
 * - Detected compositor name (lowercase)
 * - "unknown" if compositor cannot be determined
 *
 * Supported compositors:
 * - Hyprland
 * - Sway
 * - River
 * - DWL
 * - Niri
 */
#[tauri::command]
pub async fn detect_compositor() -> Result<String> {
    let compositor = detect_compositor_internal()?;
    Ok(compositor.to_string())
}

/**
 * Internal compositor detection function
 * Returns Compositor enum instead of string
 */
fn detect_compositor_internal() -> Result<Compositor> {
    // Check if Wayland is running
    if !is_wayland_session() {
        return Ok(Compositor::Unknown);
    }

    // Strategy 1: Check XDG_CURRENT_DESKTOP
    if let Ok(desktop) = env::var("XDG_CURRENT_DESKTOP") {
        let compositor = Compositor::from(desktop.as_str());
        if compositor.is_known() {
            return Ok(compositor);
        }
    }

    // Strategy 2: Check WAYLAND_COMPOSITOR (not standard but some compositors set it)
    if let Ok(compositor_var) = env::var("WAYLAND_COMPOSITOR") {
        let compositor = Compositor::from(compositor_var.as_str());
        if compositor.is_known() {
            return Ok(compositor);
        }
    }

    // Strategy 3: Check running processes (fallback)
    if let Ok(compositor) = detect_from_processes() {
        if compositor.is_known() {
            return Ok(compositor);
        }
    }

    // Could not determine compositor
    Ok(Compositor::Unknown)
}

/**
 * Check if running in a Wayland session
 * Checks for WAYLAND_DISPLAY environment variable
 */
fn is_wayland_session() -> bool {
    env::var("WAYLAND_DISPLAY").is_ok()
}

/**
 * Detect compositor from running processes
 * Uses pgrep to check for compositor processes
 */
fn detect_from_processes() -> Result<Compositor> {
    use std::process::Command;

    // List of compositor process names to check
    let compositors = [
        ("Hyprland", Compositor::Hyprland),
        ("sway", Compositor::Sway),
        ("river", Compositor::River),
        ("dwl", Compositor::Dwl),
        ("niri", Compositor::Niri),
    ];

    for (process_name, compositor) in compositors {
        let output = Command::new("pgrep")
            .arg("-x") // Exact match
            .arg(process_name)
            .output()
            .map_err(|e| {
                AppError::Internal(format!("Failed to execute pgrep: {}", e))
            })?;

        if output.status.success() {
            return Ok(compositor);
        }
    }

    Ok(Compositor::Unknown)
}

/**
 * Get compositor information including version
 *
 * Returns detailed info about the detected compositor:
 * - name: Compositor name
 * - version: Version string (if available)
 * - session_type: "wayland" or "x11"
 */
#[tauri::command]
pub async fn get_compositor_info() -> Result<CompositorInfo> {
    let compositor = detect_compositor_internal()?;
    let version = get_compositor_version(&compositor).await.ok();

    Ok(CompositorInfo {
        name: compositor.to_string(),
        version,
        session_type: if is_wayland_session() {
            "wayland".to_string()
        } else {
            "x11".to_string()
        },
    })
}

/**
 * Compositor information
 */
#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
pub struct CompositorInfo {
    pub name: String,
    pub version: Option<String>,
    pub session_type: String,
}

/**
 * Get compositor version string
 */
async fn get_compositor_version(compositor: &Compositor) -> Result<String> {
    use std::process::Command;

    let cmd_name = match compositor {
        Compositor::Hyprland => "Hyprland",
        Compositor::Sway => "sway",
        Compositor::River => "river",
        Compositor::Dwl => "dwl",
        Compositor::Niri => "niri",
        Compositor::Unknown => return Err(AppError::NotFound("Unknown compositor".to_string())),
    };

    // Try --version flag
    let output = Command::new(cmd_name)
        .arg("--version")
        .output()
        .map_err(|e| {
            AppError::Internal(format!("Failed to get {} version: {}", cmd_name, e))
        })?;

    if output.status.success() {
        let version = String::from_utf8_lossy(&output.stdout);
        // Extract just the version number (first line usually)
        let version_line = version.lines().next().unwrap_or("unknown");
        Ok(version_line.to_string())
    } else {
        Err(AppError::Internal(format!("Failed to get {} version", cmd_name)))
    }
}

/**
 * Check if a specific compositor is currently running
 */
#[tauri::command]
pub async fn is_compositor_running(compositor_name: String) -> Result<bool> {
    let requested_compositor = Compositor::from(compositor_name.as_str());
    let current_compositor = detect_compositor_internal()?;

    Ok(requested_compositor == current_compositor)
}

// ============================================================================
// TESTS
// ============================================================================

#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn test_detect_compositor() {
        let result = detect_compositor().await;
        assert!(result.is_ok());

        // Should return a string (either a compositor name or "unknown")
        let compositor = result.unwrap();
        assert!(!compositor.is_empty());
    }

    #[tokio::test]
    async fn test_get_compositor_info() {
        let result = get_compositor_info().await;
        assert!(result.is_ok());

        let info = result.unwrap();
        assert!(!info.name.is_empty());
        assert!(!info.session_type.is_empty());
    }

    #[test]
    fn test_compositor_from_str() {
        assert_eq!(Compositor::from("hyprland"), Compositor::Hyprland);
        assert_eq!(Compositor::from("Hyprland"), Compositor::Hyprland);
        assert_eq!(Compositor::from("HYPRLAND"), Compositor::Hyprland);
        assert_eq!(Compositor::from("sway"), Compositor::Sway);
        assert_eq!(Compositor::from("river"), Compositor::River);
        assert_eq!(Compositor::from("dwl"), Compositor::Dwl);
        assert_eq!(Compositor::from("niri"), Compositor::Niri);
        assert_eq!(Compositor::from("unknown"), Compositor::Unknown);
        assert_eq!(Compositor::from("something"), Compositor::Unknown);
    }

    #[test]
    fn test_is_wayland_session() {
        // Test will pass regardless of environment
        let _is_wayland = is_wayland_session();
        // Just ensure function doesn't panic
    }
}
