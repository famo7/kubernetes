const express = require('express');
const fs = require('fs');

const app = express();
const port = process.env.PORT || 3000;
const filePath = '/usr/src/app/files/output.log';

app.get('/', (req, res) => {
    if (fs.existsSync(filePath)) {
        const content = fs.readFileSync(filePath, 'utf8');
        res.send(content);
    } else {
        res.send('No logs yet');
    }
});

app.listen(port, () => {
    console.log(`Server started in port ${port}`);
});