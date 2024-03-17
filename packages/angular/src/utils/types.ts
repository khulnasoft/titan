import type { ProjectConfiguration } from '@titan/devkit';

export type AngularProjectConfiguration = ProjectConfiguration & {
  prefix?: string;
};
