const {LABELS, ERRORS_MESSAGES} = require('../constants');
const url = require('url');
const RSVP = require('rsvp');
const {fetchTitlePromise} = require('../utils/fetchTitle');

exports.getTitle = (req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const addresses = parsedUrl.pathname.startsWith(LABELS.mainUrl)
    ? parsedUrl.query.address
    : null;

  if (!addresses) {
    res.writeHead(400, {'Content-Type': 'text/html'});
    res.end(ERRORS_MESSAGES.noAddress);
    return;
  }

  const addressArray = Array.isArray(addresses) ? addresses : [addresses];
  const promises = addressArray.map((address) => fetchTitlePromise(address));

  RSVP.all(promises)
    .then((titles) => {
      const results = titles.map(
        (title, index) => `<li>${addressArray[index]} - "${title}"</li>`
      );

      res.writeHead(200, {'Content-Type': 'text/html'});
      res.end(`
        <html>
        <head></head>
        <body>
          <h1>${LABELS.title}</h1>
          <ul>${results.join('')}</ul>
        </body>
        </html>
      `);
    })
    .catch((error) => {
      console.error(ERRORS_MESSAGES.errorFetchingTitles, error);
      res.writeHead(500, {'Content-Type': 'text/html'});
      res.end(ERRORS_MESSAGES.serverError);
    });
};
