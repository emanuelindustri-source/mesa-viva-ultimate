import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: [
      'packages/*/tests/**/*.test.ts',
      'apps/*/src/**/*.test.ts',
      'apps/*/src/**/*.test.tsx',
    ],
    environment: 'node',
    coverage: {
      provider: 'v8',
      include: [
        'packages/core/src/**/*.ts',
        'packages/design-system/src/**/*.ts',
        'packages/sensory-engine/src/**/*.ts',
      ],
      exclude: [
        'packages/core/src/index.ts',
        'packages/core/src/**/types.ts',
        'packages/design-system/src/index.ts',
        'packages/design-system/src/**/index.ts',
        'packages/design-system/src/**/types.ts',
        'packages/design-system/src/**/*-types.ts',
        'packages/design-system/src/version.ts',
        'packages/sensory-engine/src/index.ts',
        'packages/sensory-engine/src/version.ts',
        'packages/sensory-engine/src/**/types.ts',
        'packages/sensory-engine/src/audio/contracts.ts',
        'packages/sensory-engine/src/session-types.ts',
      ],
      reporter: ['text', 'json-summary'],
      thresholds: {
        lines: 85,
        functions: 85,
        statements: 85,
        branches: 80,
      },
    },
  },
});
