import { Linter } from '@titan/eslint';

export interface Schema {
  project: string;
  interactionTests?: boolean;
  generateStories?: boolean;
  js?: boolean;
  tsConfiguration?: boolean;
  linter?: Linter;
  ignorePaths?: string[];
  configureStaticServe?: boolean;
}
