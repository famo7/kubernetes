const express = require('express');
const fs = require('fs');
const app = express();
const port = process.env.PORT || 3000;

const filePath = '/app/files/counter.txt';

// Read counter from file on startup if it exists
let counter = 0;
if (fs.existsSync(filePath)) {
    counter = parseInt(fs.readFileSync(filePath, 'utf8'));
}

app.get('/pingpong', (req, res) => {
    counter++;
    fs.writeFileSync(filePath, String(counter));
    res.send(`pong ${counter}`);
});

app.listen(port, () => {
    console.log(`Server started in port ${port}`);
});