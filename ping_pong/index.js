const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

let counter = 0;
app.get('/count', (req, res) => {
    res.send(String(counter));
});
app.get('/pingpong', (req, res) => {
    counter++;
    res.send(`pong ${counter}`);
});

app.listen(port, () => {
    console.log(`Server started in port ${port}`);
});