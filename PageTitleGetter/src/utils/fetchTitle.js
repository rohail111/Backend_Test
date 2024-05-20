const {Observable} = require('rxjs');
const {map, catchError} = require('rxjs/operators');
const http = require('http');
const https = require('https');
const {URL} = require('url');
const {REGEX, ERRORS_MESSAGES, PROTOCOL} = require('../constants');

exports.fetchTitleObservable = (address) => {
  return new Observable((observer) => {
    const parsedUrl = new URL(
      address.startsWith(PROTOCOL.http)
        ? address
        : `${PROTOCOL.http}://${address}`
    );
    const protocol = parsedUrl.protocol === `${PROTOCOL.https}:` ? https : http;

    const request = protocol.get(parsedUrl, (response) => {
      if (
        response.statusCode >= 300 &&
        response.statusCode < 400 &&
        response.headers.location
      ) {
        const redirectUrl = new URL(response.headers.location, parsedUrl);
        exports.fetchTitleObservable(redirectUrl.href).subscribe(observer);
        return;
      }

      let data = '';
      response.on('data', (chunk) => {
        data += chunk;
      });
      response.on('end', () => {
        const match = data.match(REGEX.getTitle);
        if (match && match[1]) {
          observer.next(match[1]);
          observer.complete();
        } else {
          observer.error(new Error(ERRORS_MESSAGES.noTitleFound));
        }
      });
    });

    request.on('error', (e) => {
      observer.error(e);
    });
  }).pipe(
    catchError((error) => {
      console.error('Error fetching title:', error);
      return Observable.throwError(ERRORS_MESSAGES.noResponse);
    })
  );
};
