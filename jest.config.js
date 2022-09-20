const path = require('path');

module.exports = {
  // eslint-disable-next-line global-require
  ...require('@mossop/config/node-ts/jest'),

  testMatch: [path.join(__dirname, 'test', '**/*.test.[jt]s?(x)')],
};
