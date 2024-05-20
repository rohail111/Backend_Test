const {ERRORS_MESSAGES} = require('../constants');
const {getTitle} = require('../controllers/titleController');

function handleRequest(req, res) {
  if (req.method === 'GET') {
    getTitle(req, res);
  } else {
    res.writeHead(404, {'Content-Type': 'text/html'});
    res.end(ERRORS_MESSAGES.notFound404);
  }
}

module.exports = handleRequest;
