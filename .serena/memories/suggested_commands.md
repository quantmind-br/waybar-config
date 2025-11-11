# Suggested Development Commands

## Frontend Development

### Development Server
```bash
npm run dev              # Vite dev server (frontend only)
npm run tauri dev        # Full Tauri app with hot reload (RECOMMENDED)
```

### Building
```bash
npm run build            # Build frontend (TypeScript + Vite)
npm run tauri build      # Build production desktop app
npm run preview          # Preview production build
```

### Testing
```bash
npm test                 # Run tests with Vitest
npm run test:ui          # Run tests with UI
npm run test:coverage    # Generate coverage report (coverage.html)
```

## Backend (Rust) Development

```bash
cd src-tauri

cargo build              # Build Rust backend
cargo test               # Run all tests
cargo test test_name     # Run specific test
cargo test -- --nocapture  # Show output during tests
```

## Output Locations
- Production build: `src-tauri/target/release/bundle/`
- Dev artifacts: `dist/` (frontend), `src-tauri/target/debug/` (backend)

## Configuration Files
- Waybar config: `~/.config/waybar/config` or `config.jsonc`
- Waybar styles: `~/.config/waybar/style.css`
- Backups: `~/.config/waybar/config.backup.<timestamp>`

## Common Tasks
- **Full development workflow**: `npm run tauri dev`
- **Run tests before commit**: `npm test && cd src-tauri && cargo test`
- **Build release**: `npm run tauri build`
