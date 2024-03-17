import type { Tree } from '@titan/devkit';
import { readProjectConfiguration } from '@titan/devkit';
import type { AngularProjectConfiguration } from '../../utils/types';

export function getProjectPrefix(
  tree: Tree,
  project: string
): string | undefined {
  return (
    readProjectConfiguration(tree, project) as AngularProjectConfiguration
  ).prefix;
}
