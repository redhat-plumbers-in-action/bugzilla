const path = require('path');

module.exports = {
  // eslint-disable-next-line global-require
  ...require('@mossop/config/node-ts/jest'),

  // As all tests run against the same instance it would be dangerous to allow
  // multiple tests to run at once.
  maxConcurrency: 1,
  maxWorkers: 1,

  testEnvironment: 'node',
  testTimeout: 10000,

  globalSetup: path.join(__dirname, 'setup.js'),
  globalTeardown: path.join(__dirname, 'teardown.js'),
  setupFilesAfterEnv: [path.join(__dirname, 'testSetup.js')],

  testMatch: [path.join(__dirname, 'test', '**/*.test.[jt]s?(x)')],
};
