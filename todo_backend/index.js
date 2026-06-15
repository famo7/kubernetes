const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

let todos = [];

app.get('/todos', (req, res) => {
    res.json(todos);
});

app.post('/todos', (req, res) => {
    const { content } = req.body;
    if (!content || content.length > 140) {
        return res.status(400).json({ error: 'Todo must be between 1 and 140 characters' });
    }
    const todo = { id: Date.now(), content };
    todos.push(todo);
    res.status(201).json(todo);
});

app.listen(port, () => {
    console.log(`Server started in port ${port}`);
});