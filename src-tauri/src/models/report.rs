use rusqlite::{params, Connection, Result};
use serde::Serialize;

#[derive(Serialize)]
pub struct SaleDetail {
    pub product_name: String,
    pub size: Option<String>,
    pub quantity: i32,
    pub employee_name: String,
    pub total_price: f64,
    pub timestamp: String,
    pub category_name: Option<String>, // for grouping by category
}

#[derive(Serialize)]
pub struct SalesReport {
    pub total_sales: f64,
    pub total_transactions: i64,
    pub sales: Vec<SaleDetail>,
}

pub fn get_report(
    conn: &Connection,
    start_date: Option<&str>,
    end_date: Option<&str>,
) -> Result<SalesReport> {
    let start = start_date.unwrap_or("1970-01-01");
    let end = end_date.unwrap_or("9999-12-31");

    let (total_sales, total_transactions): (f64, i64) = conn.query_row(
        "SELECT IFNULL(SUM((price + extra_amount) * quantity), 0) as total_sales,
                COUNT(DISTINCT sale_id) as total_transactions
            FROM sale_items
            JOIN sales ON sale_items.sale_id = sales.id
            WHERE date(sales.timestamp) BETWEEN ?1 AND ?2",
        params![start, end],
        |row| Ok((row.get(0)?, row.get(1)?)),
    )?;

    let mut stmt_details = conn.prepare(
    "SELECT si.product_name,
            si.size,
            si.quantity,
            e.name,
            ((si.price + si.extra_amount) * si.quantity) as total_price,
            s.timestamp,
            c.name as category_name
            FROM sale_items si
            JOIN sales s ON si.sale_id = s.id
            JOIN employees e ON s.employee_id = e.id
            LEFT JOIN products p ON si.product_id = p.id
            LEFT JOIN categories c ON p.category_id = c.id
            LEFT JOIN sizes sz ON si.size_id = sz.id  
            WHERE date(s.timestamp) BETWEEN ?1 AND ?2
            ORDER BY s.timestamp DESC",
    )?;

    let sales_iter = stmt_details.query_map(params![start, end], |row| {
        Ok(SaleDetail {
            product_name: row.get(0)?,
            size: row.get(1)?,
            quantity: row.get(2)?,
            employee_name: row.get(3)?,
            total_price: row.get(4)?,
            timestamp: row.get(5)?,
            category_name: row.get(6).ok(),
        })
    })?;

    let mut sales = Vec::new();
    for sale in sales_iter {
        sales.push(sale?);
    }

    Ok(SalesReport {
        total_sales,
        total_transactions,
        sales,
    })
}
