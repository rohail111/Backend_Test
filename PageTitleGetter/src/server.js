const http = require('http');
const handleRequest = require('./routes/titleRouter');
const {LABELS, PORT: localhost} = require('./constants');

const server = http.createServer(handleRequest);

const PORT = process.env.PORT || localhost;

server.listen(PORT, () => {
  console.log(`${LABELS.serverPort} ${PORT}`);
});
