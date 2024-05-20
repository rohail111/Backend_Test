const PORT = 3000;

const LABELS = {
  title: 'Following are the titles of given websites:',
  mainUrl: '/I/want/title',
  emptyString: '',
  serverPort: 'Server is running on port',
};

const ERRORS_MESSAGES = {
  noAddress: '<h1>No addresses provided</h1>',
  noResponse: 'NO RESPONSE',
  notFound404: '<h1>404 Not Found</h1>',
  noTitleFound: 'No title found',
  parsedUrlUndefined: 'Parsed URL is undefined',
};

const REGEX = {
  getTitle: /<title>([^<]*)<\/title>/i,
};

const PROTOCOL = {
  http: 'http',
  https: 'https',
};

module.exports = {
  PORT,
  ERRORS_MESSAGES,
  LABELS,
  REGEX,
  PROTOCOL,
};
