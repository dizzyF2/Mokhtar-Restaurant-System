use rusqlite::{params, Connection, Result};
use serde::Serialize;

#[derive(Debug, Serialize)]
pub struct SaleReport {
    pub id: i64,
    pub product_name: String,
    pub quantity: i32,
    pub employee_name: String,
    pub total: f64,
    pub timestamp: String,
}

pub fn start_sale(conn: &Connection, employee_id: i32) -> Result<i64> {
    conn.execute(
        "INSERT INTO sales (employee_id, total) VALUES (?1, 0)",
        params![employee_id],
    )?;
    Ok(conn.last_insert_rowid())
}

pub fn add_sale_item(
    conn: &Connection,
    sale_id: i64,
    product_id: i32,
    quantity: i32,
    price: f64,
    extra_amount: f64,
) -> Result<()> {
    let product_name: String = conn.query_row(
        "SELECT name FROM products WHERE id = ?1",
        params![product_id],
        |row| row.get(0),
    )?;

    conn.execute(
        "INSERT INTO sale_items 
            (sale_id, product_id, product_name, quantity, price, extra_amount) 
            VALUES (?1, ?2, ?3, ?4, ?5, ?6)",
        params![sale_id, product_id, product_name, quantity, price, extra_amount],
    )?;
    Ok(())
}

pub fn update_sale_total(conn: &Connection, sale_id: i64) -> Result<()> {
    let total: f64 = conn.query_row(
        "SELECT COALESCE(SUM(quantity * (price + extra_amount)), 0) 
            FROM sale_items 
            WHERE sale_id = ?1",
        params![sale_id],
        |row| row.get(0),
    )?;

    conn.execute(
        "UPDATE sales SET total = ?1 WHERE id = ?2",
        params![total, sale_id],
    )?;
    Ok(())
}

pub fn get_all_sales(conn: &Connection) -> Result<Vec<SaleReport>> {
    let mut stmt = conn.prepare(
        "
        SELECT 
            si.id,
            si.product_name,
            si.quantity,
            e.name as employee_name,
            (si.price + si.extra_amount) * si.quantity as total,
            s.timestamp
        FROM sale_items si
        JOIN sales s ON si.sale_id = s.id
        JOIN employees e ON s.employee_id = e.id
        ORDER BY s.timestamp DESC
        "
    )?;

    let sales = stmt.query_map([], |row| {
        Ok(SaleReport {
            id: row.get(0)?,
            product_name: row.get(1)?,
            quantity: row.get(2)?,
            employee_name: row.get(3)?,
            total: row.get(4)?,
            timestamp: row.get(5)?,
        })
    })?;

    Ok(sales.filter_map(Result::ok).collect())
}
