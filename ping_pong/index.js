const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const FILE_PATH = process.env.FILE_PATH || '/usr/src/app/files/pingpong.log';

let counter = 0;

fs.mkdirSync(path.dirname(FILE_PATH), { recursive: true });

app.get('/pingpong', (req, res) => {
    res.send(`pong ${counter}`);
    fs.writeFileSync(FILE_PATH, counter.toString());
    counter++;
});

app.listen(PORT, () => {
    console.log(`Ping-pong app listening on port ${PORT}`);
});