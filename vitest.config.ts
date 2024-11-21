import { configDefaults, defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    exclude: [...configDefaults.exclude],
    fileParallelism: false,
    testTimeout: 10000,
  },
});
