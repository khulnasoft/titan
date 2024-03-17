import type { ProjectConfiguration, Tree } from '@titan/devkit';
import { joinPathFragments, updateProjectConfiguration } from '@titan/devkit';

import { SetupTailwindOptions } from '../schema';

export function updateProject(
  tree: Tree,
  config: ProjectConfiguration,
  options: SetupTailwindOptions
) {
  if (
    config?.targets?.build?.executor === '@nx/webpack:webpack' ||
    config?.targets?.build?.executor === '@nrwl/webpack:webpack'
  ) {
    config.targets.build.options ??= {};
    config.targets.build.options.postcssConfig = joinPathFragments(
      config.root,
      'postcss.config.js'
    );
    updateProjectConfiguration(tree, options.project, config);
  }
}
