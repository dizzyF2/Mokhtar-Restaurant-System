use rusqlite::{params, Connection, Result};
use serde::Serialize;

#[derive(Debug, Serialize)]
pub struct ProductSize {
    pub id: i32,
    pub product_id: i32,
    pub size_id: i32,
    pub size: String,
    pub price: f64,
}

#[derive(Debug, Serialize)]
pub struct Size {
    pub id: i32,
    pub name: String,
}

#[derive(Debug, serde::Deserialize)]
pub struct SizeInput {
    pub size_id: i32,
    pub price: f64,
}


pub fn fetch_product_sizes(conn: &Connection, product_id: i32) -> Result<Vec<ProductSize>> {
    let mut stmt = conn.prepare(
        "SELECT ps.id, ps.product_id, ps.size_id, s.name, ps.price
            FROM product_sizes ps
            INNER JOIN sizes s ON ps.size_id = s.id
            WHERE ps.product_id = ?
            ORDER BY ps.id ASC"
    )?;

    let sizes_iter = stmt.query_map(params![product_id], |row| {
        let id: Result<i32, _> = row.get(0);
        let product_id: Result<i32, _> = row.get(1);
        let size_id: Result<i32, _> = row.get(2);
        let size: Result<String, _> = row.get(3);
        let price: Result<f64, _> = row.get(4);


        Ok(ProductSize {
            id: id?,
            product_id: product_id?,
            size_id: size_id?,
            size: size?,
            price: price?,
        })
    })?;

    let mut sizes = Vec::new();
    for size in sizes_iter {
        sizes.push(size?);
    }

    Ok(sizes)
}


pub fn update_product_size(conn: &Connection, id: i32, size_id: i32, price: f64) -> Result<()> {
    conn.execute(
        "UPDATE product_sizes SET size_id = ?, price = ? WHERE id = ?",
        params![size_id, price, id],
    )?;
    Ok(())
}


pub fn delete_product_size(conn: &Connection, id: i32) -> Result<()> {
    conn.execute(
        "DELETE FROM product_sizes WHERE id = ?",
        params![id],
    )?;
    Ok(())
}

// ------------------- global sizes ---------------------
pub fn fetch_sizes(conn: &Connection) -> Result<Vec<Size>> {
    let mut stmt = conn.prepare("SELECT id, name FROM sizes ORDER BY id ASC")?;
    let rows = stmt.query_map([], |row| {
        Ok(Size {
            id: row.get(0)?,
            name: row.get(1)?,
        })
    })?;

    let mut sizes = Vec::new();
    for size in rows {
        sizes.push(size?);
    }
    Ok(sizes)
}

pub fn add_size(conn: &Connection, name: &str) -> Result<()> {
    conn.execute("INSERT INTO sizes (name) VALUES (?)", params![name])?;
    Ok(())
}

pub fn update_size(conn: &Connection, id: i32, name: &str) -> Result<()> {
    conn.execute("UPDATE sizes SET name = ? WHERE id = ?", params![name, id])?;
    Ok(())
}

pub fn delete_size(conn: &Connection, id: i32) -> Result<()> {
    conn.execute("DELETE FROM sizes WHERE id = ?", params![id])?;
    Ok(())
}
