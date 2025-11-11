// ============================================================================
// CONFIG PARSER
// ============================================================================

use crate::error::{AppError, Result};

/// Strip JSONC comments from JSON content
/// Handles both single-line (//) and multi-line (/* */) comments
pub fn strip_jsonc_comments(content: &str) -> String {
    let mut result = String::with_capacity(content.len());
    let mut chars = content.chars().peekable();
    let mut in_string = false;
    let mut escape_next = false;

    while let Some(ch) = chars.next() {
        // Handle string literals (preserve everything inside strings)
        if ch == '"' && !escape_next {
            in_string = !in_string;
            result.push(ch);
            continue;
        }

        // Handle escape sequences
        if ch == '\\' && in_string {
            escape_next = !escape_next;
            result.push(ch);
            continue;
        }
        escape_next = false;

        // Skip comments only outside of strings
        if !in_string {
            // Single-line comment
            if ch == '/' && chars.peek() == Some(&'/') {
                chars.next(); // consume second /
                // Skip until end of line
                for c in chars.by_ref() {
                    if c == '\n' {
                        result.push(c); // preserve newline
                        break;
                    }
                }
                continue;
            }

            // Multi-line comment
            if ch == '/' && chars.peek() == Some(&'*') {
                chars.next(); // consume *
                // Skip until */
                let mut prev = ' ';
                for c in chars.by_ref() {
                    if prev == '*' && c == '/' {
                        break;
                    }
                    prev = c;
                }
                continue;
            }
        }

        result.push(ch);
    }

    result
}

/// Parse JSONC content and return parsed JSON value
pub fn parse_jsonc(content: &str) -> Result<serde_json::Value> {
    let stripped = strip_jsonc_comments(content);
    serde_json::from_str(&stripped).map_err(|e| AppError::Parse(format!("Failed to parse JSON: {}", e)))
}

/// Validate that content is valid JSON
pub fn validate_json(content: &str) -> Result<()> {
    serde_json::from_str::<serde_json::Value>(content)
        .map(|_| ())
        .map_err(|e| AppError::Validation(format!("Invalid JSON: {}", e)))
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_strip_single_line_comments() {
        let input = r#"{
            // This is a comment
            "key": "value"
        }"#;
        let output = strip_jsonc_comments(input);
        assert!(!output.contains("// This is a comment"));
        assert!(output.contains("\"key\""));
    }

    #[test]
    fn test_strip_multi_line_comments() {
        let input = r#"{
            /* This is a
               multi-line comment */
            "key": "value"
        }"#;
        let output = strip_jsonc_comments(input);
        assert!(!output.contains("/* This is a"));
        assert!(output.contains("\"key\""));
    }

    #[test]
    fn test_preserve_comments_in_strings() {
        let input = r#"{"key": "// not a comment"}"#;
        let output = strip_jsonc_comments(input);
        assert!(output.contains("// not a comment"));
    }

    #[test]
    fn test_parse_jsonc() {
        let input = r#"{
            // Comment
            "modules-left": ["cpu", "memory"]
        }"#;
        let result = parse_jsonc(input);
        assert!(result.is_ok());
        let json = result.unwrap();
        assert!(json["modules-left"].is_array());
    }
}
