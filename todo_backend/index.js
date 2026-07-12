const express = require('express');

const app = express();
const PORT = process.env.PORT || 3000;
const TODO_MAX_LENGTH = parseInt(process.env.TODO_MAX_LENGTH, 10) || 140;

app.use(express.json());

let todos = [];

app.get('/todos', (req, res) => {
  res.json(todos);
});

app.post('/todos', (req, res) => {
  const { text } = req.body;

  if (!text || typeof text !== 'string' || text.trim().length === 0) {
    return res.status(400).json({ error: 'Todo text is required' });
  }

  if (text.length > TODO_MAX_LENGTH) {
    return res.status(400).json({ error: `Todo text must be ${TODO_MAX_LENGTH} characters or fewer` });
  }

  const todo = { id: Date.now().toString(), text: text.trim() };
  todos.push(todo);
  res.status(201).json(todo);
});

app.listen(PORT, () => {
  console.log(`Todo-backend listening on port ${PORT}`);
});