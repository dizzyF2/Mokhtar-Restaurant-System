use rusqlite::{params, Connection, Result};

#[derive(Debug, serde::Serialize, serde::Deserialize)]
pub struct Employee {
    pub id: i32,
    pub name: String,
}

pub fn add_employee(conn: &Connection, name: &str, password: &str) -> Result<usize> {
    conn.execute(
        "INSERT INTO employees (name, password) VALUES (?1, ?2)",
        params![name, password],
    )
}

pub fn update_employee(conn: &Connection, id: i32, name: &str, password: &str) -> Result<usize> {
    conn.execute(
        "UPDATE employees SET name = ?1, password = ?2 WHERE id = ?3",
        params![name, password, id],
    )
}

pub fn delete_employee(conn: &Connection, id: i32) -> Result<usize> {
    conn.execute("DELETE FROM employees WHERE id = ?1", params![id])
}

pub fn get_employees(conn: &Connection) -> Result<Vec<Employee>> {
    let mut stmt = conn.prepare("SELECT id, name FROM employees ORDER BY id DESC")?;
    let rows = stmt.query_map([], |row| {
        Ok(Employee {
            id: row.get(0)?,
            name: row.get(1)?,
        })
    })?;

    let mut out = Vec::new();
    for r in rows {
        out.push(r?);
    }
    Ok(out)
}

/// Verify employee credentials for login
pub fn verify_employee(conn: &Connection, name: &str, password: &str) -> Result<Option<Employee>> {
    let mut stmt = conn.prepare(
        "SELECT id, name FROM employees WHERE name = ?1 AND password = ?2",
    )?;
    let mut rows = stmt.query(params![name, password])?;

    if let Some(row) = rows.next()? {
        Ok(Some(Employee {
            id: row.get(0)?,
            name: row.get(1)?,
        }))
    } else {
        Ok(None)
    }
}
