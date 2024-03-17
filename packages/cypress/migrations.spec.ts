import json = require('./migrations.json');

import { assertValidMigrationPaths } from '@titan/devkit/internal-testing-utils';

describe('Cypress migrations', () => {
  assertValidMigrationPaths(json, __dirname);
});
