// ============================================================================
// TAURI APPLICATION ENTRY POINT
// ============================================================================

// Module declarations
pub mod error;
pub mod config;
pub mod commands;

// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_fs::init())
        .invoke_handler(tauri::generate_handler![
            greet,
            // Config commands
            commands::detect_config_paths,
            commands::load_config,
            commands::save_config,
            commands::load_css,
            commands::save_css,
            commands::list_backups,
            commands::restore_backup,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
