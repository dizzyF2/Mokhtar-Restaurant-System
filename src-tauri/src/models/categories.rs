use rusqlite::{params, Connection, Result};
use serde::Serialize;

#[derive(Debug, Serialize)]
pub struct Category {
    pub id: i32,
    pub name: String,
}


pub fn add_category(conn: &Connection, name: &str) -> Result<()> {
    conn.execute(
        "INSERT INTO categories (name) VALUES (?1)",
        params![name],
    )?;
    Ok(())
}


pub fn fetch_categories(conn: &Connection) -> Result<Vec<Category>> {
    let mut stmt = conn.prepare("SELECT id, name FROM categories ORDER BY id DESC")?;
    let rows = stmt.query_map([], |row| {
        Ok(Category {
            id: row.get(0)?,
            name: row.get(1)?,
        })
    })?;

    let mut categories = Vec::new();
    for c in rows {
        categories.push(c?);
    }
    Ok(categories)
}


pub fn update_category(conn: &Connection, id: i32, name: &str) -> Result<()> {
    conn.execute(
        "UPDATE categories SET name = ?1 WHERE id = ?2",
        params![name, id],
    )?;
    Ok(())
}


pub fn delete_category(conn: &Connection, id: i32) -> Result<()> {
    conn.execute("DELETE FROM categories WHERE id = ?1", params![id])?;
    Ok(())
}
