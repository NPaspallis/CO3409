const express = require('express'); // use external lib 'express'
const app = express(); // init express
const port = 3000;

app.get('/', (req, res) => { // handle GET requests at '/'
  res.send('Hello World!') // simply send back 'Hello World'
}) // no need to explicitly define status code or content type

app.listen(port, () => { // listen for connections (localhost implied)
  console.log(`Example app listening at http://localhost:${port}`)
})