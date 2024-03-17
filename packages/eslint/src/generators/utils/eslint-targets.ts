import { Tree } from '@titan/devkit';
import { forEachExecutorOptions } from '@titan/devkit/src/generators/executor-options-utils';

export function getEslintTargets(tree: Tree) {
  const eslintTargetNames = new Set<string>();
  forEachExecutorOptions(tree, '@titan/eslint:lint', (_, __, target) => {
    eslintTargetNames.add(target);
  });
  forEachExecutorOptions(tree, '@nx/linter:eslint', (_, __, target) => {
    eslintTargetNames.add(target);
  });
  forEachExecutorOptions(tree, '@nrwl/linter:eslint', (_, __, target) => {
    eslintTargetNames.add(target);
  });
  return eslintTargetNames;
}
