const http = require('http'); // use external library 'http'

const hostname = '127.0.0.1'; // equivalent to 'localhost'
const port = 3000;

const server = http.createServer((req, res) => { // (request, response)
  res.statusCode = 200; // status code 200 means "OK"
  res.setHeader('Content-Type', 'text/plain'); // the response is plain text
  res.end('Hello World'); // write this message to the response
});

server.listen(port, hostname, () => { // listen for connections
  console.log(`Server running at http://${hostname}:${port}/`);
});