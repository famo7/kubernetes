const crypto = require('crypto');
const fs = require('fs');

const randomString = crypto.randomUUID();
const filePath = '/usr/src/app/files/output.log';

console.log(`[System] Application started. Generated string: ${randomString}\n`);

setInterval(() => {
    const timestamp = new Date().toISOString();
    const line = `${timestamp}: ${randomString}`;
    console.log(line);
    fs.writeFileSync(filePath, line);
}, 5000);