# Rust Backend Tests

Comprehensive unit tests for the Waybar Config GUI Rust backend.

## Running Tests

```bash
# Navigate to Tauri directory
cd src-tauri

# Run all tests
cargo test

# Run tests with output
cargo test -- --nocapture

# Run tests with verbose output
cargo test -- --show-output

# Run specific test module
cargo test config::parser
cargo test config::writer

# Run specific test
cargo test test_strip_single_line_comments

# Run tests in release mode (faster)
cargo test --release

# Run tests with coverage (requires llvm-cov)
cargo llvm-cov --html
```

## Test Structure

```
src-tauri/src/
├── config/
│   ├── parser.rs        # JSONC parsing tests (40+ tests)
│   └── writer.rs        # File writing and backup tests (30+ tests)
├── error.rs             # Error type definitions
└── lib.rs               # Library exports
```

## Test Coverage

### Config Parser Tests (`config/parser.rs`)

**JSONC Comment Stripping:**
- Single-line comments (`//`)
- Multi-line comments (`/* */`)
- Comments in strings (preserved)
- Inline comments
- Comments with special characters (Unicode, emojis)
- Edge cases (URLs, division operators, escape sequences)

**JSONC Parsing:**
- Valid JSONC with comments
- Complex configurations
- Invalid JSON after comment stripping
- Empty content
- Only comments (no valid JSON)

**JSON Validation:**
- Valid JSON
- Invalid JSON syntax
- Empty strings
- Unicode characters

**Edge Cases:**
- URLs not treated as comments (e.g., `https://`)
- Division operators in strings (e.g., `a / b`)
- Multiple slashes in paths (e.g., `file:///`)
- Asterisks in glob patterns (e.g., `*.txt`)

### Config Writer Tests (`config/writer.rs`)

**Backup Creation:**
- Basic backup functionality
- Backup of non-existent files (error handling)
- Content preservation (including large files)
- Unicode content preservation
- Multiple backups with unique timestamps

**File Writing:**
- Basic write operations
- Automatic backup before overwrite
- Parent directory creation
- Write to read-only directories (error handling)
- Empty content
- Large file handling (100KB+)

**JSON Formatting:**
- Basic formatting with indentation
- Complex nested structures
- Arrays
- Type preservation (strings, numbers, booleans, null)
- 2-space indentation

**Comment Addition:**
- Header comment generation
- Multiline content preservation

**Error Handling:**
- Invalid file paths
- Missing files
- Permission errors

**Integration Tests:**
- Full workflow: create → update → backup → verify

## Test Requirements

All tests must pass before merging code. Use `cargo test` as part of your development workflow.

### Dependencies

Tests use these crates:
- `tempfile`: For temporary directory/file creation
- `serde_json`: For JSON serialization/deserialization

These are already included in the dev dependencies.

## Writing New Tests

### Test Template

```rust
#[test]
fn test_feature_name() {
    // Arrange
    let input = "test input";

    // Act
    let result = function_to_test(input);

    // Assert
    assert!(result.is_ok());
    let value = result.unwrap();
    assert_eq!(value, expected_value);
}
```

### Error Testing Template

```rust
#[test]
fn test_error_case() {
    let result = function_that_should_fail(invalid_input);
    assert!(result.is_err());

    if let Err(AppError::NotFound(msg)) = result {
        assert!(msg.contains("expected error message"));
    } else {
        panic!("Expected NotFound error");
    }
}
```

### File System Testing Template

```rust
#[test]
fn test_file_operation() {
    use tempfile::TempDir;

    let temp_dir = TempDir::new().unwrap();
    let file_path = temp_dir.path().join("test.json");

    // Test file operations
    write_file(&file_path, "content").unwrap();

    assert!(file_path.exists());
    // TempDir is automatically cleaned up
}
```

## Best Practices

1. **Test Isolation**: Each test should be independent
2. **Use TempDir**: Always use temporary directories for file operations
3. **Test Error Cases**: Test both success and failure paths
4. **Clear Names**: Use descriptive test names (e.g., `test_backup_nonexistent_file`)
5. **Test Edge Cases**: Include tests for Unicode, special characters, large files
6. **Cleanup**: TempDir handles cleanup automatically, but restore permissions if modified
7. **Fast Tests**: Keep tests fast (<100ms each), avoid sleep unless necessary
8. **Comprehensive Coverage**: Aim for >80% code coverage

## Debugging Tests

### Run Single Test with Output

```bash
cargo test test_name -- --nocapture --show-output
```

### Debug with GDB

```bash
# Build test binary
cargo test --no-run

# Find test binary path (shown in build output)
# Run with gdb
gdb target/debug/deps/waybar_config-<hash>
```

### VS Code Configuration

Add to `.vscode/launch.json`:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "lldb",
      "request": "launch",
      "name": "Debug Rust Tests",
      "cargo": {
        "args": ["test", "--no-run"],
        "filter": {
          "name": "waybar-config-gui",
          "kind": "lib"
        }
      },
      "args": [],
      "cwd": "${workspaceFolder}/src-tauri"
    }
  ]
}
```

## Common Issues

### Test Fails with "already borrowed"
- **Cause**: Mutable borrow conflict
- **Solution**: Ensure tests don't share mutable state

### Test Fails with "Permission denied"
- **Cause**: Trying to write to read-only directory or file
- **Solution**: Check file/directory permissions, restore after test

### Test Hangs
- **Cause**: Infinite loop or deadlock
- **Solution**: Add timeout using `timeout` attribute:
  ```rust
  #[test]
  #[timeout(Duration::from_secs(5))]
  fn test_with_timeout() { ... }
  ```

### Tests Pass Individually but Fail Together
- **Cause**: Shared state between tests
- **Solution**: Ensure each test is truly isolated

## Continuous Integration

Tests run automatically in CI pipeline:

```yaml
# .github/workflows/rust-tests.yml
name: Rust Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Install Rust
        uses: dtolnay/rust-toolchain@stable
      - name: Run tests
        run: |
          cd src-tauri
          cargo test --verbose
      - name: Check formatting
        run: cargo fmt --check
      - name: Run clippy
        run: cargo clippy -- -D warnings
```

## Code Coverage

Generate coverage report:

```bash
# Install llvm-cov
cargo install cargo-llvm-cov

# Generate HTML report
cargo llvm-cov --html --open

# Generate lcov report (for external tools)
cargo llvm-cov --lcov --output-path lcov.info
```

**Coverage Goals:**
- **Statements**: >80%
- **Branches**: >75%
- **Functions**: >85%

## Performance Benchmarking

For performance-critical functions (like JSONC parsing):

```bash
cargo bench
```

Create benchmarks in `benches/` directory.

## Resources

- [Rust Testing Documentation](https://doc.rust-lang.org/book/ch11-00-testing.html)
- [cargo test Documentation](https://doc.rust-lang.org/cargo/commands/cargo-test.html)
- [tempfile Crate](https://docs.rs/tempfile/)
- [Rust Test Harness](https://doc.rust-lang.org/rustc/tests/index.html)
