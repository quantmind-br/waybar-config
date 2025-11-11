// ============================================================================
// CONFIG MODULE
// ============================================================================

pub mod parser;
pub mod writer;

use crate::error::{AppError, Result};
use serde::{Deserialize, Serialize};
use std::path::{Path, PathBuf};

/// Raw Waybar configuration file content
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct WaybarConfigFile {
    /// Raw JSONC content from file
    pub content: String,
    /// Absolute path to the config file
    pub path: String,
}

/// Configuration file paths
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ConfigPaths {
    /// Directory containing Waybar configuration
    pub config_dir: String,
    /// Path to config.jsonc file
    pub config_file: String,
    /// Path to style.css file
    pub style_file: String,
}

impl ConfigPaths {
    /// Get default Waybar configuration paths
    pub fn default() -> Result<Self> {
        let home = std::env::var("HOME")
            .map_err(|_| AppError::Config("HOME environment variable not set".to_string()))?;

        let config_dir = format!("{}/.config/waybar", home);

        Ok(Self {
            config_dir: config_dir.clone(),
            config_file: format!("{}/config.jsonc", config_dir),
            style_file: format!("{}/style.css", config_dir),
        })
    }

    /// Detect actual config file path (tries multiple locations)
    pub fn detect_config_file(config_dir: &str) -> Option<PathBuf> {
        let candidates = vec![
            PathBuf::from(config_dir).join("config.jsonc"),
            PathBuf::from(config_dir).join("config"),
        ];

        candidates.into_iter().find(|p| p.exists())
    }

    /// Check if configuration directory exists
    pub fn config_exists(&self) -> bool {
        Path::new(&self.config_dir).exists()
    }

    /// Create configuration directory if it doesn't exist
    pub fn ensure_config_dir(&self) -> Result<()> {
        std::fs::create_dir_all(&self.config_dir)?;
        Ok(())
    }
}
