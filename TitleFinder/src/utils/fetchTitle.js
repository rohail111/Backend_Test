const http = require('http');
const https = require('https');
const {URL} = require('url');
const {REGEX, ERRORS_MESSAGES, PROTOCOL, LABELS} = require('../constants');

exports.fetchTitle = (address, callback) => {
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
      exports.fetchTitle(redirectUrl.href, callback);
      return;
    }

    let data = LABELS.emptyString;
    response.on('data', (chunk) => {
      data += chunk;
    });
    response.on('end', () => {
      const match = data.match(REGEX.getTitle);
      if (match && match[1]) {
        callback(null, match[1]);
      } else {
        callback(new Error(ERRORS_MESSAGES.noTitleFound));
      }
    });
  });

  request.on('error', (e) => {
    callback(e);
  });
};
