module.exports = {
  projects: [
    {
      // eslint-disable-next-line global-require
      ...require('./jest.config'),
      displayName: 'test',
    },
    {
      // eslint-disable-next-line global-require
      ...require('./itest/jest.ci.config'),
      displayName: 'itest',
    },
  ],
};
