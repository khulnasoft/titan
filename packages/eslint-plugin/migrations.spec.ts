import json = require('./migrations.json');

import { assertValidMigrationPaths } from '@titan/devkit/internal-testing-utils';

describe('eslint-plugin migrations', () => {
  assertValidMigrationPaths(json, __dirname);
});
