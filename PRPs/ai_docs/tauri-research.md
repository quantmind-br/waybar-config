# Tauri + React Architecture Research

This document contains comprehensive research findings for building Tauri desktop applications with React frontend.

**Source**: Research conducted via general-purpose agent on official Tauri documentation and community examples.

## Quick Reference

- **Official Docs**: https://v2.tauri.app/
- **Getting Started**: https://v2.tauri.app/start/
- **IPC Guide**: https://v2.tauri.app/develop/calling-rust/
- **File System Plugin**: https://v2.tauri.app/plugin/file-system/

## Critical Points for Waybar GUI Config

### 1. Tauri 2.0 Capabilities System (NOT Allowlist)

**CRITICAL**: Tauri 2.0 replaced the allowlist system with capabilities and permissions.

**File**: `src-tauri/capabilities/default.json`

```json
{
  "$schema": "../gen/schemas/desktop-schema.json",
  "identifier": "default",
  "description": "Capability for main window",
  "windows": ["main"],
  "permissions": [
    "core:default",
    "fs:default",
    "fs:allow-read-text-file",
    "fs:allow-write-text-file",
    "fs:allow-read-dir",
    "fs:allow-exists",
    {
      "identifier": "fs:scope-app-config",
      "allow": ["$APPCONFIG/**", "$HOME/.config/waybar/**"],
      "deny": []
    }
  ]
}
```

### 2. File System Access Pattern

```typescript
// Frontend (TypeScript)
import { invoke } from '@tauri-apps/api/core';

async function loadWaybarConfig() {
  try {
    const content = await invoke<string>('load_config', {
      path: '~/.config/waybar/config'
    });
    return content;
  } catch (error) {
    console.error('Failed to load config:', error);
    throw error;
  }
}
```

```rust
// Backend (Rust)
#[tauri::command]
fn load_config(path: String) -> Result<String, String> {
    std::fs::read_to_string(path)
        .map_err(|e| e.to_string())
}
```

### 3. Error Handling Pattern

**Always use Result<T, String> or custom error type**

```rust
use serde::Serialize;
use thiserror::Error;

#[derive(Error, Debug, Serialize)]
#[serde(tag = "type", content = "message")]
pub enum AppError {
    #[error("IO error: {0}")]
    Io(String),

    #[error("Parse error: {0}")]
    Parse(String),
}

impl From<std::io::Error> for AppError {
    fn from(err: std::io::Error) -> Self {
        AppError::Io(err.to_string())
    }
}

#[tauri::command]
fn load_config(path: String) -> Result<String, AppError> {
    let content = std::fs::read_to_string(path)?;
    Ok(content)
}
```

### 4. Path Variables for Config Access

- `$APPCONFIG` - Application config directory (~/.config/app-name/)
- `$HOME` - User home directory
- `$CONFIG` - System config directory

### 5. Vite Configuration for Tauri

```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  clearScreen: false,
  server: {
    port: 1420,
    strictPort: true,
    watch: {
      ignored: ['**/src-tauri/**'],
    },
  },
  envPrefix: ['VITE_', 'TAURI_'],
  build: {
    target: process.env.TAURI_PLATFORM == 'windows' ? 'chrome105' : 'safari13',
    minify: !process.env.TAURI_DEBUG ? 'esbuild' : false,
    sourcemap: !!process.env.TAURI_DEBUG,
  },
});
```

### 6. Main.rs Structure

```rust
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod commands;
mod config;
mod error;

use commands::*;

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            detect_config_paths,
            load_config,
            save_config,
            load_css,
            save_css,
            reload_waybar,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
```

## Full Research Report

[Include full research report from agent here for reference]
