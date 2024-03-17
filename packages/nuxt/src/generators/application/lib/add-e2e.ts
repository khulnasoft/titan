import {
  addProjectConfiguration,
  ensurePackage,
  getPackageManagerCommand,
  joinPathFragments,
  Tree,
} from '@titan/devkit';
import { nxVersion } from '../../../utils/versions';
import { NormalizedSchema } from '../schema';

export async function addE2e(host: Tree, options: NormalizedSchema) {
  if (options.e2eTestRunner === 'cypress') {
    const { configurationGenerator } = ensurePackage<
      typeof import('@titan/cypress')
    >('@titan/cypress', nxVersion);
    addProjectConfiguration(host, options.e2eProjectName, {
      projectType: 'application',
      root: options.e2eProjectRoot,
      sourceRoot: joinPathFragments(options.e2eProjectRoot, 'src'),
      targets: {},
      tags: [],
      implicitDependencies: [options.projectName],
    });
    return await configurationGenerator(host, {
      ...options,
      project: options.e2eProjectName,
      directory: 'src',
      bundler: 'vite',
      skipFormat: true,
      devServerTarget: `${options.projectName}:serve`,
      webServerCommands: {
        default: `${getPackageManagerCommand().exec} nx serve ${
          options.projectName
        }`,
      },
      ciWebServerCommand: `nx run ${options.projectName}:serve-static`,
      baseUrl: 'http://localhost:4200',
      jsx: true,
      addPlugin: true,
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
      project: options.e2eProjectName,
      skipFormat: true,
      skipPackageJson: options.skipPackageJson,
      directory: 'src',
      js: false,
      linter: options.linter,
      setParserOptionsProject: options.setParserOptionsProject,
      webServerAddress: 'http://localhost:4200',
      webServerCommand: `${getPackageManagerCommand().exec} nx serve ${
        options.projectName
      }`,
      addPlugin: true,
    });
  }
  return () => {};
}
