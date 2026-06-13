const express = require('express');
const fs = require('fs');
const axios = require('axios');
const app = express();
const port = process.env.PORT || 3000;

const imagePath = '/usr/src/app/files/image.jpg';
const timestampPath = '/usr/src/app/files/timestamp.txt';
const TEN_MINUTES = 60 * 10 * 1000;

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

app.get('/', async (req, res) => {
    try {
        if (shouldFetchNewImage()) {
            await fetchImage();
        }
        const image = fs.readFileSync(imagePath);
        res.send(`
      <html>
        <body>
          <img src="data:image/jpeg;base64,${image.toString('base64')}" style="max-width: 40%; height: 450px;"/>
          <p>Hello, Kubernetes!</p>
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