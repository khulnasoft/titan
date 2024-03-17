import json = require('./migrations.json');

import { assertValidMigrationPaths } from '@titan/devkit/internal-testing-utils';

describe('Detox migrations', () => {
  assertValidMigrationPaths(json, __dirname);
});
