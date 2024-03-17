import json = require('./migrations.json');

import { assertValidMigrationPaths } from '@titan/devkit/internal-testing-utils';
import { MigrationsJson } from '@titan/devkit';

jest.mock('vite', () => ({
  loadConfigFromFile: jest.fn().mockImplementation(() => {
    return Promise.resolve({
      path: 'vite.config.ts',
      config: {},
      dependencies: [],
    });
  }),
}));

describe('vite migrations', () => {
  assertValidMigrationPaths(json as MigrationsJson, __dirname);
});
