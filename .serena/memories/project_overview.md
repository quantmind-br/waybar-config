# Project Overview: Waybar Configuration GUI

## Purpose
A visual desktop application for configuring Waybar (Wayland bar for Sway, Hyprland, and wlroots compositors). Eliminates manual JSON/CSS editing with drag-and-drop interface, real-time validation, and visual configuration.

## Tech Stack

### Frontend
- **React 19** + TypeScript
- **Vite 7** - Build tool and dev server
- **Zustand 5** - State management with Immer (mutations) and Zundo (undo/redo)
- **Zod 4** - Schema validation
- **dnd-kit** - Accessible drag-and-drop
- **Monaco Editor** - Code editing with syntax highlighting
- **TailwindCSS 4** - Styling
- **Lucide React** - Icon library
- **Vitest** - Testing with jsdom

### Backend
- **Tauri 2.0** - Rust-based desktop framework
- **Rust edition 2021**
- **serde/serde_json** - Serialization
- **thiserror/anyhow** - Error handling
- **tempfile** - Testing utilities

## Key Features
- Drag-and-drop module arrangement (50+ modules)
- Visual CSS editor
- Real-time validation with Zod schemas
- Automatic backups before saving
- JSONC support (JSON with comments)
- Undo/redo with unlimited history
- Dark/light theme support
- Keyboard shortcuts (Ctrl+Z, Ctrl+S, etc.)

## System Requirements
- Linux with Wayland compositor
- Node.js 18+
- Rust 1.70+ (for building)
- Waybar installed
