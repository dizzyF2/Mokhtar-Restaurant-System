use rusqlite::{params, Connection, Result};
use chrono::Utc;

#[derive(Debug, serde::Serialize)]
pub struct Product {
    pub id: i32,
    pub category_id: i32,
    pub name: String,
    pub description: Option<String>,
    pub base_price: f64,
    pub barcode: Option<String>,
}

pub fn add_product(
    conn: &Connection,
    category_id: i32,
    name: &str,
    description: Option<&str>,
    base_price: f64,
    barcode: Option<&str>,
) -> Result<usize> {
    let barcode_val = if let Some(bc) = barcode {
        if !bc.trim().is_empty() {
            Some(bc.to_string())
        } else {
            Some(generate_barcode())
        }
    } else {
        Some(generate_barcode())
    };

    conn.execute(
        "INSERT INTO products (category_id, name, description, base_price, barcode) 
        VALUES (?1, ?2, ?3, ?4, ?5)",
        params![category_id, name, description, base_price, barcode_val],
    )
}

fn generate_barcode() -> String {
    let timestamp = Utc::now().timestamp_millis();
    format!("P{}", timestamp)
}

pub fn get_products(conn: &Connection) -> Result<Vec<Product>> {
    let mut stmt = conn.prepare(
        "SELECT id, category_id, name, description, base_price, barcode FROM products",
    )?;
    let rows = stmt.query_map([], |row| {
        Ok(Product {
            id: row.get(0)?,
            category_id: row.get(1)?,
            name: row.get(2)?,
            description: row.get(3)?,
            base_price: row.get(4)?,
            barcode: row.get(5)?,
        })
    })?;

    let mut products = Vec::new();
    for product in rows {
        products.push(product?);
    }
    Ok(products)
}

pub fn update_product(
    conn: &Connection,
    id: i32,
    category_id: i32,
    name: &str,
    description: Option<&str>,
    base_price: f64,
    barcode: Option<&str>,
) -> Result<usize> {
    conn.execute(
        "UPDATE products 
            SET category_id = ?1, name = ?2, description = ?3, base_price = ?4, barcode = ?5 
            WHERE id = ?6",
        params![category_id, name, description, base_price, barcode, id],
    )
}

pub fn delete_product(conn: &Connection, id: i32) -> Result<usize> {
    conn.execute("DELETE FROM products WHERE id = ?1", params![id])
}
