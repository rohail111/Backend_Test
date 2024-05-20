const url = require('url');
const async = require('async');
const {LABELS, ERRORS_MESSAGES} = require('../constants');
const {fetchTitle} = require('../utils/fetchTitle');

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
  let results = [];

  async.eachSeries(
    addressArray,
    (address, callback) => {
      fetchTitle(address, (error, title) => {
        if (error) {
          results.push(`<li>${address} - ${ERRORS_MESSAGES.noResponse}</li>`);
        } else {
          results.push(`<li>${address} - "${title}"</li>`);
        }
        callback();
      });
    },
    (err) => {
      if (err) {
        console.error(ERRORS_MESSAGES.paringError, err);
      } else {
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
      }
    }
  );
};
