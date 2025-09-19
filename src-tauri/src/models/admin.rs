use rusqlite::{params, Connection, Result};



pub fn create_admin_table(conn: &Connection) -> Result<()> {
    conn.execute(
        "CREATE TABLE IF NOT EXISTS admins (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL
        )",
        [],
    )?;
    Ok(())
}

pub fn add_admin(conn: &Connection, name: &str, password: &str) -> Result<()> {
    conn.execute(
        "INSERT INTO admins (name, password) VALUES (?1, ?2)",
        params![name, password],
    )?;
    Ok(())
}

pub fn validate_admin(conn: &Connection, name: &str, password: &str) -> Result<bool> {
    let mut stmt = conn.prepare("SELECT COUNT(*) FROM admins WHERE name=?1 AND password=?2")?;
    let count: i32 = stmt.query_row(params![name, password], |row| row.get(0))?;
    Ok(count > 0)
}

pub fn verify_admin_password(conn: &Connection, old_password: &str) -> Result<bool> {
    let mut stmt = conn.prepare("SELECT password FROM admins WHERE id = 1")?;
    let stored_password: String = stmt.query_row([], |row| row.get(0))?;
    Ok(stored_password == old_password)
}

pub fn update_admin(conn: &Connection, old_password: &str, new_name: &str, new_password: &str) -> Result<bool> {
    if !verify_admin_password(conn, old_password)? {
        return Ok(false);
    }

    conn.execute(
        "UPDATE admins SET name = ?1, password = ?2 WHERE id = 1",
        params![new_name, new_password],
    )?;
    Ok(true)
}