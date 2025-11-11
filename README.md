# Waybar Configuration GUI

A modern, visual configuration tool for [Waybar](https://github.com/Alexays/Waybar) - the highly customizable Wayland bar for Sway, Hyprland, and other wlroots-based compositors.

Stop manually editing JSON files and CSS stylesheets - configure your Waybar visually with drag-and-drop modules, real-time validation, and an intuitive interface!

![Waybar Config GUI](docs/images/screenshot.png)

## ✨ Features

### 🎨 Visual Configuration
- **Drag-and-drop Module Arrangement**: Easily organize modules in left, center, and right zones
- **Visual CSS Editor**: Configure colors, spacing, and styling without writing CSS
- **Real-time Preview**: See changes before applying them
- **Module Templates**: Quick-start configurations for common use cases

### 🛠️ Module Management
- **50+ Supported Modules**: Clock, battery, CPU, memory, network, workspaces, and more
- **Module Editor**: Configure each module with forms and validation
- **Multiple Instances**: Add multiple instances of the same module (e.g., battery#bat0, battery#bat1)
- **Module Palette**: Browse and search all available modules

### 💾 Smart Configuration
- **Automatic Backups**: Creates backups before modifying your configuration
- **JSONC Support**: Handles JSON with comments seamlessly
- **Validation**: Real-time error checking prevents invalid configurations
- **Undo/Redo**: Full history with unlimited undo/redo (Ctrl+Z, Ctrl+Shift+Z)

### 🎯 User-Friendly
- **Dark/Light Theme**: Auto-detects system theme or set manually
- **Keyboard Shortcuts**: Efficient workflow with comprehensive shortcuts (Ctrl+S to save, Ctrl+/ for help)
- **Error Boundaries**: Graceful error handling with recovery options
- **Loading States**: Clear feedback during async operations

### 🔧 Technical Highlights
- **Tauri 2.0**: Fast, secure desktop application
- **React + TypeScript**: Modern, type-safe frontend
- **Zustand State Management**: Predictable state with Immer and Zundo
- **Zod Validation**: Comprehensive schema validation
- **dnd-kit**: Accessible drag-and-drop
- **Rust Backend**: Secure file system operations

## 📦 Installation

### Prerequisites

- **Linux** (Wayland compositor)
- **Node.js** 18+ and npm/bun
- **Rust** 1.70+ (for building from source)
- **Waybar** installed on your system

### From Binary (Recommended)

```bash
# Download latest release
wget https://github.com/yourusername/waybar-config/releases/latest/download/waybar-config-gui.AppImage

# Make executable
chmod +x waybar-config-gui.AppImage

# Run
./waybar-config-gui.AppImage
```

### From Source

```bash
# Clone repository
git clone https://github.com/yourusername/waybar-config.git
cd waybar-config

# Install dependencies
npm install

# Run development version
npm run tauri dev

# Build production version
npm run tauri build
```

The built application will be in `src-tauri/target/release/bundle/`.

## 🚀 Quick Start

### 1. Launch the Application

```bash
waybar-config-gui
```

### 2. Create or Load Configuration

- **New Config**: Click "New Configuration" and choose a template
- **Load Existing**: The app automatically detects your Waybar config at `~/.config/waybar/`

### 3. Add Modules

1. Browse the **Module Palette** on the left
2. **Drag a module** to the left, center, or right zone
3. **Click the module** to configure it
4. Adjust settings in the module editor

### 4. Customize Styling

1. Switch to the **Styles** tab
2. Use the **Visual Editor** for colors, spacing, borders
3. Or use the **Code Editor** for advanced CSS

### 5. Save and Apply

1. Press **Ctrl+S** or click **Save**
2. The app creates a backup and updates your config
3. Waybar automatically reloads (if running)
4. See your changes instantly!

## 📖 User Guide

### Module Palette

Browse and search all available Waybar modules:

- **System**: CPU, Memory, Disk, Temperature, Load
- **Hardware**: Battery, Backlight, Bluetooth, Keyboard State
- **Window Manager**: Workspaces, Window, Mode, Language
- **Media**: MPD, MPRIS, Cava
- **Utilities**: Clock, Tray, Idle Inhibitor, Custom

**Tip**: Use the search bar to filter modules by name.

### Module Configuration

Each module has a dedicated editor with:

- **Format**: Customize display format with placeholders (e.g., `{capacity}% {icon}`)
- **Tooltips**: Configure tooltip format and behavior
- **States**: Define thresholds for warnings and critical states
- **Actions**: Set on-click, on-scroll-up/down commands
- **Styling**: Module-specific CSS classes

**Example: Battery Module**

```json
{
  "format": "{capacity}% {icon}",
  "format-icons": ["", "", "", "", ""],
  "states": {
    "warning": 30,
    "critical": 15
  },
  "on-click": "gnome-power-statistics"
}
```

### Drag and Drop

**Add Module**: Drag from palette to left/center/right zone

**Reorder**: Drag modules within the same zone

**Move Between Zones**: Drag a module to a different zone

**Remove**: Click the trash icon or press Delete

**Keyboard Navigation**: Tab through modules, Enter to configure, Delete to remove

### Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl+S` | Save configuration |
| `Ctrl+Z` | Undo last change |
| `Ctrl+Shift+Z` | Redo |
| `Ctrl+Y` | Redo (alternative) |
| `Ctrl+/` | Show keyboard shortcuts help |
| `Escape` | Close modal/dialog |

### Validation

The app validates your configuration in real-time:

- **Red Indicators**: Errors that prevent saving
- **Yellow Indicators**: Warnings (save allowed)
- **Error Messages**: Clear, actionable error descriptions

**Common Validation Errors:**
- Negative intervals or dimensions
- Invalid format strings
- Duplicate module IDs
- Missing required fields

### Backups

Automatic backups are created before saving:

**Location**: `~/.config/waybar/config.backup.<timestamp>`

**Restore Backup**:
```bash
cp ~/.config/waybar/config.backup.1234567890 ~/.config/waybar/config
```

### Themes

**System** (default): Auto-detects light/dark preference

**Light**: Force light theme

**Dark**: Force dark theme

**Toggle**: Click the theme icon in the top-right corner

## 🔧 Configuration

### App Settings

The app stores settings in `~/.config/waybar-config-gui/settings.json`:

```json
{
  "theme": "dark",
  "autoSave": false,
  "validateOnChange": true,
  "backupLimit": 10
}
```

### Waybar Integration

The app reads and writes standard Waybar config files:

- **Config**: `~/.config/waybar/config` (or `.jsonc`)
- **Style**: `~/.config/waybar/style.css`

**Compatibility**: Fully compatible with manually edited configs. The app preserves:
- Comments
- Custom formatting
- Unknown/custom properties

### Multiple Bars

Create and manage multiple bar configurations:

1. Click **"New Bar"** in the bar list
2. Configure position, height, output
3. Add modules to each bar
4. Toggle bars on/off

**Multi-monitor Setup**:
```json
{
  "output": ["DP-1", "HDMI-A-1"]
}
```

## 🐛 Troubleshooting

### Configuration Not Loading

**Issue**: App doesn't detect existing config

**Solution**:
1. Check config location: `~/.config/waybar/config`
2. Verify file permissions (must be readable)
3. Check for syntax errors: `waybar --test` (if supported)

### Waybar Not Reloading

**Issue**: Changes not visible in Waybar

**Solution**:
1. Manually reload: `pkill -SIGUSR2 waybar`
2. Restart Waybar: `pkill waybar && waybar &`
3. Check Waybar logs: `journalctl --user -u waybar -f`

### Validation Errors

**Issue**: Cannot save due to validation errors

**Solution**:
1. Read error messages carefully
2. Fix reported issues
3. Check Waybar documentation for valid values
4. Clear invalid fields and reconfigure

### App Crashes

**Issue**: Application crashes unexpectedly

**Solution**:
1. Check logs: `~/.config/waybar-config-gui/logs/`
2. Report issue with logs and steps to reproduce
3. Use backup to restore configuration

### Performance Issues

**Issue**: App is slow or unresponsive

**Solution**:
1. Reduce number of modules (>50 may be slow)
2. Disable real-time validation
3. Close other heavy applications
4. Check system resources (CPU/Memory)

## 🤝 Contributing

Contributions are welcome! Please read [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

### Development Setup

```bash
# Clone and install
git clone https://github.com/yourusername/waybar-config.git
cd waybar-config
npm install

# Run dev server
npm run tauri dev

# Run tests
npm test
cd src-tauri && cargo test

# Build for production
npm run tauri build
```

### Project Structure

```
waybar-config/
├── src/                    # React frontend
│   ├── components/         # UI components
│   ├── lib/               # Utilities, hooks, types
│   ├── store/             # Zustand state management
│   └── test/              # Tests
├── src-tauri/             # Rust backend
│   └── src/
│       ├── config/        # Config parsing/writing
│       ├── waybar/        # Waybar process control
│       └── system/        # System integration
└── PRPs/                  # Project Requirements & Planning
```

## 📜 License

MIT License - see [LICENSE](LICENSE) for details.

## 🙏 Acknowledgments

- **[Waybar](https://github.com/Alexays/Waybar)** - The amazing Wayland bar this tool configures
- **[Tauri](https://tauri.app/)** - Secure, fast desktop application framework
- **[Zustand](https://zustand-demo.pmnd.rs/)** - Minimal state management
- **[dnd-kit](https://dndkit.com/)** - Modern drag-and-drop library
- **[Zod](https://zod.dev/)** - TypeScript-first schema validation

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/yourusername/waybar-config/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/waybar-config/discussions)
- **Discord**: [Join our community](#)

## 🗺️ Roadmap

- [ ] Live preview in iframe
- [ ] Import/export configuration bundles
- [ ] Theme marketplace
- [ ] Module presets and templates
- [ ] Multi-language support
- [ ] CLI for automation
- [ ] Plugin system for custom modules

---

**Made with ❤️ for the Wayland community**

**Star ⭐ this repo if you find it useful!**
