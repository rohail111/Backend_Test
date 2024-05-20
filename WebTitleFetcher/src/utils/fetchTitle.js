const http = require('http');
const https = require('https');
const {URL} = require('url');
const {REGEX, ERRORS_MESSAGES, PROTOCOL, LABELS} = require('../constants');
const RSVP = require('rsvp');

function fetchTitle(address) {
  return new RSVP.Promise((resolve, reject) => {
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
        fetchTitle(redirectUrl.href).then(resolve).catch(reject);
        return;
      }

      let data = LABELS.emptyString;
      response.on('data', (chunk) => {
        data += chunk;
      });
      response.on('end', () => {
        const match = data.match(REGEX.getTitle);
        if (match && match[1]) {
          resolve(match[1]);
        } else {
          reject(new Error(ERRORS_MESSAGES.noTitleFound));
        }
      });
    });

    request.on('error', (e) => {
      reject(e);
    });
  });
}

function fetchTitlePromise(address) {
  return new RSVP.Promise((resolve, reject) => {
    fetchTitle(address).then(resolve).catch(reject);
  });
}

module.exports = {
  fetchTitlePromise,
  fetchTitle,
};
