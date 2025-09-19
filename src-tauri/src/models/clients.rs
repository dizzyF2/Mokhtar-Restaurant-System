use rusqlite::{params, Connection, Result};
use serde::{Serialize, Deserialize};

#[derive(Debug, Serialize, Deserialize)]
pub struct Client {
    pub id: i32,
    pub name: String,
    pub phone: String,
    pub phone2: Option<String>,
    pub address: Option<String>,
}

impl Client {
    pub fn fetch_all_clients(conn: &Connection) -> Result<Vec<Client>> {
        let mut stmt = conn.prepare(
            "SELECT id, name, phone, phone2, address FROM clients ORDER BY id DESC"
        )?;

        let clients = stmt.query_map([], |row| {
            Ok(Client {
                id: row.get(0)?,
                name: row.get(1)?,
                phone: row.get(2)?,
                phone2: row.get(3)?,
                address: row.get(4)?,
            })
        })?;

        let mut result = Vec::new();
        for client in clients {
            result.push(client?);
        }
        Ok(result)
    }

    pub fn add_client(conn: &Connection, name: &str, phone: &str, phone2: Option<&str>, address: Option<&str>) -> Result<()> {
        conn.execute(
            "INSERT INTO clients (name, phone, phone2, address) VALUES (?1, ?2, ?3, ?4)",
            params![name, phone, phone2, address],
        )?;
        Ok(())
    }

    pub fn update_client(conn: &Connection, id: i32, name: &str, phone: &str, phone2: Option<&str>, address: Option<&str>) -> Result<()> {
        conn.execute(
            "UPDATE clients SET name = ?1, phone = ?2, phone2 = ?3, address = ?4 WHERE id = ?5",
            params![name, phone, phone2, address, id],
        )?;
        Ok(())
    }

    pub fn delete_client(conn: &Connection, id: i32) -> Result<()> {
        conn.execute("DELETE FROM clients WHERE id = ?1", params![id])?;
        Ok(())
    }
}
