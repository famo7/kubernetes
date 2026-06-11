const crypto = require('crypto');
const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

// 1. Generate a random string on startup and store it in memory
const randomString = crypto.randomUUID();
console.log(`[System] Application started. Generated string: ${randomString}\n`);

// 2. Output the timestamp and string every 5 seconds
setInterval(() => {
    const timestamp = new Date().toISOString();
    console.log(`${timestamp}: ${randomString}`);
}, 5000);

// 3. New endpoint to request current status
app.get('/', (req, res) => {
    const timestamp = new Date().toISOString();
    res.send(`${timestamp}: ${randomString}`);
});

app.listen(port, () => {
    console.log(`Server started in port ${port}`);
});