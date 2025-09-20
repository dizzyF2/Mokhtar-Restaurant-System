use rusqlite::{params, Connection, Result};
use chrono::Utc;
use crate::models::sizes::{fetch_product_sizes, ProductSize};

#[derive(Debug, serde::Serialize)]
pub struct Product {
    pub id: i32,
    pub category_id: i32,
    pub name: String,
    pub barcode: Option<String>,
}

#[derive(Debug, serde::Serialize)]
pub struct ProductWithSizes {
    pub id: i32,
    pub category_id: i32,
    pub name: String,
    pub barcode: Option<String>,
    pub sizes: Vec<ProductSize>,
}

pub fn add_product(
    conn: &Connection,
    category_id: i32,
    name: &str,
    barcode: Option<&str>,
) -> Result<i64> {
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
        "INSERT INTO products (category_id, name, barcode) 
        VALUES (?1, ?2, ?3)",
        params![category_id, name, barcode_val],
    )?;

    Ok(conn.last_insert_rowid())
}

fn generate_barcode() -> String {
    let timestamp = Utc::now().timestamp_millis();
    format!("P{}", timestamp)
}

pub fn get_products(conn: &Connection) -> Result<Vec<Product>> {
    let mut stmt = conn.prepare(
        "SELECT id, category_id, name, barcode FROM products",
    )?;
    let rows = stmt.query_map([], |row| {
        Ok(Product {
            id: row.get(0)?,
            category_id: row.get(1)?,
            name: row.get(2)?,
            barcode: row.get(3)?,
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
    barcode: Option<&str>,
) -> Result<usize> {
    conn.execute(
        "UPDATE products 
            SET category_id = ?1, name = ?2, barcode = ?3 
            WHERE id = ?4",
        params![category_id, name, barcode, id],
    )
}

pub fn delete_product(conn: &Connection, id: i32) -> Result<usize> {
    conn.execute("DELETE FROM products WHERE id = ?1", params![id])
}

pub fn add_product_size(
    conn: &Connection,
    product_id: i64,
    size_id: i32,
    price: f64,
) -> Result<usize> {
    conn.execute(
        "INSERT INTO product_sizes (product_id, size_id, price) VALUES (?1, ?2, ?3)",
        params![product_id, size_id, price],
    )
}

pub fn fetch_products_with_sizes(conn: &Connection) -> Result<Vec<ProductWithSizes>> {
    let mut stmt = conn.prepare(
        "SELECT id, category_id, name, barcode FROM products ORDER BY id ASC"
    )?;
    let product_iter = stmt.query_map([], |row| {
        Ok(ProductWithSizes {
            id: row.get(0)?,
            category_id: row.get(1)?,
            name: row.get(2)?,
            barcode: row.get(3)?,
            sizes: vec![],
        })
    })?;

    let mut products = Vec::new();
    for product in product_iter {
        let mut p = product?;
        p.sizes = fetch_product_sizes(conn, p.id)?;
        products.push(p);
    }

    Ok(products)
}
