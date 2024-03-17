import type { Tree } from '@titan/devkit';
import type { Schema } from '../schema';

import {
  readProjectConfiguration,
  updateProjectConfiguration,
} from '@titan/devkit';

export function changeBuildTarget(host: Tree, options: Schema) {
  const appConfig = readProjectConfiguration(host, options.appName);

  const configExtName = options.typescriptConfiguration ? 'ts' : 'js';

  appConfig.targets.build.executor = '@titan/angular:webpack-browser';
  appConfig.targets.build.options = {
    ...appConfig.targets.build.options,
    customWebpackConfig: {
      path: `${appConfig.root}/webpack.config.${configExtName}`,
    },
  };

  appConfig.targets.build.configurations.production = {
    ...appConfig.targets.build.configurations.production,
    customWebpackConfig: {
      path: `${appConfig.root}/webpack.prod.config.${configExtName}`,
    },
  };

  updateProjectConfiguration(host, options.appName, appConfig);
}
