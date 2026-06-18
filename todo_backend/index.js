const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Pull database URL from container environment variables
const pool = new Pool({
    connectionString: process.env.DATABASE_URL || "postgres://postgres:todosecretpassword@todo-postgres-svc:5432/todo_db"
});

// Setup database tables if missing
async function initDb() {
    await pool.query(`
        CREATE TABLE IF NOT EXISTS todos (
            id BIGINT PRIMARY KEY,
            content VARCHAR(140) NOT NULL
        );
    `);
}
initDb().catch(err => console.error("Database initialization failed:", err));

app.get('/todos', async (req, res) => {
    try {
        const result = await pool.query('SELECT id, content FROM todos ORDER BY id ASC');
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/todos', async (req, res) => {
    const { content } = req.body;
    if (!content || content.length > 140) {
        return res.status(400).json({ error: 'Todo must be between 1 and 140 characters' });
    }

    try {
        const newId = Date.now();
        const result = await pool.query(
            'INSERT INTO todos (id, content) VALUES ($1, $2) RETURNING id, content',
            [newId, content]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.listen(port, () => {
    console.log(`Server started in port ${port}`);
});