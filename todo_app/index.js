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
            body { font-family: sans-serif; display: flex; flex-direction: column; justify-content: center; align-items: center; min-height: 100vh; background-color: #f0f2f5; margin: 0; }
            .card { background: white; padding: 2rem; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); text-align: center; }
            h1 { color: #0070f3; }
            img { max-width: 400px; border-radius: 8px; margin-top: 1rem; }
        </style>
    </head>
    <body>
        <div class="card">
            <h1>Hello from Express inside Kubernetes!</h1>
            <p>The server is successfully running on port <strong>${PORT}</strong>.</p>
            <img src="/todo/image" alt="Random cached image" />
        </div>
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