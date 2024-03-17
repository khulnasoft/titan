import { ProjectNameAndRootFormat } from '@titan/devkit/src/generators/project-name-and-root-utils';
import type { Linter } from '@titan/eslint';

export interface NxRemixGeneratorSchema {
  name: string;
  tags?: string;
  js?: boolean;
  directory?: string;
  projectNameAndRootFormat?: ProjectNameAndRootFormat;
  linter?: Linter;
  unitTestRunner?: 'vitest' | 'jest' | 'none';
  e2eTestRunner?: 'cypress' | 'playwright' | 'none';
  skipFormat?: boolean;
  rootProject?: boolean;
  addPlugin?: boolean;
}
