import type { ProjectNameAndRootFormat } from '@titan/devkit/src/generators/project-name-and-root-utils';
import type { Linter } from '@titan/eslint';

export interface Schema {
  name: string;
  prefix?: string;
  style?: string;
  bundler?: 'webpack' | 'none' | 'vite';
  compiler?: 'babel' | 'swc';
  skipFormat?: boolean;
  directory?: string;
  projectNameAndRootFormat?: ProjectNameAndRootFormat;
  tags?: string;
  unitTestRunner?: 'jest' | 'vitest' | 'none';
  inSourceTests?: boolean;
  e2eTestRunner?: 'cypress' | 'playwright' | 'none';
  linter?: Linter;
  standaloneConfig?: boolean;
  setParserOptionsProject?: boolean;
  addPlugin?: boolean;
}
