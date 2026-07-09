const express = require('express');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;
const LOG_FILE = process.env.LOG_FILE || '/usr/src/app/files/output.log';

app.get('/', (req, res) => {
  fs.readFile(LOG_FILE, 'utf8', (err, data) => {
    if (err) {
      return res.status(500).type('text/plain').send(`Unable to read log file: ${err.message}`);
    }

    res.type('text/plain').send(data || 'No log entries yet');
  });
});

app.listen(PORT, () => {
  console.log(`Log reader is running on port ${PORT}`);
  console.log(`Watching log file: ${LOG_FILE}`);
});
