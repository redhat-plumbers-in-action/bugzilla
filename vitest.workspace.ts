import { defineWorkspace } from 'vitest/config';

export default defineWorkspace([
  {
    extends: './vitest.config.ts',
    test: {
      name: 'unit',
      root: './test',
    },
  },
  {
    extends: './vitest.config.ts',
    test: {
      name: 'integration',
      root: './itest',
      environment: './bugzilla-environment',
    },
  },
]);
