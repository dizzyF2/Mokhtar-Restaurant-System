use rusqlite::{Connection, Result};
use std::fs;
use std::path::PathBuf;
use tauri::path::BaseDirectory;
use tauri::Manager;

pub fn init_db(app: &tauri::AppHandle) -> Result<Connection> {
    let path: PathBuf = app
        .path()
        .resolve("mokhtar.db", BaseDirectory::AppData)
        .unwrap();

    if let Some(parent) = path.parent() {
        fs::create_dir_all(parent).unwrap();
    }

    let conn = Connection::open(path)?;

    conn.execute_batch(
        "
        -- Categories (for grouping sandwiches, drinks, etc.)
        CREATE TABLE IF NOT EXISTS categories (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL UNIQUE
        );

        -- Products (linked to a category, base product definition)
        CREATE TABLE IF NOT EXISTS products (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            category_id INTEGER,
            barcode TEXT UNIQUE,
            FOREIGN KEY(category_id) REFERENCES categories(id) ON DELETE SET NULL
        );

        -- Product sizes (optional pricing per size)
        CREATE TABLE IF NOT EXISTS product_sizes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            product_id INTEGER NOT NULL,
            size TEXT NOT NULL, -- e.g. small, medium, large
            price REAL NOT NULL,
            FOREIGN KEY(product_id) REFERENCES products(id) ON DELETE CASCADE
        );

        -- Employees (cashiers/admins)
        CREATE TABLE IF NOT EXISTS employees (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL UNIQUE,
            password TEXT NOT NULL
        );

        -- Clients (for delivery orders)
        CREATE TABLE IF NOT EXISTS clients (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            phone TEXT NOT NULL UNIQUE,
            phone2 TEXT,
            address TEXT
        );

        -- Sales (orders, either local or delivery)
        CREATE TABLE IF NOT EXISTS sales (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            employee_id INTEGER NOT NULL,
            client_id INTEGER,
            total REAL NOT NULL DEFAULT 0,
            order_type TEXT NOT NULL CHECK(order_type IN ('local', 'delivery')),
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(employee_id) REFERENCES employees(id) ON DELETE CASCADE,
            FOREIGN KEY(client_id) REFERENCES clients(id) ON DELETE SET NULL
        );

        -- Sale items (line items for each sale)
        CREATE TABLE IF NOT EXISTS sale_items (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            sale_id INTEGER NOT NULL,
            product_id INTEGER,
            size_id INTEGER,
            product_name TEXT NOT NULL,
            size TEXT,
            quantity INTEGER NOT NULL,
            price REAL NOT NULL,
            extra_amount REAL NOT NULL DEFAULT 0,
            FOREIGN KEY(sale_id) REFERENCES sales(id) ON DELETE CASCADE,
            FOREIGN KEY(product_id) REFERENCES products(id) ON DELETE SET NULL,
            FOREIGN KEY(size_id) REFERENCES product_sizes(id) ON DELETE SET NULL
        );
        ",
    )?;

    Ok(conn)
}
