# Task Completion Checklist

When completing a development task, follow these steps:

## 1. Code Quality

### TypeScript
- [ ] TypeScript compiles without errors (`npm run build`)
- [ ] No unused variables or imports (strict mode catches these)
- [ ] Types are properly defined (no `any` unless necessary)
- [ ] Component props have proper types

### Rust
- [ ] Rust compiles without warnings (`cargo build`)
- [ ] No clippy warnings (`cargo clippy` if available)
- [ ] Error handling uses `Result<T>` pattern
- [ ] Tauri commands properly annotated with `#[tauri::command]`

## 2. Testing

### Frontend Tests
- [ ] Run tests: `npm test`
- [ ] Tests pass for modified components
- [ ] New functionality has tests (if applicable)
- [ ] Integration tests updated if workflow changed

### Backend Tests
- [ ] Run Rust tests: `cd src-tauri && cargo test`
- [ ] All tests pass
- [ ] New commands have unit tests (if applicable)

## 3. State Management

### Config Store Changes
- [ ] Use Immer mutations (direct mutations, no spreads)
- [ ] Undo/redo works correctly (if config-store modified)
- [ ] State persists correctly (localStorage)

### Validation
- [ ] Zod schemas updated (if data structure changed)
- [ ] Validation runs without errors
- [ ] Error messages are clear and actionable

## 4. Tauri Integration

### New Commands
- [ ] Command defined in `commands.rs`
- [ ] Command registered in `lib.rs` (`generate_handler!`)
- [ ] Frontend wrapper added to `lib/tauri/commands.ts`
- [ ] Error handling works correctly
- [ ] Command tested with both success and error cases

## 5. UI/UX

### Components
- [ ] Component renders without errors
- [ ] Responsive design works
- [ ] Keyboard navigation functional (if applicable)
- [ ] Accessibility attributes present (ARIA labels, etc.)
- [ ] Loading/error states handled

### Drag & Drop
- [ ] Dragging works smoothly
- [ ] Drop zones highlight correctly
- [ ] Invalid drops are prevented
- [ ] State updates correctly after drop

## 6. Code Organization

- [ ] Files in correct directories
- [ ] Imports organized (React imports first, then libraries, then local)
- [ ] File headers present (`// ===...===`)
- [ ] Barrel exports updated (`index.ts` files)
- [ ] No duplicate code

## 7. Documentation

- [ ] Complex logic has comments
- [ ] Type definitions exported for public APIs
- [ ] README.md updated (if user-facing feature)
- [ ] CLAUDE.md updated (if architecture changed significantly)

## 8. Manual Testing

### Basic Workflow
- [ ] App starts: `npm run tauri dev`
- [ ] Load existing Waybar config
- [ ] Add/edit/remove modules
- [ ] Save config (creates backup)
- [ ] Waybar reloads correctly
- [ ] Undo/redo works (Ctrl+Z, Ctrl+Shift+Z)

### Error Cases
- [ ] Invalid config shows clear errors
- [ ] Missing files handled gracefully
- [ ] Network/file permission errors handled

## 9. Build Verification

- [ ] Frontend builds: `npm run build`
- [ ] Backend builds: `cd src-tauri && cargo build --release`
- [ ] Full app builds: `npm run tauri build` (if major changes)

## 10. Git

- [ ] Changes committed with clear message
- [ ] No debug code left in
- [ ] No commented-out code (unless intentional with explanation)
- [ ] `.gitignore` respected (no build artifacts committed)

## Quick Commands Summary

```bash
# Frontend
npm run build          # Build check
npm test              # Run tests

# Backend
cd src-tauri
cargo build           # Build check
cargo test            # Run tests

# Full app
npm run tauri dev     # Test in development
```

## Common Issues to Check

- **Immer mutations**: Use direct mutations, not spreads
- **Temporal middleware**: Only config-store has undo/redo
- **Validation store**: Don't add temporal to validation-store
- **JSONC handling**: Backend strips comments, frontend uses JSON
- **Error serialization**: AppError must be serializable for Tauri
