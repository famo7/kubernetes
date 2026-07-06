const crypto = require('crypto');

const randomString = crypto.randomUUID();

console.log(`Application started. Generated string: ${randomString}`);

setInterval(() => {
  const timestamp = new Date().toISOString();
  console.log(`${timestamp}: ${randomString}`);
}, 5000);