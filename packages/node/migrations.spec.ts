import json = require('./migrations.json');

import { assertValidMigrationPaths } from '@titan/devkit/internal-testing-utils';
import { MigrationsJson } from '@titan/devkit';

describe('node migrations', () => {
  assertValidMigrationPaths(json as MigrationsJson, __dirname);
});
