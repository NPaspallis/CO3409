const express = require('express');
const app = express();
const port = 3000;

app.get('/test', (req, res) => {
    res.status(200) // set the status code to 200 (OK)
        .setHeader('content-type', 'application/json') // body is JSON
        .send({message: 'Testing GET method'}); // note body is JSON, not text
});

app.post('/test', (req, res) => {
    res.status(200)
        .setHeader('content-type', 'application/json')
        .send({message: 'Testing POST method'});
});

app.put('/test', (req, res) => {
    res.status(200)
        .setHeader('content-type', 'application/json')
        .send({message: 'Testing PUT method'});
});

app.delete('/test', (req, res) => {
    res.status(200)
        .setHeader('content-type', 'application/json')
        .send({message: 'Testing DELETE method'});
});
  
app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
    console.log(`Press Ctrl+C to exit...`)
});