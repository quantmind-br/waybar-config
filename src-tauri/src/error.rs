// ============================================================================
// CUSTOM ERROR TYPES
// ============================================================================

use serde::Serialize;
use thiserror::Error;

/// Application error types
/// Provides structured error handling for all Rust-side operations
#[derive(Error, Debug, Serialize)]
#[serde(tag = "type", content = "message")]
pub enum AppError {
    #[error("IO error: {0}")]
    Io(String),

    #[error("Configuration error: {0}")]
    Config(String),

    #[error("Parse error: {0}")]
    Parse(String),

    #[error("Validation error: {0}")]
    Validation(String),

    #[error("Not found: {0}")]
    NotFound(String),

    #[error("Permission denied: {0}")]
    PermissionDenied(String),

    #[error("Already exists: {0}")]
    AlreadyExists(String),

    #[error("Internal error: {0}")]
    Internal(String),
}

/// Convert std::io::Error to AppError
impl From<std::io::Error> for AppError {
    fn from(err: std::io::Error) -> Self {
        match err.kind() {
            std::io::ErrorKind::NotFound => AppError::NotFound(err.to_string()),
            std::io::ErrorKind::PermissionDenied => AppError::PermissionDenied(err.to_string()),
            std::io::ErrorKind::AlreadyExists => AppError::AlreadyExists(err.to_string()),
            _ => AppError::Io(err.to_string()),
        }
    }
}

/// Convert serde_json::Error to AppError
impl From<serde_json::Error> for AppError {
    fn from(err: serde_json::Error) -> Self {
        AppError::Parse(err.to_string())
    }
}

/// Result type alias for AppError
pub type Result<T> = std::result::Result<T, AppError>;
