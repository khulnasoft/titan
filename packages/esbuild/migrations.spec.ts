import json = require('./migrations.json');

import { assertValidMigrationPaths } from '@titan/devkit/internal-testing-utils';

describe('esbuild migrations', () => {
  assertValidMigrationPaths(json, __dirname);
});
