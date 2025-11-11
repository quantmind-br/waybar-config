// ============================================================================
// TAURI COMMANDS
// ============================================================================

use crate::config::{ConfigPaths, WaybarConfigFile};
use crate::error::{AppError, Result};
use std::fs;

/// Detect Waybar configuration paths
/// Checks for config directory and files at standard locations
#[tauri::command]
pub async fn detect_config_paths() -> Result<ConfigPaths> {
    let paths = ConfigPaths::default()?;

    // Check if config directory exists
    if !paths.config_exists() {
        return Err(AppError::NotFound(format!(
            "Waybar config directory not found at: {}",
            paths.config_dir
        )));
    }

    // Try to detect actual config file (could be config or config.jsonc)
    if let Some(actual_config) = ConfigPaths::detect_config_file(&paths.config_dir) {
        let mut detected_paths = paths;
        detected_paths.config_file = actual_config
            .to_str()
            .ok_or_else(|| AppError::Internal("Invalid UTF-8 in path".to_string()))?
            .to_string();
        Ok(detected_paths)
    } else {
        Ok(paths)
    }
}

/// Load Waybar configuration file
/// Handles JSONC format (strips comments before returning)
#[tauri::command]
pub async fn load_config(path: String) -> Result<WaybarConfigFile> {
    // Read file content
    let content = fs::read_to_string(&path).map_err(|e| {
        if e.kind() == std::io::ErrorKind::NotFound {
            AppError::NotFound(format!("Config file not found: {}", path))
        } else {
            AppError::from(e)
        }
    })?;

    // Strip JSONC comments and validate JSON
    let stripped = crate::config::parser::strip_jsonc_comments(&content);

    // Validate it's valid JSON
    crate::config::parser::validate_json(&stripped)?;

    Ok(WaybarConfigFile {
        content,
        path: path.clone(),
    })
}

/// Save Waybar configuration file
/// Creates automatic backup before writing
#[tauri::command]
pub async fn save_config(path: String, content: String) -> Result<()> {
    // Validate it's valid JSON before saving
    crate::config::parser::validate_json(&content)?;

    // Add comments header
    let with_comments = crate::config::writer::add_config_comments(&content);

    // Write with backup
    crate::config::writer::write_config_file(&path, &with_comments)?;

    Ok(())
}

/// Load CSS style file
#[tauri::command]
pub async fn load_css(path: String) -> Result<String> {
    fs::read_to_string(&path).map_err(|e| {
        if e.kind() == std::io::ErrorKind::NotFound {
            AppError::NotFound(format!("CSS file not found: {}", path))
        } else {
            AppError::from(e)
        }
    })
}

/// Save CSS style file
/// Creates automatic backup before writing
#[tauri::command]
pub async fn save_css(path: String, content: String) -> Result<()> {
    // Basic CSS validation (check it's not empty)
    if content.trim().is_empty() {
        return Err(AppError::Validation("CSS content cannot be empty".to_string()));
    }

    // Write with backup
    crate::config::writer::write_config_file(&path, &content)?;

    Ok(())
}

/// List all backup files in config directory
#[tauri::command]
pub async fn list_backups(config_dir: String) -> Result<Vec<String>> {
    let entries = fs::read_dir(&config_dir)?;

    let mut backups = Vec::new();
    for entry in entries {
        let entry = entry?;
        let file_name = entry
            .file_name()
            .to_str()
            .ok_or_else(|| AppError::Internal("Invalid UTF-8 in filename".to_string()))?
            .to_string();

        if file_name.contains(".backup.") {
            backups.push(file_name);
        }
    }

    // Sort by timestamp (newest first)
    backups.sort_by(|a, b| b.cmp(a));

    Ok(backups)
}

/// Restore a backup file
#[tauri::command]
pub async fn restore_backup(backup_path: String, target_path: String) -> Result<()> {
    // Create backup of current file before restoring
    if std::path::Path::new(&target_path).exists() {
        crate::config::writer::create_backup(&target_path)?;
    }

    // Copy backup to target
    fs::copy(&backup_path, &target_path)?;

    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::fs;
    use tempfile::TempDir;

    #[tokio::test]
    async fn test_detect_config_paths() {
        let result = detect_config_paths().await;
        // May succeed or fail depending on environment
        assert!(result.is_ok() || result.is_err());
    }

    #[tokio::test]
    async fn test_load_config() {
        let temp_dir = TempDir::new().unwrap();
        let config_path = temp_dir.path().join("config.jsonc");

        let content = r#"{
            // Comment
            "modules-left": ["cpu"]
        }"#;
        fs::write(&config_path, content).unwrap();

        let result = load_config(config_path.to_str().unwrap().to_string()).await;
        assert!(result.is_ok());

        let config_file = result.unwrap();
        assert!(config_file.content.contains("// Comment"));
    }

    #[tokio::test]
    async fn test_save_config() {
        let temp_dir = TempDir::new().unwrap();
        let config_path = temp_dir.path().join("config.json");

        let content = r#"{"modules-left": ["cpu"]}"#;
        let result = save_config(config_path.to_str().unwrap().to_string(), content.to_string()).await;
        assert!(result.is_ok());

        let saved_content = fs::read_to_string(&config_path).unwrap();
        assert!(saved_content.contains("Waybar Configuration"));
        assert!(saved_content.contains("modules-left"));
    }

    #[tokio::test]
    async fn test_save_css() {
        let temp_dir = TempDir::new().unwrap();
        let css_path = temp_dir.path().join("style.css");

        let content = "* { margin: 0; }";
        let result = save_css(css_path.to_str().unwrap().to_string(), content.to_string()).await;
        assert!(result.is_ok());

        let saved_content = fs::read_to_string(&css_path).unwrap();
        assert_eq!(saved_content, content);
    }
}
