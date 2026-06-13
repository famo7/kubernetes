const express = require('express');
const fs = require('fs');
const app = express();
const port = process.env.PORT || 3000;

const logPath = '/usr/src/app/files/output.log';
const counterPath = '/app/files/counter.txt';

app.get('/', (req, res) => {
    const log = fs.existsSync(logPath)
        ? fs.readFileSync(logPath, 'utf8')
        : 'No logs yet';

    const counter = fs.existsSync(counterPath)
        ? fs.readFileSync(counterPath, 'utf8')
        : '0';

    res.send(`${log}\nPing / Pongs: ${counter}`);
});

app.listen(port, () => {
    console.log(`Server started in port ${port}`);
});