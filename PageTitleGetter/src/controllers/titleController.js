const {from} = require('rxjs');
const {map, mergeMap, toArray, catchError} = require('rxjs/operators');
const {fetchTitleObservable} = require('../utils/fetchTitle');
const {LABELS, ERRORS_MESSAGES} = require('../constants');
const url = require('url');

exports.getTitle = (req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const addresses = parsedUrl.pathname.startsWith(LABELS.mainUrl)
    ? parsedUrl.query.address
    : null;

  if (!addresses) {
    res.writeHead(400, {'Content-Type': 'text/html'});
    res.end(`${ERRORS_MESSAGES.noAddress}`);
    return;
  }

  const addressArray = Array.isArray(addresses) ? addresses : [addresses];

  from(addressArray)
    .pipe(
      mergeMap((address) =>
        fetchTitleObservable(address).pipe(
          map((title) => ({address, title})),
          catchError((error) => {
            console.error(ERRORS_MESSAGES.fetchingError, error);
            return [{address, title: ERRORS_MESSAGES.noResponse}];
          })
        )
      ),
      toArray()
    )
    .subscribe({
      next: (titles) => {
        res.writeHead(200, {'Content-Type': 'text/html'});
        res.write(`<html><head></head><body><h1>${LABELS.title}</h1><ul>`);
        titles.forEach(({address, title}) => {
          res.write(`<li>${address} - "${title}"</li>`);
        });
        res.end();
      },
      error: (error) => {
        console.error(ERRORS_MESSAGES.fetchingError, error);
        res.status(500).send(ERRORS_MESSAGES.serverError);
      },
    });
};
