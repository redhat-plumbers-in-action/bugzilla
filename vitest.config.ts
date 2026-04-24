import { configDefaults, defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    exclude: [...configDefaults.exclude],
    fileParallelism: false,
    testTimeout: 10000,
    projects: [
      {
        test: {
          name: 'unit',
          root: './test',
        },
      },
      {
        test: {
          name: 'integration',
          root: './itest',
          environment: './itest/bugzilla-environment',
          globalSetup: './global-setup.ts',
          testTimeout: 60000,
          hookTimeout: 60000,
        },
      },
    ],
  },
});
