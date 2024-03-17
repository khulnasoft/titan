import type { Linter } from '@titan/eslint';

export interface StorybookConfigurationOptions {
  configureStaticServe?: boolean;
  generateStories: boolean;
  linter: Linter;
  project: string;
  tsConfiguration?: boolean;
  skipFormat?: boolean;
  ignorePaths?: string[];
  interactionTests?: boolean;
  configureCypress?: boolean;
  generateCypressSpecs?: boolean;
  cypressDirectory?: string;
}
