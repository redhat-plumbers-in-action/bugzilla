module.exports = {
  parserOptions: {
    tsconfigRootDir: __dirname,
    project: ['./tsconfig.json'],
  },

  ignorePatterns: ['node_modules', 'dist', 'coverage'],

  extends: [require.resolve('@mossop/config/node-ts/eslintrc')],
};
