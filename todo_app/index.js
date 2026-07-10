const express = require('express');
const https = require('https');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const CACHE_DIR = process.env.CACHE_DIR || '/usr/src/app/files';
const IMAGE_FILE = path.join(CACHE_DIR, 'image.jpg');
const META_FILE = path.join(CACHE_DIR, 'meta.json');
const TEN_MINUTES = 10 * 60 * 1000;

fs.mkdirSync(CACHE_DIR, { recursive: true });

function fetchImage(url, redirects = 0) {
  return new Promise((resolve, reject) => {
    if (redirects > 5) return reject(new Error('Too many redirects'));
    https.get(url, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return resolve(fetchImage(res.headers.location, redirects + 1));
      }
      if (res.statusCode !== 200) {
        return reject(new Error(`Unexpected status: ${res.statusCode}`));
      }
      const chunks = [];
      res.on('data', (chunk) => chunks.push(chunk));
      res.on('end', () => resolve(Buffer.concat(chunks)));
      res.on('error', reject);
    }).on('error', reject);
  });
}

async function refreshImageIfStale() {
  let meta = { timestamp: 0 };
  try {
    meta = JSON.parse(fs.readFileSync(META_FILE, 'utf-8'));
  } catch (err) {
    console.log('No existing meta file, will fetch a fresh image.');
  }

  const age = Date.now() - meta.timestamp;
  const imageExists = fs.existsSync(IMAGE_FILE);

  if (imageExists && age < TEN_MINUTES) {
    console.log(`Using cached image (age: ${Math.round(age / 1000)}s)`);
    return;
  }

  console.log('Fetching new image from Picsum...');
  try {
    const imageBuffer = await fetchImage('https://picsum.photos/1200');
    fs.writeFileSync(IMAGE_FILE, imageBuffer);
    fs.writeFileSync(META_FILE, JSON.stringify({ timestamp: Date.now() }));
    console.log('New image cached.');
  } catch (err) {
    console.error(`Failed to fetch new image: ${err.message}`);
  }
}

app.get('/todo', async (req, res) => {
  await refreshImageIfStale();

  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>K8s Demo with Express</title>
        <style>
            body { font-family: sans-serif; display: flex; flex-direction: column; align-items: center; min-height: 100vh; background-color: #f0f2f5; margin: 0; padding: 2rem 1rem; }
            .card { background: white; padding: 2rem; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); text-align: center; width: 100%; max-width: 480px; }
            h1 { color: #0070f3; margin-top: 0; }
            img { max-width: 100%; border-radius: 8px; margin: 1rem 0; }
            .todo-form { display: flex; gap: 0.5rem; margin-top: 1.5rem; }
            .todo-input { flex: 1; padding: 0.6rem 0.8rem; border: 1px solid #ccc; border-radius: 6px; font-size: 1rem; }
            .send-button { padding: 0.6rem 1.2rem; border: none; border-radius: 6px; background-color: #0070f3; color: white; font-size: 1rem; cursor: pointer; }
            .send-button:hover { background-color: #005ec2; }
            .char-counter { font-size: 0.8rem; color: #888; margin-top: 0.3rem; text-align: right; }
            .char-counter.over-limit { color: #e00; }
            .todo-list { list-style: none; padding: 0; margin: 1.5rem 0 0; text-align: left; }
            .todo-item { padding: 0.6rem 0.8rem; border-bottom: 1px solid #eee; }
            .todo-item:last-child { border-bottom: none; }
        </style>
    </head>
    <body>
        <div class="card">
            <h1>Hello from Express inside Kubernetes!</h1>
            <p>The server is successfully running on port <strong>${PORT}</strong>.</p>
            <img src="/todo/image" alt="Random cached image" />

            <form class="todo-form" id="todo-form">
              <input
                type="text"
                id="todo-input"
                class="todo-input"
                placeholder="What needs to be done?"
                maxlength="140"
                required
              >
              <button type="submit" class="send-button">Send</button>
            </form>
            <div class="char-counter" id="char-counter">0 / 140</div>

            <ul class="todo-list" id="todo-list"></ul>
        </div>

        <script>
            const form = document.getElementById('todo-form');
            const input = document.getElementById('todo-input');
            const charCounter = document.getElementById('char-counter');
            const todoList = document.getElementById('todo-list');
            const MAX_LENGTH = 140;

            function updateCharCounter() {
                const length = input.value.length;
                charCounter.textContent = length + ' / ' + MAX_LENGTH;
                charCounter.classList.toggle('over-limit', length > MAX_LENGTH);
            }

            function renderTodos(todos) {
                todoList.innerHTML = '';
                todos.forEach((todo) => {
                    const li = document.createElement('li');
                    li.className = 'todo-item';
                    li.textContent = todo.text;
                    todoList.appendChild(li);
                });
            }

            async function loadTodos() {
                try {
                    const res = await fetch('/todos');
                    const todos = await res.json();
                    renderTodos(todos);
                } catch (err) {
                    console.error('Failed to load todos:', err);
                }
            }

            input.addEventListener('input', updateCharCounter);

            form.addEventListener('submit', async (event) => {
                event.preventDefault();
                const text = input.value.trim();
                if (!text || text.length > MAX_LENGTH) return;

                try {
                    const res = await fetch('/todos', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ text }),
                    });

                    if (!res.ok) {
                        const err = await res.json();
                        console.error('Failed to add todo:', err.error);
                        return;
                    }

                    input.value = '';
                    updateCharCounter();
                    await loadTodos();
                } catch (err) {
                    console.error('Failed to submit todo:', err);
                }
            });

            loadTodos();
        </script>
    </body>
    </html>
  `);
});

app.get('/todo/image', (req, res) => {
  if (!fs.existsSync(IMAGE_FILE)) {
    return res.status(404).send('No image cached yet.');
  }
  res.setHeader('Content-Type', 'image/jpeg');
  res.sendFile(IMAGE_FILE);
});

app.listen(PORT, () => {
  console.log(`Express server started on port ${PORT}`);
});