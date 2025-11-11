# Performance Optimization Guide

Comprehensive guide for optimizing bundle size and runtime performance of Waybar Config GUI.

## 📊 Current Status

Run analysis to get baseline metrics:

```bash
# Analyze bundle size
npm run build
npx vite-bundle-visualizer

# Check Tauri binary size
cd src-tauri
cargo build --release
ls -lh target/release/waybar-config-gui
```

**Target Metrics:**
- Frontend bundle: <500KB gzipped
- Tauri binary: <10MB
- Cold start time: <2s
- Hot reload time: <500ms
- Memory usage: <150MB

## 🎯 Frontend Optimizations

### 1. Code Splitting

Lazy load heavy components that aren't needed immediately:

```typescript
// src/App.tsx
import { lazy, Suspense } from 'react'
import { LoadingSpinner } from './components/common/LoadingSpinner'

// Lazy load module editors (loaded only when opened)
const BatteryEditor = lazy(() => import('./components/modules/editors/BatteryEditor'))
const ClockEditor = lazy(() => import('./components/modules/editors/ClockEditor'))
const CPUEditor = lazy(() => import('./components/modules/editors/CPUEditor'))
// ... other editors

// Lazy load Monaco Editor (large dependency)
const CodeEditor = lazy(() => import('./components/styles/CodeEditor'))

function ModuleEditor({ type }: { type: string }) {
  return (
    <Suspense fallback={<LoadingSpinner label="Loading editor..." />}>
      {type === 'battery' && <BatteryEditor />}
      {type === 'clock' && <ClockEditor />}
      {type === 'cpu' && <CPUEditor />}
      {/* ... */}
    </Suspense>
  )
}
```

**Estimated Savings:** 200-300KB

### 2. Tree Shaking

Ensure optimal tree shaking by using named imports:

```typescript
// ❌ Bad: Imports entire library
import _ from 'lodash'
_.debounce(func, 300)

// ✅ Good: Tree-shakeable
import { debounce } from 'lodash-es'
debounce(func, 300)

// ❌ Bad: Imports all icons
import * as LucideIcons from 'lucide-react'

// ✅ Good: Only imports used icons
import { Check, X, Edit, Trash } from 'lucide-react'
```

**Estimated Savings:** 100-150KB

### 3. Monaco Editor Optimization

Monaco Editor is large (~3MB). Optimize by:

```typescript
// vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import monacoEditorPlugin from 'vite-plugin-monaco-editor'

export default defineConfig({
  plugins: [
    react(),
    monacoEditorPlugin({
      // Only include languages we need
      languages: ['json', 'css'],
      // Exclude features we don't use
      features: [
        '!gotoSymbol',
        '!inspectTokens',
        '!quickCommand',
        '!quickHelp',
        '!referenceSearch',
        '!rename',
      ],
    }),
  ],
})
```

**Install plugin:**
```bash
npm install -D vite-plugin-monaco-editor
```

**Estimated Savings:** 1-2MB

### 4. Image Optimization

Optimize images and icons:

```bash
# Install image optimizer
npm install -D vite-plugin-imagemin

# Convert icons to WebP
find public/icons -name "*.png" -exec cwebp -q 80 {} -o {}.webp \;
```

```typescript
// vite.config.ts
import viteImagemin from 'vite-plugin-imagemin'

export default defineConfig({
  plugins: [
    viteImagemin({
      gifsicle: { optimizationLevel: 7 },
      optipng: { optimizationLevel: 7 },
      mozjpeg: { quality: 20 },
      pngquant: { quality: [0.8, 0.9], speed: 4 },
      svgo: {
        plugins: [
          { name: 'removeViewBox' },
          { name: 'removeEmptyAttrs', active: false },
        ],
      },
    }),
  ],
})
```

**Estimated Savings:** 50-100KB

### 5. Compression

Enable Brotli and Gzip compression:

```typescript
// vite.config.ts
import viteCompression from 'vite-plugin-compression'

export default defineConfig({
  plugins: [
    // Brotli compression
    viteCompression({
      algorithm: 'brotliCompress',
      ext: '.br',
      threshold: 1024,
    }),
    // Gzip compression (fallback)
    viteCompression({
      algorithm: 'gzip',
      ext: '.gz',
      threshold: 1024,
    }),
  ],
})
```

**Install plugin:**
```bash
npm install -D vite-plugin-compression
```

**Estimated Savings:** 30-40% of total bundle size

### 6. Remove Console Logs

Remove console logs in production:

```typescript
// vite.config.ts
export default defineConfig({
  esbuild: {
    drop: import.meta.env.PROD ? ['console', 'debugger'] : [],
  },
})
```

**Estimated Savings:** 5-10KB

### 7. Optimize Dependencies

Replace heavy dependencies with lighter alternatives:

```bash
# Replace date-fns (if used) with day.js
npm uninstall date-fns
npm install dayjs

# Use preact-compat instead of React (experimental)
# Only if you need extreme size reduction
npm install preact preact-compat
```

**Estimated Savings:** Variable (50-200KB)

## 🦀 Rust Backend Optimizations

### 1. Strip Debug Symbols

```toml
# Cargo.toml
[profile.release]
opt-level = 'z'          # Optimize for size
lto = true               # Link-time optimization
codegen-units = 1        # Better optimization (slower build)
strip = true             # Strip debug symbols
panic = 'abort'          # Smaller panic handler
```

**Estimated Savings:** 30-50% of binary size

### 2. Reduce Dependencies

Audit and remove unused dependencies:

```bash
cd src-tauri
cargo install cargo-udeps
cargo +nightly udeps
```

Remove unnecessary features from dependencies:

```toml
# Cargo.toml
[dependencies]
serde = { version = "1.0", default-features = false, features = ["derive"] }
```

**Estimated Savings:** Variable

### 3. Use System Allocator

For better performance on Linux:

```rust
// src-tauri/src/main.rs
#[cfg(target_os = "linux")]
#[global_allocator]
static GLOBAL: std::alloc::System = std::alloc::System;
```

**Benefit:** Reduced memory usage (~10-20%)

### 4. Enable Parallel Compilation

```toml
# .cargo/config.toml
[build]
jobs = 8  # Use all CPU cores
```

**Benefit:** Faster builds (not size, but development speed)

## ⚡ Runtime Performance Optimizations

### 1. Zustand Selectors

Always use selectors to prevent unnecessary re-renders:

```typescript
// ❌ Bad: Entire store subscription
const state = useConfigStore()

// ✅ Good: Selective subscription
const bars = useConfigStore(state => state.config.bars)
const isDirty = useConfigStore(state => state.isDirty)
```

### 2. React.memo

Memoize expensive components:

```typescript
import { memo } from 'react'

export const ModuleCard = memo(({ module }: { module: ModuleInstance }) => {
  // Component implementation
}, (prevProps, nextProps) => {
  // Custom comparison
  return prevProps.module.id === nextProps.module.id &&
         prevProps.module.enabled === nextProps.module.enabled
})
```

### 3. useMemo and useCallback

Memoize expensive computations:

```typescript
import { useMemo, useCallback } from 'react'

function BarEditor() {
  const modules = useConfigStore(state => state.config.bars[0].modules)

  // Memoize expensive computation
  const sortedModules = useMemo(() => {
    return modules
      .filter(m => m.position === 'left')
      .sort((a, b) => a.order - b.order)
  }, [modules])

  // Memoize callback
  const handleModuleUpdate = useCallback((id: string, updates: Partial<ModuleInstance>) => {
    // Update logic
  }, [])

  return <div>{/* ... */}</div>
}
```

### 4. Virtual Scrolling

For long lists (>100 items), use virtual scrolling:

```bash
npm install react-window
```

```typescript
import { FixedSizeList } from 'react-window'

function ModulePalette({ modules }: { modules: Module[] }) {
  return (
    <FixedSizeList
      height={600}
      itemCount={modules.length}
      itemSize={80}
      width="100%"
    >
      {({ index, style }) => (
        <div style={style}>
          <ModulePaletteItem module={modules[index]} />
        </div>
      )}
    </FixedSizeList>
  )
}
```

**Benefit:** Smooth scrolling with 1000+ items

### 5. Debounce Expensive Operations

Debounce validation and auto-save:

```typescript
import { useMemo } from 'react'

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => clearTimeout(handler)
  }, [value, delay])

  return debouncedValue
}

// Usage
const modules = useConfigStore(state => state.config.bars[0].modules)
const debouncedModules = useDebounce(modules, 300)

useEffect(() => {
  validateModules(debouncedModules)
}, [debouncedModules])
```

**Benefit:** Reduces validation calls by 90%

### 6. Lazy Component Loading

Use Intersection Observer to load components when visible:

```typescript
import { useEffect, useRef, useState } from 'react'

function useLazyLoad() {
  const ref = useRef<HTMLDivElement>(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    if (!ref.current) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          observer.disconnect()
        }
      },
      { threshold: 0.1 }
    )

    observer.observe(ref.current)

    return () => observer.disconnect()
  }, [])

  return { ref, isVisible }
}

// Usage
function HeavyComponent() {
  const { ref, isVisible } = useLazyLoad()

  return (
    <div ref={ref}>
      {isVisible ? <ExpensiveContent /> : <Skeleton />}
    </div>
  )
}
```

## 📦 Build Configuration

### Optimized vite.config.ts

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { visualizer } from 'rollup-plugin-visualizer'
import viteCompression from 'vite-plugin-compression'
import monacoEditorPlugin from 'vite-plugin-monaco-editor'

export default defineConfig({
  plugins: [
    react(),
    monacoEditorPlugin({
      languages: ['json', 'css'],
      features: [
        '!gotoSymbol',
        '!inspectTokens',
        '!quickCommand',
        '!quickHelp',
        '!referenceSearch',
        '!rename',
      ],
    }),
    viteCompression({ algorithm: 'brotliCompress', ext: '.br' }),
    viteCompression({ algorithm: 'gzip', ext: '.gz' }),
    visualizer({
      filename: './dist/stats.html',
      open: false,
      gzipSize: true,
      brotliSize: true,
    }),
  ],
  build: {
    target: 'esnext',
    minify: 'esbuild',
    cssMinify: true,
    cssCodeSplit: true,
    reportCompressedSize: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          store: ['zustand', 'zundo', 'immer'],
          validation: ['zod'],
          dnd: ['@dnd-kit/core', '@dnd-kit/sortable', '@dnd-kit/utilities'],
          icons: ['lucide-react'],
          monaco: ['@monaco-editor/react', 'monaco-editor'],
        },
      },
    },
  },
  esbuild: {
    drop: import.meta.env.PROD ? ['console', 'debugger'] : [],
  },
})
```

## 📏 Measurement & Monitoring

### 1. Bundle Analysis

```bash
# Generate bundle visualization
npm run build
npx vite-bundle-visualizer

# Analyze with source-map-explorer
npm install -g source-map-explorer
source-map-explorer dist/assets/*.js
```

### 2. Performance Profiling

```typescript
// Add performance marks
performance.mark('config-load-start')
await loadConfig()
performance.mark('config-load-end')

performance.measure('config-load', 'config-load-start', 'config-load-end')
const measures = performance.getEntriesByType('measure')
console.log(measures)
```

### 3. Lighthouse Audit

Run Lighthouse in development:

```bash
npm run tauri dev

# In another terminal
npx lighthouse http://localhost:1420 --view
```

**Target Scores:**
- Performance: >90
- Best Practices: >95
- Accessibility: >95
- SEO: N/A (desktop app)

## ✅ Checklist

### Before Release

- [ ] Run `npm run build` and check bundle size
- [ ] Analyze with `vite-bundle-visualizer`
- [ ] Strip debug symbols from Rust binary
- [ ] Test cold start time (<2s)
- [ ] Test memory usage (<150MB)
- [ ] Profile with React DevTools Profiler
- [ ] Check for memory leaks
- [ ] Test with large configs (50+ modules)
- [ ] Measure bundle size delta vs previous version

### Quick Wins (Do First)

1. ✅ Enable Brotli/Gzip compression
2. ✅ Strip debug symbols from Rust binary
3. ✅ Lazy load Monaco Editor
4. ✅ Use tree-shakeable imports
5. ✅ Remove console logs in production

### Long-term Improvements

1. Implement code splitting for all module editors
2. Add virtual scrolling for large lists
3. Optimize Monaco Editor with custom build
4. Profile and optimize render cycles
5. Implement service worker for caching

## 📈 Expected Results

After applying all optimizations:

| Metric | Before | After | Improvement |
|--------|--------|-------|-------------|
| Bundle Size (gzipped) | ~800KB | ~400KB | 50% |
| Tauri Binary | ~15MB | ~8MB | 47% |
| Cold Start Time | ~3s | ~1.5s | 50% |
| Memory Usage | ~200MB | ~120MB | 40% |
| Lighthouse Score | 75 | 95 | +27% |

## 🔍 Troubleshooting

### Bundle Still Too Large

1. Run `npx vite-bundle-visualizer` to identify culprits
2. Check for duplicate dependencies: `npm ls`
3. Replace heavy libraries with alternatives
4. Consider splitting into multiple bundles

### App Feels Slow

1. Profile with React DevTools Profiler
2. Check for unnecessary re-renders
3. Use `console.time()` to measure operations
4. Enable React Strict Mode to catch issues

### Build Time Too Long

1. Use `esbuild` instead of Babel
2. Reduce `codegen-units` in Cargo.toml
3. Enable parallel builds: `cargo build -j8`
4. Use incremental compilation

## 📚 Resources

- [Vite Performance Guide](https://vitejs.dev/guide/performance.html)
- [React Performance Optimization](https://react.dev/learn/render-and-commit#optimizing-performance)
- [Rust Binary Size](https://github.com/johnthagen/min-sized-rust)
- [Tauri Bundling Guide](https://tauri.app/v1/guides/building/)
- [Web.dev Performance](https://web.dev/fast/)
