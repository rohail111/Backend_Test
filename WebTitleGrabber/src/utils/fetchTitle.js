const http = require('http');
const https = require('https');
const {URL} = require('url');
const async = require('async');
const {REGEX, ERRORS_MESSAGES, PROTOCOL, LABELS} = require('../constants');

exports.fetchTitle = (address, callback) => {
  async.waterfall(
    [
      (next) => {
        const parsedUrl = new URL(
          address.startsWith(PROTOCOL.http)
            ? address
            : `${PROTOCOL.http}://${address}`
        );
        next(null, parsedUrl);
      },
      (parsedUrl, next) => {
        if (!parsedUrl) {
          return next(new Error('Parsed URL is undefined'));
        }
        const protocol =
          parsedUrl.protocol === `${PROTOCOL.https}:` ? https : http;
        const request = protocol.get(parsedUrl, (response) => {
          if (
            response.statusCode >= 300 &&
            response.statusCode < 400 &&
            response.headers.location
          ) {
            // Redirect detected, construct the new URL and fetch title from it
            const redirectUrl = new URL(response.headers.location, parsedUrl);
            exports.fetchTitle(redirectUrl.href, callback); // Recursive call to fetch the title from the redirected URL
            return;
          }

          let data = LABELS.emptyString;
          response.on('data', (chunk) => {
            data += chunk;
          });
          response.on('end', () => {
            const match = data.match(REGEX.getTitle);
            if (match && match[1]) {
              next(null, match[1]);
            } else {
              next(new Error(ERRORS_MESSAGES.noTitleFound));
            }
          });
        });

        request.on('error', (e) => {
          next(e);
        });
        request.end(); // End the request
      },
    ],
    (error, title) => {
      if (error) {
        callback(error);
      } else {
        callback(null, title);
      }
    }
  );
};
