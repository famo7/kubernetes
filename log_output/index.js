const express = require('express');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const http = require('http');

const app = express();
const PORT = process.env.PORT || 3000;
const LOG_FILE = process.env.LOG_FILE || '/usr/src/app/files/output.log';
const PINGPONG_URL = process.env.PINGPONG_URL || 'http://ping-pong-svc:80/pingpong/count';
const INFO_FILE_PATH = process.env.INFO_FILE_PATH || '/usr/src/app/config/information.txt';
const MESSAGE = process.env.MESSAGE || '';
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

function fetchPingCount() {
  return new Promise((resolve, reject) => {
    http.get(PINGPONG_URL, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve(parsed.count);
        } catch (err) {
          reject(err);
        }
      });
    }).on('error', reject);
  });
}

app.get('/', async (req, res) => {
  const timestamp = new Date().toISOString();

  let pingCount = '0';
  try {
    pingCount = await fetchPingCount();
  } catch (err) {
    console.error(`Could not fetch ping-pong count: ${err.message}`);
  }

  let fileContent = '';
  try {
    fileContent = fs.readFileSync(INFO_FILE_PATH, 'utf8').trim();
  } catch (err) {
    console.error(`Could not read info file: ${err.message}`);
  }

  res.send(
    `file content: ${fileContent}\n` +
    `env variable: MESSAGE=${MESSAGE}\n` +
    `${timestamp}: ${randomString}.\nPing / Pongs: ${pingCount}`
  );
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});