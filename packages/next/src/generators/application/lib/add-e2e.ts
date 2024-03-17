import {
  addProjectConfiguration,
  ensurePackage,
  getPackageManagerCommand,
  joinPathFragments,
  readNxJson,
  Tree,
} from '@titan/devkit';
import { Linter } from '@titan/eslint';

import { nxVersion } from '../../../utils/versions';
import { NormalizedSchema } from './normalize-options';
import { webStaticServeGenerator } from '@nx/web';

export async function addE2e(host: Tree, options: NormalizedSchema) {
  const nxJson = readNxJson(host);
  const hasPlugin = nxJson.plugins?.some((p) =>
    typeof p === 'string'
      ? p === '@titan/next/plugin'
      : p.plugin === '@titan/next/plugin'
  );

  if (options.e2eTestRunner === 'cypress') {
    const { configurationGenerator } = ensurePackage<
      typeof import('@titan/cypress')
    >('@titan/cypress', nxVersion);

    if (!hasPlugin) {
      webStaticServeGenerator(host, {
        buildTarget: `${options.projectName}:build`,
        outputPath: `${options.outputPath}/out`,
        targetName: 'serve-static',
      });
    }

    addProjectConfiguration(host, options.e2eProjectName, {
      root: options.e2eProjectRoot,
      sourceRoot: joinPathFragments(options.e2eProjectRoot, 'src'),
      targets: {},
      tags: [],
      implicitDependencies: [options.projectName],
    });

    return configurationGenerator(host, {
      ...options,
      linter: Linter.EsLint,
      project: options.e2eProjectName,
      directory: 'src',
      skipFormat: true,
      devServerTarget: `${options.projectName}:${
        hasPlugin ? 'start' : 'serve'
      }`,
      baseUrl: `http://localhost:${hasPlugin ? '3000' : '4200'}`,
      jsx: true,
      webServerCommands: hasPlugin
        ? {
            default: `nx run ${options.projectName}:start`,
          }
        : undefined,
      ciWebServerCommand: hasPlugin
        ? `nx run ${options.projectName}:serve-static`
        : undefined,
    });
  } else if (options.e2eTestRunner === 'playwright') {
    const { configurationGenerator } = ensurePackage<
      typeof import('@titan/playwright')
    >('@titan/playwright', nxVersion);
    addProjectConfiguration(host, options.e2eProjectName, {
      root: options.e2eProjectRoot,
      sourceRoot: joinPathFragments(options.e2eProjectRoot, 'src'),
      targets: {},
      implicitDependencies: [options.projectName],
    });
    return configurationGenerator(host, {
      rootProject: options.rootProject,
      project: options.e2eProjectName,
      skipFormat: true,
      skipPackageJson: options.skipPackageJson,
      directory: 'src',
      js: false,
      linter: options.linter,
      setParserOptionsProject: options.setParserOptionsProject,
      webServerAddress: `http://127.0.0.1:${hasPlugin ? '3000' : '4200'}`,
      webServerCommand: `${getPackageManagerCommand().exec} nx ${
        hasPlugin ? 'start' : 'serve'
      } ${options.projectName}`,
      addPlugin: options.addPlugin,
    });
  }
  return () => {};
}
