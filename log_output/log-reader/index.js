const express = require('express');
const fs = require('fs');
const axios = require('axios');
const app = express();
const port = process.env.PORT || 3000;

const logPath = '/usr/src/app/files/output.log';

app.get('/', async (req, res) => {
    const log = fs.existsSync(logPath)
        ? fs.readFileSync(logPath, 'utf8')
        : 'No logs yet';

    const response = await axios.get('http://ping-pong-svc:2345/count');
    const counter = response.data;

    res.send(`${log}\nPing / Pongs: ${counter}`);
});

app.listen(port, () => {
    console.log(`Server started in port ${port}`);
});