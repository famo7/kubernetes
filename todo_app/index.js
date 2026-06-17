const express = require('express');
const fs = require('fs');
const axios = require('axios');
const app = express();
const port = process.env.PORT;

app.use(express.urlencoded({ extended: true }));

const imagePath = '/usr/src/app/files/image.jpg';
const timestampPath = '/usr/src/app/files/timestamp.txt';
const TEN_MINUTES = 60 * 10 * 1000;
const BACKEND_URL = process.env.BACKEND_URL;

function shouldFetchNewImage() {
  if (!fs.existsSync(timestampPath)) return true;
  const lastFetch = parseInt(fs.readFileSync(timestampPath, 'utf8'));
  return Date.now() - lastFetch > TEN_MINUTES;
}

async function fetchImage() {
  const response = await axios.get('https://picsum.photos/1200', { responseType: 'arraybuffer' });
  fs.writeFileSync(imagePath, response.data);
  fs.writeFileSync(timestampPath, String(Date.now()));
}

app.post('/todos', async (req, res) => {
  const { content } = req.body;
  await axios.post(`${BACKEND_URL}/todos`, { content });
  res.redirect('/');
});

app.get('/', async (req, res) => {
  try {
    if (shouldFetchNewImage()) {
      await fetchImage();
    }
    const image = fs.readFileSync(imagePath);
    const todosResponse = await axios.get(`${BACKEND_URL}/todos`);
    const todos = todosResponse.data;

    res.send(`
      <html>
        <head>
          <style>
            * { box-sizing: border-box; margin: 0; padding: 0; }
            body { font-family: Arial, sans-serif; background: #f5f5f5; color: #333; }
            .container { max-width: 800px; margin: 40px auto; padding: 20px; }
            h1 { margin-bottom: 20px; font-size: 24px; color: #444; }
            img { width: 100%; border-radius: 12px; margin-bottom: 30px; object-fit: cover; height: 400px; }
            .input-row { display: flex; gap: 10px; margin-bottom: 30px; }
            input { flex: 1; padding: 12px 16px; border: 1px solid #ddd; border-radius: 8px; font-size: 16px; outline: none; }
            input:focus { border-color: #4a90e2; }
            button { padding: 12px 24px; background: #4a90e2; color: white; border: none; border-radius: 8px; font-size: 16px; cursor: pointer; }
            button:hover { background: #357abd; }
            ul { list-style: none; }
            li { background: white; padding: 14px 18px; margin-bottom: 10px; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); font-size: 16px; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>Todo App</h1>
            <img src="data:image/jpeg;base64,${image.toString('base64')}"/>
            <form class="input-row" action="/todos" method="post">
              <input type="text" name="content" maxlength="140" placeholder="Enter a todo (max 140 characters)"/>
              <button type="submit">Add</button>
            </form>
            <ul>
              ${todos.map(todo => `<li>${todo.content}</li>`).join('')}
            </ul>
          </div>
        </body>
      </html>
    `);
  } catch (err) {
    console.error('Error:', err);
    res.send('Error: ' + err.message);
  }
});

app.listen(port, () => {
  console.log(`Server started in port ${port}`);
});