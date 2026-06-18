const express = require('express');
const { Pool } = require('pg'); 

const app = express();
const port = process.env.PORT || 3000;

const pool = new Pool({
    connectionString: process.env.DATABASE_URL || "postgres://postgres:secretpassword@postgres-svc:5432/pingpong_db"
});

async function initDb() {
    await pool.query(`
        CREATE TABLE IF NOT EXISTS counter_table (
            id INT PRIMARY KEY,
            value INT NOT NULL
        );
    `);
    // Insert the initial row if empty
    await pool.query(`
        INSERT INTO counter_table (id, value) 
        VALUES (1, 0) 
        ON CONFLICT (id) DO NOTHING;
    `);
}
initDb().catch(err => console.error("Database initialization failed:", err));

app.get('/count', async (req, res) => {
    try {
        const result = await pool.query('SELECT value FROM counter_table WHERE id = 1');
        res.send(String(result.rows[0].value));
    } catch (err) {
        res.status(500).send(err.toString());
    }
});

app.get('/pingpong', async (req, res) => {
    try {
        
        const result = await pool.query(`
            UPDATE counter_table 
            SET value = value + 1 
            WHERE id = 1 
            RETURNING value;
        `);
        res.send(`pong ${result.rows[0].value}`);
    } catch (err) {
        res.status(500).send(err.toString());
    }
});

app.listen(port, () => {
    console.log(`Server started in port ${port}`);
});