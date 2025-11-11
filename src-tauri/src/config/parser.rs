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

    // ========================================
    // JSONC Comment Stripping Tests
    // ========================================

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
    fn test_preserve_multiline_comments_in_strings() {
        let input = r#"{"key": "/* not a comment */"}"#;
        let output = strip_jsonc_comments(input);
        assert!(output.contains("/* not a comment */"));
    }

    #[test]
    fn test_strip_inline_comments() {
        let input = r#"{"key": "value", // inline comment
            "key2": "value2"}"#;
        let output = strip_jsonc_comments(input);
        assert!(!output.contains("// inline comment"));
        assert!(output.contains("\"key2\""));
    }

    #[test]
    fn test_strip_nested_multiline_comments() {
        let input = r#"{
            /* Outer comment
            /* Note: nested comments are NOT standard JSONC */
            "key": "value"
        }"#;
        let output = strip_jsonc_comments(input);
        // Should strip until first */ (JSONC doesn't support nested comments)
        assert!(!output.contains("Outer comment"));
    }

    #[test]
    fn test_strip_comment_before_value() {
        let input = r#"{
            "key": /* comment */ "value"
        }"#;
        let output = strip_jsonc_comments(input);
        assert!(!output.contains("/* comment */"));
        assert!(output.contains("\"value\""));
    }

    #[test]
    fn test_preserve_escaped_quotes_in_strings() {
        let input = r#"{"key": "value with \"quotes\""}"#;
        let output = strip_jsonc_comments(input);
        assert!(output.contains(r#"\"quotes\""#));
    }

    #[test]
    fn test_preserve_backslash_in_strings() {
        let input = r#"{"path": "C:\\Users\\test"}"#;
        let output = strip_jsonc_comments(input);
        assert!(output.contains(r#"C:\\Users\\test"#));
    }

    #[test]
    fn test_empty_comment() {
        let input = r#"{"key": "value"//
        }"#;
        let output = strip_jsonc_comments(input);
        assert!(output.contains("\"value\""));
    }

    #[test]
    fn test_multiple_comments_same_line() {
        // JSONC only supports one comment per line
        let input = r#"{"key": "value"} // comment 1 // comment 2"#;
        let output = strip_jsonc_comments(input);
        assert!(!output.contains("// comment 1"));
        assert!(!output.contains("// comment 2"));
    }

    #[test]
    fn test_comment_with_special_characters() {
        let input = r#"{
            // Comment with special chars: ñ é ü 中文 🚀
            "key": "value"
        }"#;
        let output = strip_jsonc_comments(input);
        assert!(!output.contains("🚀"));
        assert!(output.contains("\"key\""));
    }

    // ========================================
    // JSONC Parsing Tests
    // ========================================

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

    #[test]
    fn test_parse_jsonc_complex_config() {
        let input = r#"{
            // Bar configuration
            "layer": "top",
            "position": "top",
            "height": 30,

            /* Module configuration */
            "modules-left": ["clock", "battery"],
            "modules-center": ["hyprland/workspaces"], // WM specific
            "modules-right": ["network", "tray"],

            // Clock module
            "clock": {
                "format": "{:%H:%M}",
                "tooltip": true
            }
        }"#;
        let result = parse_jsonc(input);
        assert!(result.is_ok());
        let json = result.unwrap();

        assert_eq!(json["layer"], "top");
        assert_eq!(json["position"], "top");
        assert_eq!(json["height"], 30);
        assert!(json["clock"]["tooltip"].as_bool().unwrap());
    }

    #[test]
    fn test_parse_jsonc_invalid_json_after_comment_strip() {
        let input = r#"{
            "key": "value",
            // Missing closing brace
        "#;
        let result = parse_jsonc(input);
        assert!(result.is_err());
        if let Err(AppError::Parse(msg)) = result {
            assert!(msg.contains("Failed to parse JSON"));
        }
    }

    #[test]
    fn test_parse_jsonc_trailing_commas() {
        // JSONC typically allows trailing commas
        let input = r#"{
            "key1": "value1",
            "key2": "value2",
        }"#;
        // Standard serde_json doesn't support trailing commas
        // This will fail, which is expected behavior
        let result = parse_jsonc(input);
        assert!(result.is_err());
    }

    #[test]
    fn test_parse_empty_jsonc() {
        let input = r#"{}"#;
        let result = parse_jsonc(input);
        assert!(result.is_ok());
    }

    #[test]
    fn test_parse_jsonc_only_comments() {
        let input = r#"
        // Just comments
        /* No actual JSON */
        "#;
        let result = parse_jsonc(input);
        assert!(result.is_err());
    }

    // ========================================
    // JSON Validation Tests
    // ========================================

    #[test]
    fn test_validate_valid_json() {
        let input = r#"{"key": "value"}"#;
        let result = validate_json(input);
        assert!(result.is_ok());
    }

    #[test]
    fn test_validate_invalid_json() {
        let input = r#"{"key": "value""#; // Missing closing brace
        let result = validate_json(input);
        assert!(result.is_err());
        if let Err(AppError::Validation(msg)) = result {
            assert!(msg.contains("Invalid JSON"));
        }
    }

    #[test]
    fn test_validate_empty_string() {
        let input = "";
        let result = validate_json(input);
        assert!(result.is_err());
    }

    #[test]
    fn test_validate_json_with_unicode() {
        let input = r#"{"message": "Hello 世界 🌍"}"#;
        let result = validate_json(input);
        assert!(result.is_ok());
    }

    // ========================================
    // Edge Cases
    // ========================================

    #[test]
    fn test_url_not_treated_as_comment() {
        let input = r#"{"url": "https://example.com/path"}"#;
        let output = strip_jsonc_comments(input);
        assert!(output.contains("https://"));
    }

    #[test]
    fn test_division_operator_in_string() {
        let input = r#"{"math": "a / b = c"}"#;
        let output = strip_jsonc_comments(input);
        assert!(output.contains("a / b = c"));
    }

    #[test]
    fn test_multiple_slashes_in_string() {
        let input = r#"{"path": "file:///home/user"}"#;
        let output = strip_jsonc_comments(input);
        assert!(output.contains("file:///"));
    }

    #[test]
    fn test_asterisk_in_string() {
        let input = r#"{"pattern": "*.txt"}"#;
        let output = strip_jsonc_comments(input);
        assert!(output.contains("*.txt"));
    }
}
