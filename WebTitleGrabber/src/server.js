const http = require('http');
const handleRequest = require('./routes/titleRouter');
const {LABELS} = require('./constants');

const server = http.createServer(handleRequest);

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log(`${LABELS.serverPort} ${PORT}`);
});
