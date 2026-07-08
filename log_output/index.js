const express = require('express');
const crypto = require('crypto');

const app = express();
const PORT = process.env.PORT || 3000;
const randomString = crypto.randomUUID();

console.log(`Application started. Generated string: ${randomString}`);

setInterval(() => {
  const timestamp = new Date().toISOString();
  console.log(`${timestamp}: ${randomString}`);
}, 5000);

app.get('/', (req, res) => {
  const timestamp = new Date().toISOString();
  res.send(`${timestamp}: ${randomString}`);
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});