const crypto = require('crypto');

// 1. Generate a random string on startup and store it in memory
const randomString = crypto.randomUUID();

console.log(`[System] Application started. Generated string: ${randomString}\n`);

// 2. Output the timestamp and string every 5 seconds
setInterval(() => {
    const timestamp = new Date().toISOString();
    console.log(`${timestamp}: ${randomString}`);
}, 5000);