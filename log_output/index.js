const express = require('express');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const LOG_FILE = process.env.LOG_FILE || '/usr/src/app/files/output.log';
const FILE_PATH = process.env.FILE_PATH || '/usr/src/app/files/pingpong.log';
const randomString = crypto.randomUUID();

fs.mkdirSync(path.dirname(LOG_FILE), { recursive: true });

const writeLogLine = () => {
  const timestamp = new Date().toISOString();
  const line = `${timestamp}: ${randomString}\n`;
  fs.appendFileSync(LOG_FILE, line);
  console.log(line.trim());
};

console.log(`Application started. Generated string: ${randomString}`);

writeLogLine();
setInterval(writeLogLine, 5000);

app.get('/', (req, res) => {
  const timestamp = new Date().toISOString();

  let pingCount = '0';
  try {
    pingCount = fs.readFileSync(FILE_PATH, 'utf-8').trim();
  } catch (err) {
    console.error(`Could not read ping-pong count: ${err.message}`);
  }

  res.send(`${timestamp}: ${randomString}.\nPing / Pongs: ${pingCount}`);
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});