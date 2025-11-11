# Plano Detalhado: GUI para Configuração da Waybar

## 1. VISÃO GERAL DO PROJETO

### 1.1 Objetivo
Desenvolver uma aplicação gráfica completa e intuitiva para configurar e customizar a Waybar, eliminando a necessidade de edição manual de arquivos JSON e CSS.

### 1.2 Escopo
- Editor visual de configuração JSON da Waybar
- Editor visual de estilização CSS
- Preview em tempo real das mudanças
- Gerenciamento de múltiplas barras
- Templates e presets pré-configurados
- Importação/exportação de configurações
- Validação de sintaxe e parâmetros

---

## 2. ARQUITETURA DA APLICAÇÃO

### 2.1 Stack Tecnológico Recomendado

#### Opção 1: Tauri + React/Vue (RECOMENDADO)
**Vantagens:**
- Aplicação desktop nativa e leve
- Integração com sistema de arquivos Linux
- Baixo consumo de recursos
- Interface moderna e responsiva
- Hot reload durante desenvolvimento
- Compatibilidade nativa com Wayland/Hyprland

**Stack:**
- **Backend:** Rust (Tauri)
- **Frontend:** React + TypeScript
- **Estilização:** TailwindCSS + shadcn/ui
- **State Management:** Zustand ou Redux Toolkit
- **Validação:** Zod
- **Preview:** Monaco Editor (syntax highlighting)

#### Opção 2: Electron + React
**Stack similar, mais pesado mas com maior ecossistema**

#### Opção 3: GTK4 + Python (Nativo Linux)
**Para máxima integração com ambiente GTK**

### 2.2 Arquitetura de Camadas

```
┌─────────────────────────────────────────────────────┐
│                  PRESENTATION LAYER                 │
│  (UI Components, Forms, Preview, Visual Editor)     │
└─────────────────────────────────────────────────────┘
                         ↓↑
┌─────────────────────────────────────────────────────┐
│                   BUSINESS LOGIC                    │
│  (Config Parser, Validator, CSS Generator, State)   │
└─────────────────────────────────────────────────────┘
                         ↓↑
┌─────────────────────────────────────────────────────┐
│                    DATA LAYER                       │
│  (File System Access, JSON/CSS Parser, IPC)         │
└─────────────────────────────────────────────────────┘
                         ↓↑
┌─────────────────────────────────────────────────────┐
│                  SYSTEM INTEGRATION                 │
│  (Waybar Process, Config Files, System Detection)   │
└─────────────────────────────────────────────────────┘
```

---

## 3. COMPILAÇÃO COMPLETA DE PARÂMETROS WAYBAR

### 3.1 Parâmetros Globais da Barra

#### 3.1.1 Configuração Estrutural
```typescript
interface BarConfig {
  // Posicionamento e Layout
  layer?: 'top' | 'bottom';  // Camada de exibição
  output?: string | string[]; // Tela(s) alvo
  position?: 'top' | 'bottom' | 'left' | 'right';
  height?: number;
  width?: number;

  // Módulos
  'modules-left'?: string[];
  'modules-center'?: string[];
  'modules-right'?: string[];

  // Espaçamento e Margens
  margin?: string; // Formato CSS sem unidades
  spacing?: number; // Default: 4

  // Comportamento
  mode?: 'dock' | 'hide' | 'invisible' | 'overlay';
  'start_hidden'?: boolean;
  exclusive?: boolean; // Default: true
  passthrough?: boolean; // Default: false
  'fixed-center'?: boolean; // Default: true

  // Customização
  name?: string; // Classe CSS customizada
  id?: string; // Override bar_id para Sway IPC

  // Funcionalidades
  ipc?: boolean; // Subscrever eventos Sway IPC
  include?: string[]; // Arquivos de configuração adicionais
  'reload_style_on_change'?: boolean;
  'modifier-reset'?: 'press' | 'release';
}
```

#### 3.1.2 Ações Interativas Globais
```typescript
interface InteractiveActions {
  'on-click'?: string;
  'on-click-release'?: string;
  'on-double-click'?: string;
  'on-triple-click'?: string;
  'on-click-middle'?: string;
  'on-click-middle-release'?: string;
  'on-double-click-middle'?: string;
  'on-triple-click-middle'?: string;
  'on-click-right'?: string;
  'on-click-right-release'?: string;
  'on-double-click-right'?: string;
  'on-triple-click-right'?: string;
  'on-click-backward'?: string;
  'on-click-forward'?: string;
  'on-scroll-up'?: string;
  'on-scroll-down'?: string;
  'on-scroll-left'?: string;
  'on-scroll-right'?: string;
  'on-update'?: string;
}
```

### 3.2 Módulos Disponíveis

#### 3.2.1 Sistema de Informação

##### **Battery Module**
```typescript
interface BatteryModule extends InteractiveActions {
  bat?: string; // Default: auto-detect
  adapter?: string; // Default: auto-detect
  'design-capacity'?: boolean; // Default: false
  'full-at'?: number;
  interval?: number; // Default: 60

  // Display
  format?: string; // Default: "{capacity}%"
  'format-time'?: string; // Default: "{H} h {M} min"
  'format-icons'?: string[] | Record<string, string>;
  'max-length'?: number;
  rotate?: number;

  // Tooltip
  tooltip?: boolean; // Default: true
  'tooltip-format'?: string; // Default: "{timeTo}"

  // Avançado
  states?: Record<string, number>;
  'weighted-average'?: boolean; // Default: false
  'bat-compatibility'?: boolean; // Default: false
  'smooth-scrolling-threshold'?: number;

  // Replacements: {capacity}, {power}, {icon}, {time}, {cycles}, {health}, {timeTo}
}
```

##### **CPU Module**
```typescript
interface CPUModule extends InteractiveActions {
  interval?: number; // Default: 10
  format?: string; // Default: "{usage}%"
  'max-length'?: number;
  rotate?: number;
  states?: Record<string, number>;
  tooltip?: boolean; // Default: true

  // Replacements: {load}, {usage}, {usage0-N}, {icon}, {icon0-N},
  // {avg_frequency}, {max_frequency}, {min_frequency}
}
```

##### **Memory Module**
```typescript
interface MemoryModule extends InteractiveActions {
  interval?: number; // Default: 30
  format?: string; // Default: "{percentage}%"
  rotate?: number;
  states?: Record<string, number>;
  'max-length'?: number;
  tooltip?: boolean; // Default: true
  'tooltip-format'?: string; // Default: "{used:0.1f}GiB used"

  // Replacements: {percentage}, {used}, {total}, {avail},
  // {swapPercentage}, {swapUsed}, {swapTotal}, {swapAvail}
}
```

##### **Network Module**
```typescript
interface NetworkModule extends InteractiveActions {
  interface?: string; // Aceita wildcards
  interval?: number; // Default: 60
  family?: 'ipv4' | 'ipv6'; // Default: ipv4

  // Formatos por Estado
  format?: string; // Default: {ifname}
  'format-ethernet'?: string;
  'format-wifi'?: string;
  'format-linked'?: string;
  'format-disconnected'?: string;
  'format-disabled'?: string;
  'format-alt'?: string;
  'format-icons'?: string[] | Record<string, string>;

  // Tooltip
  tooltip?: boolean; // Default: true
  'tooltip-format'?: string;
  'tooltip-format-ethernet'?: string;
  'tooltip-format-wifi'?: string;
  'tooltip-format-disconnected'?: string;
  'tooltip-format-disabled'?: string;

  rotate?: number;
  'max-length'?: number;
  'smooth-scrolling-threshold'?: number;

  // Replacements: {ifname}, {ipaddr}, {gwaddr}, {netmask}, {cidr},
  // {essid}, {signalStrength}, {signalStrengthApp}, {frequency},
  // {bandwidthUpBits}, {bandwidthDownBits}, {bandwidthUpBytes},
  // {bandwidthDownBytes}, {bandwidthUpOctets}, {bandwidthDownOctets}
}
```

##### **Clock Module**
```typescript
interface ClockModule extends InteractiveActions {
  interval?: number; // Default: 60
  format?: string; // Default: "{:%H:%M}"
  timezone?: string; // Ex: "America/New_York"
  timezones?: string[];
  locale?: string;
  'max-length'?: number;
  rotate?: number;
  tooltip?: boolean; // Default: true
  'tooltip-format'?: string;

  // Calendar
  calendar?: {
    mode?: 'year' | 'month'; // Default: month
    'mode-mon-col'?: number; // Default: 3
    'weeks-pos'?: string;
    'on-scroll'?: number; // Default: 1
    format?: {
      months?: string;
      days?: string;
      weeks?: string;
      weekdays?: string;
      today?: string;
    };
  };

  actions?: {
    mode?: string;
    'tz_up'?: string;
    'tz_down'?: string;
    'shift_up'?: string;
    'shift_down'?: string;
    'shift_reset'?: string;
  };

  // Formato: chrono format specs
  // Replacements: Usa especificações de formato chrono
}
```

##### **Temperature Module**
```typescript
interface TemperatureModule extends InteractiveActions {
  'thermal-zone'?: number;
  hwmon-path?: string;
  'hwmon-path-abs'?: string;
  'input-filename'?: string;
  'critical-threshold'?: number; // Default: 80
  interval?: number; // Default: 10
  format?: string; // Default: "{temperatureC}°C"
  'format-critical'?: string;
  'format-icons'?: string[];
  rotate?: number;
  'max-length'?: number;
  tooltip?: boolean; // Default: true

  // Replacements: {temperatureC}, {temperatureF}, {temperatureK}, {icon}
}
```

##### **Disk Module**
```typescript
interface DiskModule extends InteractiveActions {
  path?: string; // Default: "/"
  interval?: number; // Default: 30
  format?: string; // Default: "{percentage_used}%"
  'format-alt'?: string;
  rotate?: number;
  states?: Record<string, number>;
  'max-length'?: number;
  tooltip?: boolean; // Default: true
  'tooltip-format'?: string;
  unit?: string; // Default: "GB"

  // Replacements: {percentage_used}, {percentage_free}, {used}, {free}, {total}, {path}
}
```

##### **Load Module**
```typescript
interface LoadModule extends InteractiveActions {
  interval?: number; // Default: 10
  format?: string; // Default: "{load1}"
  'max-length'?: number;
  rotate?: number;
  tooltip?: boolean; // Default: true

  // Replacements: {load1}, {load5}, {load15}
}
```

#### 3.2.2 Hardware e Controles

##### **Backlight Module**
```typescript
interface BacklightModule extends InteractiveActions {
  interval?: number; // Default: 2
  format?: string; // Default: "{percent}%"
  'format-icons'?: string[];
  'max-length'?: number;
  rotate?: number;
  states?: Record<string, number>;
  'scroll-step'?: number; // Default: 1.0
  'reverse-scrolling'?: boolean; // Default: false
  'reverse-mouse-scrolling'?: boolean; // Default: false
  tooltip?: boolean; // Default: true
  'tooltip-format'?: string;

  // Replacements: {percent}, {icon}
}
```

##### **PulseAudio Module**
```typescript
interface PulseAudioModule extends InteractiveActions {
  format?: string; // Default: "{volume}%"
  'format-bluetooth'?: string;
  'format-muted'?: string;
  'format-source'?: string; // Default: "{volume}%"
  'format-source-muted'?: string;
  'format-icons'?: Record<string, string[]>;

  'scroll-step'?: number; // Default: 1.0
  'max-volume'?: number; // Default: 100
  'max-length'?: number;
  rotate?: number;
  states?: Record<string, number>;

  tooltip?: boolean; // Default: true
  'tooltip-format'?: string; // Default: "{desc}"

  'ignored-sinks'?: string[];
  'reverse-scrolling'?: boolean; // Default: false
  'reverse-mouse-scrolling'?: boolean; // Default: false

  // Replacements: {volume}, {icon}, {format_source}, {desc}
}
```

##### **Bluetooth Module**
```typescript
interface BluetoothModule extends InteractiveActions {
  controller?: string;
  format?: string; // Default: "{status}"
  'format-disabled'?: string;
  'format-off'?: string;
  'format-on'?: string;
  'format-connected'?: string;
  'format-icons'?: Record<string, string>;
  tooltip?: boolean; // Default: true
  'tooltip-format'?: string;
  'tooltip-format-connected'?: string;
  'tooltip-format-enumerate-connected'?: string;
  'max-length'?: number;
  rotate?: number;

  // Replacements: {status}, {num_connections}, {controller_address},
  // {controller_alias}, {device_address}, {device_alias}, {device_battery_percentage}
}
```

##### **Keyboard State Module**
```typescript
interface KeyboardStateModule extends InteractiveActions {
  'numlock'?: boolean; // Default: false
  'capslock'?: boolean; // Default: false
  'scrolllock'?: boolean; // Default: false
  format?: string | {
    numlock?: string;
    capslock?: string;
    scrolllock?: string;
  };
  'format-icons'?: {
    locked?: string;
    unlocked?: string;
  };
  interval?: number; // Default: 1
  'device-path'?: string;
  tooltip?: boolean; // Default: true
  'tooltip-format'?: string;

  // Replacements: {name}, {icon}
}
```

#### 3.2.3 Window Manager Específicos

##### **Hyprland Workspaces**
```typescript
interface HyprlandWorkspacesModule extends InteractiveActions {
  'active-only'?: boolean; // Default: false
  'hide-active'?: boolean; // Default: false
  'all-outputs'?: boolean; // Default: false
  format?: string; // Default: "{id}"
  'format-icons'?: Record<string, string>;
  'persistent-workspaces'?: Record<string, string[]>;
  'persistent-only'?: boolean; // Default: false
  'show-special'?: boolean; // Default: false
  'special-visible-only'?: boolean; // Default: false
  'sort-by'?: 'DEFAULT' | 'id' | 'name' | 'number' | 'special-centered';
  'move-to-monitor'?: boolean; // Default: false
  'ignore-workspaces'?: string[];

  // Window Taskbar
  'workspace-taskbar'?: {
    active?: boolean;
    format?: string;
    'icon-size'?: number;
    'separate-outputs'?: boolean;
  };

  // Window Rewrite
  'window-rewrite'?: Record<string, string>;
  'window-rewrite-default'?: string; // Default: "?"
  'format-window-separator'?: string; // Default: " "

  // Replacements: {id}, {name}, {icon}, {windows}
}
```

##### **Hyprland Window**
```typescript
interface HyprlandWindowModule extends InteractiveActions {
  format?: string; // Default: "{title}"
  'max-length'?: number;
  rewrite?: Record<string, string>;
  'separate-outputs'?: boolean; // Default: false
  icon?: boolean; // Default: false
  'icon-size'?: number; // Default: 24

  // Replacements: {class}, {initialClass}, {initialTitle}, {title}
}
```

##### **Hyprland Language**
```typescript
interface HyprlandLanguageModule extends InteractiveActions {
  format?: string; // Default: "{}"
  'format-en'?: string; // Exemplos de formato específico de idioma
  'format-pt'?: string;
  'keyboard-name'?: string;

  // Replacements: {short}, {shortDescription}, {long}, {variant}
}
```

##### **Hyprland Submap**
```typescript
interface HyprlandSubmapModule extends InteractiveActions {
  format?: string; // Default: "{}"
  'max-length'?: number;
  tooltip?: boolean; // Default: true
  'always-on'?: boolean; // Default: false
  'default-submap'?: string; // Default: "Default"

  // Replacements: {} (nome do submap ativo)
}
```

##### **Hyprland Window Count**
```typescript
interface HyprlandWindowCountModule extends InteractiveActions {
  format?: string; // Default: "{}"
  'format-empty'?: string;
  'format-windowed'?: string;
  'format-fullscreen'?: string;
  'separate-outputs'?: boolean; // Default: true

  // Replacements: {} (número de janelas)
}
```

##### **Sway Workspaces**
```typescript
interface SwayWorkspacesModule extends InteractiveActions {
  'all-outputs'?: boolean; // Default: false
  format?: string; // Default: "{name}"
  'format-icons'?: Record<string, string>;
  'persistent-workspaces'?: Record<string, string[]>;
  'disable-scroll'?: boolean; // Default: false
  'disable-click'?: boolean; // Default: false
  'smooth-scrolling-threshold'?: number;
  'enable-bar-scroll'?: boolean; // Default: false
  'disable-scroll-wraparound'?: boolean; // Default: false
  'numeric-first'?: boolean; // Default: false

  // Replacements: {name}, {icon}, {index}, {output}
}
```

##### **Sway Window**
```typescript
interface SwayWindowModule extends InteractiveActions {
  format?: string; // Default: "{title}"
  'max-length'?: number;
  rewrite?: Record<string, string>;
  icon?: boolean; // Default: false
  'icon-size'?: number; // Default: 13
  'all-outputs'?: boolean; // Default: false
  offscreen-css?: boolean; // Default: false
  'offscreen-css-text'?: string;

  // Replacements: {title}, {app_id}, {shell}
}
```

##### **Sway Mode**
```typescript
interface SwayModeModule extends InteractiveActions {
  format?: string; // Default: "{}"
  'max-length'?: number;
  rotate?: number;
  tooltip?: boolean; // Default: true

  // Replacements: {} (modo atual)
}
```

##### **Sway Language**
```typescript
interface SwayLanguageModule extends InteractiveActions {
  format?: string; // Default: "{}"
  'hide-single-lang'?: boolean; // Default: false
  'tooltip-format'?: string; // Default: "{long}"

  // Replacements: {short}, {shortDescription}, {long}, {variant}
}
```

##### **River Tags**
```typescript
interface RiverTagsModule extends InteractiveActions {
  'num-tags'?: number; // Default: 9
  'tag-labels'?: string[];
  'disable-click'?: boolean; // Default: false
  'disable-scroll'?: boolean; // Default: false
}
```

##### **Niri Workspaces**
```typescript
interface NiriWorkspacesModule extends InteractiveActions {
  format?: string; // Default: "{name}"
  'format-icons'?: Record<string, string>;
  'all-outputs'?: boolean; // Default: false
}
```

##### **DWL Tags**
```typescript
interface DWLTagsModule extends InteractiveActions {
  'num-tags'?: number; // Default: 9
  'tag-labels'?: string[];
  'disable-click'?: boolean; // Default: false
  'disable-scroll'?: boolean; // Default: false
}
```

#### 3.2.4 Mídia e Áudio

##### **MPD Module**
```typescript
interface MPDModule extends InteractiveActions {
  server?: string; // Default: "localhost"
  port?: number; // Default: 6600
  password?: string;
  interval?: number; // Default: 2

  format?: string; // Default: "{artist} - {title}"
  'format-disconnected'?: string; // Default: "Disconnected"
  'format-stopped'?: string; // Default: "Stopped"
  'format-paused'?: string;

  'unknown-tag'?: string; // Default: "N/A"
  'max-length'?: number;
  rotate?: number;

  'state-icons'?: {
    paused?: string;
    playing?: string;
  };
  'tooltip-format'?: string; // Default: "MPD (connected)"
  'tooltip-format-disconnected'?: string; // Default: "MPD (disconnected)"

  'artist-len'?: number; // Default: 20
  'album-len'?: number; // Default: 20
  'title-len'?: number; // Default: 20

  'repeat-icons'?: {
    on?: string;
    off?: string;
  };
  'random-icons'?: {
    on?: string;
    off?: string;
  };
  'single-icons'?: {
    on?: string;
    off?: string;
  };
  'consume-icons'?: {
    on?: string;
    off?: string;
  };

  // Replacements: {artist}, {album}, {title}, {date}, {volume}, {elapsedTime},
  // {totalTime}, {songPosition}, {queueLength}, {stateIcon}, {consumeIcon},
  // {randomIcon}, {repeatIcon}, {singleIcon}
}
```

##### **MPRIS Module**
```typescript
interface MPRISModule extends InteractiveActions {
  format?: string; // Default: "{player} ({status}): {title}"
  'format-paused'?: string;
  'format-stopped'?: string;

  'player-icons'?: Record<string, string>;
  'status-icons'?: {
    paused?: string;
    playing?: string;
    stopped?: string;
  };

  'ignored-players'?: string[];
  player?: string; // Player específico
  'max-length'?: number;
  rotate?: number;

  'tooltip-format'?: string;
  'artist-len'?: number; // Default: 20
  'album-len'?: number; // Default: 20
  'title-len'?: number; // Default: 20
  'dynamic-len'?: number;
  'dynamic-priority'?: ('title' | 'artist' | 'album')[];
  'dynamic-separator'?: string; // Default: " - "

  'enable-tooltip-len-limits'?: boolean; // Default: false
  'ellipsis'?: string; // Default: "..."
  'interval'?: number; // Default: 1

  // Replacements: {player}, {status}, {artist}, {album}, {title}, {length}, {position}
}
```

##### **Cava Module**
```typescript
interface CavaModule {
  cava_config?: string; // Path para config customizado
  framerate?: number; // Default: 30
  autosens?: 0 | 1; // Default: 1
  bars?: number; // Default: 12
  lower_cutoff_freq?: number; // Default: 50
  higher_cutoff_freq?: number; // Default: 10000
  method?: 'pulse' | 'alsa' | 'fifo' | 'shmem'; // Default: 'pulse'
  source?: string; // Default: "auto"
  stereo?: boolean; // Default: true
  reverse?: boolean; // Default: false
  bar_delimiter?: number; // Default: 0
  monstercat?: 0 | 1; // Default: 0
  waves?: 0 | 1; // Default: 0
  noise_reduction?: number; // Default: 0.77
  input_delay?: number; // Default: 2
  format-icons?: string[];
  actions?: {
    mode?: string;
  };
  hide_on_silence?: boolean; // Default: false
  sleep_timer?: number; // Default: 5
}
```

#### 3.2.5 Sistema e Utilitários

##### **Tray Module**
```typescript
interface TrayModule {
  'icon-size'?: number;
  'show-passive-items'?: boolean; // Default: false
  'smooth-scrolling-threshold'?: number;
  spacing?: number;
  'reverse-direction'?: boolean; // Default: false
  icons?: Record<string, string>; // Mapeamento app_name -> icon_path
}
```

##### **Idle Inhibitor Module**
```typescript
interface IdleInhibitorModule extends InteractiveActions {
  format?: string; // Default: "{icon}"
  'format-icons'?: {
    activated?: string;
    deactivated?: string;
  };
  timeout?: number; // Default: 30
  tooltip?: boolean; // Default: true
  'tooltip-format-activated'?: string;
  'tooltip-format-deactivated'?: string;

  // Replacements: {icon}, {status}
}
```

##### **User Module**
```typescript
interface UserModule extends InteractiveActions {
  format?: string; // Default: "{user}"
  interval?: number; // Default: 60
  icon?: boolean; // Default: true
  'max-length'?: number;
  height?: number;
  width?: number;
  'avatar'?: string; // Path para avatar customizado

  // Replacements: {user}, {host}, {work_H}, {work_M}, {work_S}, {total_H}, {total_M}, {total_S}
}
```

##### **UPower Module**
```typescript
interface UPowerModule extends InteractiveActions {
  'native-path'?: string;
  icon-size?: number; // Default: 20
  'hide-if-empty'?: boolean; // Default: true
  tooltip?: boolean; // Default: true
  'tooltip-spacing'?: number; // Default: 4
  'tooltip-padding'?: number; // Default: 4
  format?: string;
  'format-alt'?: string;
}
```

##### **Gamemode Module**
```typescript
interface GamemodeModule extends InteractiveActions {
  format?: string; // Default: "{glyph}"
  glyph?: string; // Default: ""
  'hide-not-running'?: boolean; // Default: true
  'use-icon'?: boolean; // Default: true
  'icon-name'?: string; // Default: "input-gaming-symbolic"
  'icon-size'?: number; // Default: 20
  'icon-spacing'?: number; // Default: 4
  tooltip?: boolean; // Default: true
  'tooltip-format'?: string; // Default: "Games running: {count}"
}
```

##### **Privacy Module**
```typescript
interface PrivacyModule extends InteractiveActions {
  'icon-spacing'?: number; // Default: 4
  'icon-size'?: number; // Default: 20
  'transition-duration'?: number; // Default: 250
  tooltip?: boolean; // Default: true
  'tooltip-icon-size'?: number; // Default: 24

  modules?: {
    type?: 'screenshare' | 'audio-in' | 'audio-out';
    tooltip?: boolean;
    'tooltip-icon-size'?: number;
  }[];
}
```

##### **Power Profiles Daemon Module**
```typescript
interface PowerProfilesModule extends InteractiveActions {
  format?: string; // Default: "{icon}"
  'format-icons'?: {
    default?: string;
    'performance'?: string;
    'balanced'?: string;
    'power-saver'?: string;
  };
  tooltip?: boolean; // Default: true
  'tooltip-format'?: string; // Default: "Power profile: {profile}\nDriver: {driver}"

  // Replacements: {icon}, {profile}
}
```

##### **Systemd Failed Units Module**
```typescript
interface SystemdFailedUnitsModule extends InteractiveActions {
  format?: string; // Default: "{nr_failed} failed"
  'format-ok'?: string; // Default: ""
  'hide-on-ok'?: boolean; // Default: true
  user?: boolean; // Default: true
  system?: boolean; // Default: true

  // Replacements: {nr_failed}, {nr_failed_system}, {nr_failed_user}
}
```

##### **Image Module**
```typescript
interface ImageModule extends InteractiveActions {
  path?: string; // Path para imagem
  size?: number; // Default: 16
  interval?: number; // Default: 0 (sem polling)
  exec?: string; // Comando que retorna path da imagem
  signal?: number; // Signal number para atualização manual
}
```

##### **Group Module**
```typescript
interface GroupModule {
  orientation?: 'horizontal' | 'vertical' | 'inherit' | 'orthogonal'; // Default: orthogonal
  modules?: string[];
  drawer?: {
    'transition-duration'?: number; // Default: 500
    'transition-left-to-right'?: boolean; // Default: true
    'children-class'?: string; // Default: "drawer-child"
    'click-to-reveal'?: boolean; // Default: false
  };
}
```

##### **Custom Module**
```typescript
interface CustomModule extends InteractiveActions {
  exec?: string; // Script para output
  'exec-if'?: string; // Script condicional
  'exec-on-event'?: boolean; // Default: true
  interval?: number | 'once'; // Default: once
  'restart-interval'?: number; // Incompatível com interval
  signal?: number; // 1-N para SIGRTMIN+N

  format?: string;
  'format-icons'?: string[] | Record<string, string> | string;
  'return-type'?: 'json' | ''; // Default: ''

  tooltip?: boolean; // Default: true
  'tooltip-format'?: string;

  rotate?: number;
  'max-length'?: number;
  escape?: boolean; // Default: false
  'hide-empty-text'?: boolean;

  // JSON return format
  // { "text": "...", "alt": "...", "tooltip": "...", "class": "...", "percentage": 0-100 }
}
```

### 3.3 Parâmetros CSS Completos

#### 3.3.1 Seletores Principais

```css
/* Window Principal */
window#waybar { }
window#waybar.hidden { }
window#waybar.<custom-name> { }
window#waybar.top { }
window#waybar.bottom { }
window#waybar.left { }
window#waybar.right { }

/* Por Output */
window.eDP-1 { }
window.HDMI-A-1 { }

/* Grupos de Módulos */
.modules-left { }
.modules-center { }
.modules-right { }

/* Módulos Genéricos */
.module { }
label.module { }
box.module { }
```

#### 3.3.2 Seletores por Módulo

```css
/* Sistema */
#battery { }
#battery.charging { }
#battery.plugged { }
#battery.full { }
#battery.discharging { }
#battery.warning { }
#battery.critical { }
#battery.<custom-state> { }

#cpu { }
#cpu.<custom-state> { }

#memory { }
#memory.<custom-state> { }

#disk { }
#disk.<custom-state> { }

#temperature { }
#temperature.critical { }

#network { }
#network.disabled { }
#network.disconnected { }
#network.linked { }
#network.ethernet { }
#network.wifi { }

/* Hardware */
#backlight { }
#backlight.<custom-state> { }

#pulseaudio { }
#pulseaudio.muted { }
#pulseaudio.bluetooth { }
#pulseaudio.source-muted { }

#bluetooth { }
#bluetooth.disabled { }
#bluetooth.off { }
#bluetooth.on { }
#bluetooth.connected { }

#keyboard-state { }
#keyboard-state > label { }
#keyboard-state > label.locked { }

/* Window Managers */
#workspaces { }
#workspaces button { }
#workspaces button.active { }
#workspaces button.urgent { }
#workspaces button.persistent { }
#workspaces button.hidden { }
#workspaces button.empty { }
#workspaces button:hover { }

#window { }
#window.empty { }

#mode { }
#submap { }

/* Hyprland Específico */
#workspaces button.special { }
#workspaces button.visible { }

/* Mídia */
#mpd { }
#mpd.disconnected { }
#mpd.stopped { }
#mpd.playing { }
#mpd.paused { }

#mpris { }

#cava { }

/* Utilidades */
#tray { }
#tray > .passive { }
#tray > .active { }
#tray > .needs-attention { }
#tray menu { }

#clock { }
#idle_inhibitor { }
#idle_inhibitor.activated { }
#idle_inhibitor.deactivated { }

#language { }
#user { }
#gamemode { }
#privacy { }
#privacy-item { }
#power-profiles-daemon { }
#systemd-failed-units { }

/* Custom Modules */
#custom-<name> { }
#custom-<name>.<class> { }

/* Group Module */
#group-<name> { }
.drawer-child { } /* ou custom children-class */
```

#### 3.3.3 Propriedades CSS Principais

```css
/* Cores e Backgrounds */
color: #ffffff;
background-color: rgba(0, 0, 0, 0.8);
background: linear-gradient(90deg, #color1, #color2);
background: @theme_base_color; /* GTK theme variable */
border-color: #333333;
opacity: 0.95;

/* Bordas e Sombras */
border: 2px solid #color;
border-radius: 10px;
border-top: 1px solid #color;
border-bottom: none;
box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
text-shadow: 1px 1px 2px black;

/* Espaçamento */
margin: 5px 10px;
margin-top: 5px;
margin-right: 10px;
margin-bottom: 5px;
margin-left: 10px;
padding: 5px 10px;
padding-top: 5px;
padding-right: 10px;
padding-bottom: 5px;
padding-left: 10px;

/* Tipografia */
font-family: "JetBrains Mono", monospace;
font-size: 14px;
font-weight: bold;
font-style: italic;
text-decoration: underline;

/* Dimensões */
min-width: 40px;
min-height: 30px;
max-width: 300px;
max-height: 50px;

/* Animações e Transições */
transition: all 0.3s ease;
transition-property: background-color, color;
transition-duration: 300ms;
transition-timing-function: ease-in-out;
animation: blink 1s infinite;

/* Otimização de Performance */
animation-timing-function: steps(12); /* Melhor que linear */

/* GTK Theme Modifiers */
background: shade(@theme_base_color, 0.9);
color: mix(@theme_text_color, @theme_base_color, 0.8);
border-color: alpha(@theme_fg_color, 0.5);
```

#### 3.3.4 Pseudo-classes e Estados

```css
/* Estados de Hover */
#workspaces button:hover { }
#module:hover { }

/* Estados de Focus */
#workspaces button:focus { }

/* Nth-child Selectors */
#workspaces button:first-child { }
#workspaces button:last-child { }
#workspaces button:nth-child(2) { }

/* Estados Personalizados */
#battery.warning:not(.charging) { }
#network.ethernet:hover { }
```

---

## 4. ESTRUTURA DE DADOS DA APLICAÇÃO

### 4.1 Schema de Configuração

```typescript
// schema/waybar-config.schema.ts
export interface WaybarConfig {
  // Múltiplas barras suportadas
  bars: BarDefinition[];
  // Configurações globais
  global?: GlobalSettings;
  // CSS compartilhado
  styles: StyleDefinition[];
}

export interface BarDefinition {
  id: string;
  name?: string;
  config: BarConfig;
  modules: ModuleInstance[];
  enabled: boolean;
  order: number;
}

export interface ModuleInstance {
  id: string; // UUID único
  type: ModuleType;
  customName?: string; // Para módulos duplicados (#battery#bat2)
  position: 'left' | 'center' | 'right';
  order: number;
  config: ModuleConfig;
  enabled: boolean;
}

export interface StyleDefinition {
  id: string;
  name: string;
  selector: string;
  properties: CSSProperty[];
  enabled: boolean;
}

export interface CSSProperty {
  property: string;
  value: string;
  important: boolean;
}
```

### 4.2 Tipos de Módulos

```typescript
export type ModuleType =
  // Sistema
  | 'battery' | 'cpu' | 'memory' | 'disk' | 'temperature' | 'network'
  | 'load' | 'upower'
  // Hardware
  | 'backlight' | 'pulseaudio' | 'bluetooth' | 'keyboard-state'
  // Window Manager
  | 'workspaces' | 'taskbar' | 'window' | 'mode' | 'language'
  | 'hyprland/workspaces' | 'hyprland/window' | 'hyprland/language'
  | 'hyprland/submap' | 'hyprland/windowcount'
  | 'sway/workspaces' | 'sway/window' | 'sway/mode' | 'sway/language'
  | 'river/tags' | 'dwl/tags' | 'niri/workspaces'
  // Mídia
  | 'mpd' | 'mpris' | 'cava'
  // Utilitários
  | 'clock' | 'tray' | 'idle_inhibitor' | 'user' | 'gamemode'
  | 'privacy' | 'power-profiles-daemon' | 'systemd-failed-units'
  | 'image' | 'group' | 'custom';

export interface ModuleMetadata {
  type: ModuleType;
  displayName: string;
  description: string;
  category: 'system' | 'hardware' | 'wm' | 'media' | 'utility';
  icon: string;
  requiresWM?: string[]; // ['hyprland', 'sway', etc.]
  schema: ModuleConfigSchema;
}
```

### 4.3 Validação e Schema

```typescript
// Usando Zod para validação
import { z } from 'zod';

export const InteractiveActionsSchema = z.object({
  'on-click': z.string().optional(),
  'on-click-middle': z.string().optional(),
  'on-click-right': z.string().optional(),
  'on-scroll-up': z.string().optional(),
  'on-scroll-down': z.string().optional(),
  // ... todas as outras ações
});

export const BatteryModuleSchema = InteractiveActionsSchema.extend({
  bat: z.string().optional(),
  adapter: z.string().optional(),
  interval: z.number().min(1).optional(),
  format: z.string().optional(),
  // ... todos os parâmetros
});

// Factory de schemas para todos os módulos
export const ModuleSchemas: Record<ModuleType, z.ZodSchema> = {
  battery: BatteryModuleSchema,
  cpu: CPUModuleSchema,
  // ... etc
};
```

---

## 5. DESIGN DA INTERFACE DO USUÁRIO

### 5.1 Layout Principal

```
┌────────────────────────────────────────────────────────────────┐
│  Menu Bar: File | Edit | View | Tools | Help                   │
├────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────┐  ┌─────────────────────────────────────────┐│
│  │              │  │                                           ││
│  │  Sidebar     │  │         Main Editor Area                 ││
│  │              │  │                                           ││
│  │  - Bars      │  │  ┌────────────────────────────────────┐ ││
│  │  - Modules   │  │  │  Bar Configuration Tab             │ ││
│  │  - Styles    │  │  │  [ General | Modules | Styling ]   │ ││
│  │  - Templates │  │  ├────────────────────────────────────┤ ││
│  │  - Settings  │  │  │                                    │ ││
│  │              │  │  │  Configuration Forms               │ ││
│  │              │  │  │                                    │ ││
│  │              │  │  │                                    │ ││
│  │              │  │  └────────────────────────────────────┘ ││
│  │              │  │                                           ││
│  └──────────────┘  │  ┌────────────────────────────────────┐ ││
│                    │  │  Live Preview                       │ ││
│                    │  │  [Waybar Preview Here]              │ ││
│                    │  └────────────────────────────────────┘ ││
│                    └─────────────────────────────────────────┘│
│                                                                  │
├────────────────────────────────────────────────────────────────┤
│  Status Bar: Ready | Waybar: Running | Last Save: 2 min ago    │
└────────────────────────────────────────────────────────────────┘
```

### 5.2 Componentes Principais

#### 5.2.1 Sidebar
- **Bars List**: Lista de barras configuradas com ações (add, edit, delete, duplicate, enable/disable)
- **Module Library**: Biblioteca drag-and-drop de módulos disponíveis, filtráveis por categoria
- **Styles Library**: Estilos salvos e templates CSS
- **Templates**: Templates pré-configurados (Minimal, Gaming, Professional, etc.)

#### 5.2.2 Main Editor
- **Tabs**: Múltiplas barras abertas simultaneamente
- **Configuration Panels**:
  - **General**: Configurações da barra (posição, tamanho, comportamento)
  - **Modules**: Editor visual de módulos com drag-and-drop
  - **Styling**: Editor CSS visual + editor de código

#### 5.2.3 Module Editor
```
┌──────────────────────────────────────────────────────┐
│  Module: Battery (#battery)                      [x] │
├──────────────────────────────────────────────────────┤
│  ┌─ Basic Settings ────────────────────────────────┐ │
│  │  Device: [auto-detect ▼]                       │ │
│  │  Adapter: [auto-detect ▼]                      │ │
│  │  Update Interval: [60] seconds                 │ │
│  └────────────────────────────────────────────────┘ │
│                                                      │
│  ┌─ Display ────────────────────────────────────────┐│
│  │  Format: [{capacity}% {icon}]                   ││
│  │  Format Builder: [Icon Picker] [Variable List] ││
│  │                                                  ││
│  │  Icons by State:                                ││
│  │    Full:       []                             ││
│  │    Charging:   []                             ││
│  │    Warning:    []                             ││
│  │    Critical:   []                             ││
│  └──────────────────────────────────────────────────┘│
│                                                      │
│  ┌─ States ─────────────────────────────────────────┐│
│  │  [+] Add State                                   ││
│  │    warning: [30] %                               ││
│  │    critical: [15] %                              ││
│  └──────────────────────────────────────────────────┘│
│                                                      │
│  ┌─ Interactive Actions ────────────────────────────┐│
│  │  On Click: [                                  ] ││
│  │  On Right Click: [                            ] ││
│  │  On Scroll Up: [                              ] ││
│  │  On Scroll Down: [                            ] ││
│  └──────────────────────────────────────────────────┘│
│                                                      │
│  ┌─ Advanced ───────────────────────────────────────┐│
│  │  [ ] Design Capacity                             ││
│  │  [ ] Weighted Average (multi-battery)            ││
│  │  Max Length: [    ] (0 = unlimited)              ││
│  │  Rotation: [0] degrees                           ││
│  └──────────────────────────────────────────────────┘│
│                                                      │
│  [Cancel]  [Apply]  [OK]                             │
└──────────────────────────────────────────────────────┘
```

#### 5.2.4 Visual CSS Editor
```
┌──────────────────────────────────────────────────────┐
│  Selector: #battery                               [x] │
├──────────────────────────────────────────────────────┤
│  [Visual] [Code] [Preview]                           │
│                                                       │
│  ┌─ Colors ─────────────────────────────────────────┐│
│  │  Background: [#282828] [Color Picker]           ││
│  │  Text Color: [#ebdbb2] [Color Picker]           ││
│  │  Border Color: [#504945] [Color Picker]          ││
│  └──────────────────────────────────────────────────┘│
│                                                       │
│  ┌─ Spacing ────────────────────────────────────────┐│
│  │  Padding:  Top[5] Right[10] Bottom[5] Left[10]  ││
│  │  Margin:   Top[0] Right[5] Bottom[0] Left[5]    ││
│  └──────────────────────────────────────────────────┘│
│                                                       │
│  ┌─ Border ─────────────────────────────────────────┐│
│  │  Width: [2]px  Style: [solid ▼]                 ││
│  │  Radius: [8]px                                   ││
│  └──────────────────────────────────────────────────┘│
│                                                       │
│  ┌─ Typography ─────────────────────────────────────┐│
│  │  Font Family: [JetBrains Mono ▼]                ││
│  │  Font Size: [14]px                               ││
│  │  Font Weight: [normal ▼]                         ││
│  └──────────────────────────────────────────────────┘│
│                                                       │
│  [Cancel]  [Apply]  [OK]                             │
└──────────────────────────────────────────────────────┘
```

### 5.3 Features de UX

#### 5.3.1 Drag and Drop
- Arrastar módulos da biblioteca para as zonas (left/center/right)
- Reordenar módulos por drag
- Drag entre barras diferentes

#### 5.3.2 Live Preview
- Preview em tempo real das mudanças
- Opção de preview em janela separada
- Simulação de estados (battery charging, network connected, etc.)

#### 5.3.3 Format Builder
- Assistente visual para construir format strings
- Lista de variáveis disponíveis por módulo
- Preview do resultado
- Suporte a Pango markup

#### 5.3.4 Icon Picker
- Browser de ícones do sistema
- Suporte a Font Awesome, Material Icons, etc.
- Preview de ícones
- Busca por nome/categoria

#### 5.3.5 Color Picker Avançado
- Seletor de cores RGB/RGBA
- Paletas predefinidas
- Integração com tema GTK
- Gradientes visuais

---

## 6. FUNCIONALIDADES PRINCIPAIS

### 6.1 Core Features

#### 6.1.1 Gerenciamento de Configuração
- Criar/editar/deletar barras
- Duplicar barras existentes
- Habilitar/desabilitar barras
- Importar/exportar configurações
- Backup automático
- Histórico de mudanças (undo/redo)

#### 6.1.2 Editor de Módulos
- Adicionar/remover módulos
- Configurar todos os parâmetros via UI
- Validação em tempo real
- Sugestões contextuais
- Documentação inline

#### 6.1.3 Editor de Estilos
- Editor CSS visual
- Editor de código com syntax highlighting
- Auto-complete CSS
- Validação de sintaxe
- Suporte a variáveis GTK

#### 6.1.4 Preview Sistema
- Preview em tempo real
- Múltiplos modos de preview
- Simulação de estados
- Screenshot/export

#### 6.1.5 Templates
- Templates predefinidos:
  - Minimal
  - Full-featured
  - Gaming (low latency)
  - Professional
  - Transparent/Blur
  - Top + Bottom bars
- Criar templates customizados
- Compartilhar templates (export/import)

### 6.2 Advanced Features

#### 6.2.1 Multi-Bar Management
- Configurar múltiplas barras simultâneas
- Barras por output específico
- Sincronização de estilos entre barras

#### 6.2.2 Theme Integration
- Detectar tema GTK atual
- Gerar paleta de cores do tema
- Aplicar automaticamente cores do tema

#### 6.2.3 System Detection
- Detectar compositor (Hyprland/Sway/River/etc.)
- Mostrar apenas módulos compatíveis
- Auto-configurar módulos específicos do WM

#### 6.2.4 Validation & Testing
- Validar sintaxe JSON
- Validar parâmetros de módulos
- Testar comandos interativos
- Verificar dependências (scripts, programas)

#### 6.2.5 Custom Scripts
- Editor integrado para módulos custom
- Teste de scripts
- Debugging de output
- Templates de scripts comuns

### 6.3 Integration Features

#### 6.3.1 File System
- Detectar config existente
- Backup antes de modificar
- Restaurar de backup
- Monitorar mudanças externas

#### 6.3.2 Waybar Control
- Iniciar/parar Waybar
- Reload configuração
- Ver logs do Waybar
- Debug mode

#### 6.3.3 Export/Import
- Exportar configuração completa (tar.gz)
- Importar de arquivo
- Compartilhar online (opcional)
- Importar de URL

---

## 7. ESTRUTURA DE ARQUIVOS DO PROJETO

### 7.1 Estrutura Tauri + React

```
waybar-config/
├── src-tauri/                    # Backend Rust
│   ├── src/
│   │   ├── main.rs              # Entry point
│   │   ├── config/              # Config management
│   │   │   ├── mod.rs
│   │   │   ├── parser.rs        # JSON parser
│   │   │   ├── validator.rs     # Config validation
│   │   │   └── writer.rs        # Write configs
│   │   ├── css/                 # CSS management
│   │   │   ├── mod.rs
│   │   │   ├── parser.rs
│   │   │   └── generator.rs
│   │   ├── waybar/              # Waybar control
│   │   │   ├── mod.rs
│   │   │   ├── process.rs       # Start/stop/reload
│   │   │   └── ipc.rs          # Waybar IPC
│   │   ├── system/              # System detection
│   │   │   ├── mod.rs
│   │   │   ├── compositor.rs    # Detect WM
│   │   │   └── theme.rs        # GTK theme detection
│   │   └── commands.rs          # Tauri commands
│   ├── Cargo.toml
│   └── tauri.conf.json
│
├── src/                          # Frontend React
│   ├── App.tsx
│   ├── main.tsx
│   ├── components/
│   │   ├── layout/
│   │   │   ├── MainLayout.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   ├── EditorPanel.tsx
│   │   │   └── PreviewPanel.tsx
│   │   ├── bars/
│   │   │   ├── BarList.tsx
│   │   │   ├── BarEditor.tsx
│   │   │   └── BarSettings.tsx
│   │   ├── modules/
│   │   │   ├── ModuleLibrary.tsx
│   │   │   ├── ModuleEditor.tsx
│   │   │   ├── ModuleCard.tsx
│   │   │   └── modules/         # Editores específicos
│   │   │       ├── BatteryEditor.tsx
│   │   │       ├── CPUEditor.tsx
│   │   │       ├── ClockEditor.tsx
│   │   │       └── ...
│   │   ├── styles/
│   │   │   ├── StyleEditor.tsx
│   │   │   ├── VisualEditor.tsx
│   │   │   ├── CodeEditor.tsx
│   │   │   └── CSSProperty.tsx
│   │   ├── preview/
│   │   │   ├── LivePreview.tsx
│   │   │   └── SimulatorControls.tsx
│   │   ├── templates/
│   │   │   ├── TemplateGallery.tsx
│   │   │   └── TemplateCard.tsx
│   │   ├── common/
│   │   │   ├── ColorPicker.tsx
│   │   │   ├── IconPicker.tsx
│   │   │   ├── FormatBuilder.tsx
│   │   │   ├── CommandInput.tsx
│   │   │   └── ValidationMessage.tsx
│   │   └── dialogs/
│   │       ├── ImportDialog.tsx
│   │       ├── ExportDialog.tsx
│   │       └── SettingsDialog.tsx
│   │
│   ├── lib/
│   │   ├── schemas/             # Zod schemas
│   │   │   ├── modules.ts
│   │   │   ├── bar-config.ts
│   │   │   └── css.ts
│   │   ├── types/               # TypeScript types
│   │   │   ├── config.ts
│   │   │   ├── modules.ts
│   │   │   └── css.ts
│   │   ├── constants/
│   │   │   ├── module-metadata.ts
│   │   │   ├── css-properties.ts
│   │   │   └── templates.ts
│   │   ├── utils/
│   │   │   ├── validation.ts
│   │   │   ├── formatting.ts
│   │   │   └── export.ts
│   │   └── hooks/
│   │       ├── useConfig.ts
│   │       ├── useModules.ts
│   │       ├── useStyles.ts
│   │       └── useWaybar.ts
│   │
│   ├── store/                   # State management
│   │   ├── index.ts
│   │   ├── config-store.ts
│   │   ├── ui-store.ts
│   │   └── preview-store.ts
│   │
│   └── styles/
│       ├── globals.css
│       └── tailwind.css
│
├── public/
│   ├── icons/
│   └── templates/
│
├── package.json
├── tsconfig.json
├── tailwind.config.js
├── vite.config.ts
└── README.md
```

### 7.2 Estrutura de Estado (Zustand)

```typescript
// store/config-store.ts
interface ConfigStore {
  // State
  config: WaybarConfig;
  currentBarId: string | null;
  history: WaybarConfig[];
  historyIndex: number;

  // Actions
  loadConfig: () => Promise<void>;
  saveConfig: () => Promise<void>;

  // Bar management
  createBar: (bar: Partial<BarDefinition>) => void;
  updateBar: (id: string, updates: Partial<BarDefinition>) => void;
  deleteBar: (id: string) => void;
  duplicateBar: (id: string) => void;

  // Module management
  addModule: (barId: string, module: ModuleInstance) => void;
  updateModule: (barId: string, moduleId: string, updates: Partial<ModuleInstance>) => void;
  deleteModule: (barId: string, moduleId: string) => void;
  reorderModules: (barId: string, moduleIds: string[]) => void;

  // Style management
  addStyle: (style: StyleDefinition) => void;
  updateStyle: (id: string, updates: Partial<StyleDefinition>) => void;
  deleteStyle: (id: string) => void;

  // History
  undo: () => void;
  redo: () => void;

  // Import/Export
  importConfig: (data: string) => Promise<void>;
  exportConfig: () => Promise<string>;
}
```

---

## 8. FASES DE DESENVOLVIMENTO

### 8.1 Fase 1: Setup e Fundação (2 semanas)

**Objetivos:**
- Setup do projeto Tauri + React
- Estrutura básica de arquivos
- Sistema de build e desenvolvimento

**Tarefas:**
1. Inicializar projeto Tauri
2. Configurar React + TypeScript + TailwindCSS
3. Setup Zustand para state management
4. Configurar ESLint, Prettier
5. Criar estrutura de pastas
6. Setup CI/CD básico

**Entregáveis:**
- Projeto rodando com hot reload
- Layout básico da aplicação
- README com instruções de desenvolvimento

### 8.2 Fase 2: Backend Core (3 semanas)

**Objetivos:**
- Sistema de leitura/escrita de configs
- Parser JSON/CSS
- Validação de configuração

**Tarefas:**
1. Implementar file system access (Rust)
2. Parser de config.json da Waybar
3. Parser de style.css
4. Sistema de validação
5. Backup automático
6. Commands Tauri para frontend

**Entregáveis:**
- API Rust completa para manipular configs
- Testes unitários do backend
- Documentação da API

### 8.3 Fase 3: Schema e Validação (2 semanas)

**Objetivos:**
- Definir todos os schemas TypeScript
- Implementar validação com Zod
- Metadados de módulos

**Tarefas:**
1. Criar interfaces TypeScript completas
2. Schemas Zod para todos os módulos
3. Metadados de módulos (categorias, descrições, etc.)
4. Sistema de validação no frontend
5. Mensagens de erro contextuais

**Entregáveis:**
- Schema completo da configuração
- Validação funcionando
- Type safety completo

### 8.4 Fase 4: UI Core (4 semanas)

**Objetivos:**
- Layout principal da aplicação
- Componentes base reutilizáveis
- Sistema de navegação

**Tarefas:**
1. Implementar MainLayout com Sidebar
2. Criar componentes base (Button, Input, Select, etc.)
3. Implementar BarList e gerenciamento básico
4. Sistema de tabs para múltiplas barras
5. Implementar theme system (light/dark)

**Entregáveis:**
- Interface navegável
- CRUD básico de barras
- Componentes documentados no Storybook

### 8.5 Fase 5: Editores de Módulos (5 semanas)

**Objetivos:**
- Module Library
- Editores específicos para cada módulo
- Drag and drop

**Tarefas:**
1. Criar Module Library com categorização
2. Implementar drag and drop (dnd-kit)
3. Editor genérico de módulo (form dinâmico)
4. Editores customizados para módulos principais:
   - Battery, CPU, Memory, Network
   - Clock, Workspaces, Custom
5. Format Builder helper
6. Validação em tempo real

**Entregáveis:**
- Todos os módulos editáveis
- Drag and drop funcionando
- Documentação inline nos editores

### 8.6 Fase 6: Editor CSS (3 semanas)

**Objetivos:**
- Editor visual de CSS
- Editor de código
- Preview de estilos

**Tarefas:**
1. Editor visual com controles para:
   - Cores e backgrounds
   - Espaçamento (margin/padding)
   - Bordas e cantos
   - Tipografia
2. Integrar Monaco Editor para CSS
3. Auto-complete CSS
4. Color picker avançado
5. CSS validator

**Entregáveis:**
- Editor CSS completo (visual + código)
- Validação de sintaxe
- Suporte a variáveis GTK

### 8.7 Fase 7: Preview System (3 semanas)

**Objetivos:**
- Live preview da Waybar
- Simulação de estados
- Preview em tempo real

**Tarefas:**
1. Renderizar preview da Waybar
2. Sistema de simulação de estados
3. Preview em janela separada (opcional)
4. Sincronização em tempo real
5. Screenshot/export do preview

**Entregáveis:**
- Preview funcionando
- Simulador de estados
- Performance otimizada

### 8.8 Fase 8: Templates e Presets (2 semanas)

**Objetivos:**
- Sistema de templates
- Templates predefinidos
- Import/export

**Tarefas:**
1. Criar 5-10 templates base
2. Template gallery UI
3. Aplicar template a barra
4. Export/import de templates
5. Compartilhamento de templates (opcional)

**Entregáveis:**
- Template system completo
- Galeria de templates
- Documentação de cada template

### 8.9 Fase 9: Integração com Sistema (2 semanas)

**Objetivos:**
- Controle do processo Waybar
- Detecção de sistema
- Integração com compositor

**Tarefas:**
1. Detectar compositor (Hyprland/Sway/etc.)
2. Detectar tema GTK
3. Start/stop/reload Waybar
4. Monitor de logs do Waybar
5. Validar dependências

**Entregáveis:**
- Integração completa com Waybar
- Sistema de detecção funcionando
- Reload automático

### 8.10 Fase 10: Features Avançadas (3 semanas)

**Objetivos:**
- Histórico de mudanças (undo/redo)
- Busca e filtros
- Atalhos de teclado
- Acessibilidade

**Tarefas:**
1. Sistema de undo/redo
2. Busca global na configuração
3. Atalhos de teclado
4. Melhorias de acessibilidade (ARIA)
5. Tooltips e documentação contextual

**Entregáveis:**
- Undo/redo funcionando
- Busca eficiente
- Atalhos documentados

### 8.11 Fase 11: Testing e QA (2 semanas)

**Objetivos:**
- Testes completos
- Bug fixing
- Performance optimization

**Tarefas:**
1. Testes unitários (backend Rust)
2. Testes de componentes (React Testing Library)
3. Testes E2E (Playwright)
4. Profile de performance
5. Otimizações

**Entregáveis:**
- Coverage > 80%
- Suite de testes completa
- Performance otimizada

### 8.12 Fase 12: Documentação e Release (1 semana)

**Objetivos:**
- Documentação completa
- Primeira release

**Tarefas:**
1. Documentação de usuário
2. Guias e tutoriais
3. Changelog
4. Release notes
5. Build para distribuição

**Entregáveis:**
- Aplicação pronta para release
- Documentação completa
- Instaladores para Linux

**TOTAL: ~30 semanas (7-8 meses)**

---

## 9. CONSIDERAÇÕES TÉCNICAS

### 9.1 Performance

**Otimizações:**
- Virtualização de listas longas (react-window)
- Debounce em live preview
- Lazy loading de editores de módulos
- Memoização de componentes pesados
- Web Workers para parsing pesado

**Métricas alvo:**
- Startup < 2s
- Preview update < 100ms
- UI response < 50ms

### 9.2 Segurança

**Considerações:**
- Validar todos os comandos shell antes de executar
- Sandbox para preview de scripts custom
- Validação de paths de arquivo
- Sanitização de input do usuário

### 9.3 Compatibilidade

**Suporte:**
- Linux (primário): Arch, Ubuntu, Fedora, Debian
- Wayland compositors: Hyprland, Sway, River, DWL, Niri
- Desktop Environments: GNOME, KDE, etc.

**Dependências:**
- Waybar (obviamente)
- GTK 3/4 (para theme detection)
- Compositor Wayland

### 9.4 Acessibilidade

**WCAG 2.1 AA compliance:**
- Navegação por teclado completa
- Screen reader support (ARIA labels)
- Contraste adequado de cores
- Foco visual claro
- Texto escalável

### 9.5 Localização

**i18n support:**
- Interface em múltiplos idiomas (PT-BR, EN, ES, etc.)
- Documentação multilíngue
- Formatos de data/hora localizados

---

## 10. DEPENDÊNCIAS PRINCIPAIS

### 10.1 Backend (Rust/Tauri)

```toml
[dependencies]
tauri = "2.x"
serde = { version = "1.0", features = ["derive"] }
serde_json = "1.0"
tokio = { version = "1", features = ["full"] }
anyhow = "1.0"
thiserror = "1.0"
regex = "1.5"
```

### 10.2 Frontend (React)

```json
{
  "dependencies": {
    "react": "^18.3.0",
    "react-dom": "^18.3.0",
    "@tauri-apps/api": "^2.0.0",
    "zustand": "^4.5.0",
    "zod": "^3.22.0",
    "@monaco-editor/react": "^4.6.0",
    "@dnd-kit/core": "^6.1.0",
    "@dnd-kit/sortable": "^8.0.0",
    "react-colorful": "^5.6.1",
    "clsx": "^2.1.0",
    "tailwind-merge": "^2.2.0",
    "lucide-react": "^0.344.0"
  },
  "devDependencies": {
    "@types/react": "^18.3.0",
    "@types/react-dom": "^18.3.0",
    "typescript": "^5.4.0",
    "vite": "^5.1.0",
    "@vitejs/plugin-react": "^4.2.0",
    "tailwindcss": "^3.4.0",
    "eslint": "^8.57.0",
    "prettier": "^3.2.0"
  }
}
```

---

## 11. ROADMAP PÓS-LANÇAMENTO

### 11.1 Versão 1.1
- Sistema de plugins
- API para extensões
- Marketplace de templates

### 11.2 Versão 1.2
- Suporte a múltiplos monitores avançado
- Profiles (trabalho, gaming, etc.)
- Sincronização na nuvem (opcional)

### 11.3 Versão 2.0
- Editor visual WYSIWYG completo
- Animações customizadas
- Suporte a X11/Xorg (se viável)

---

## 12. CONCLUSÃO

Este plano detalhado fornece uma roadmap completa para o desenvolvimento de uma aplicação GUI profissional para configuração da Waybar. O projeto é ambicioso mas viável, com estimativa de 7-8 meses de desenvolvimento para a versão 1.0.

**Próximos passos imediatos:**
1. Decisão sobre stack tecnológico final (Tauri recomendado)
2. Setup do ambiente de desenvolvimento
3. Início da Fase 1 (Setup e Fundação)

**Recursos necessários:**
- 1-2 desenvolvedores full-time
- Designer UI/UX (consulta)
- Testadores beta

**Riscos e mitigações:**
- **Complexidade da Waybar**: Mitigado por documentação extensiva e validação rigorosa
- **Performance do preview**: Mitigado por otimizações e debouncing
- **Compatibilidade entre compositors**: Mitigado por sistema de detecção e módulos condicionais
