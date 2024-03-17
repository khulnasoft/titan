import type { Tree } from '@titan/devkit';
import {
  readProjectConfiguration,
  updateProjectConfiguration,
} from '@titan/devkit';
import type { Schema } from '../schema';

export function setupServeTarget(host: Tree, options: Schema) {
  const appConfig = readProjectConfiguration(host, options.appName);

  appConfig.targets['serve'] = {
    ...appConfig.targets['serve'],
    executor:
      options.mfType === 'host'
        ? '@titan/angular:module-federation-dev-server'
        : '@titan/angular:dev-server',
    options: {
      ...appConfig.targets['serve'].options,
      port: options.port ?? undefined,
      publicHost: `http://localhost:${options.port ?? 4200}`,
    },
  };

  if (options.mfType === 'remote') {
    appConfig.targets['serve-static'] = {
      executor: '@nx/web:file-server',
      defaultConfiguration: 'production',
      options: {
        buildTarget: `${options.appName}:build`,
        port: options.port,
        watch: false,
      },
      configurations: {
        development: {
          buildTarget: `${options.appName}:build:development`,
        },
        production: {
          buildTarget: `${options.appName}:build:production`,
        },
      },
    };
  }

  updateProjectConfiguration(host, options.appName, appConfig);
}
