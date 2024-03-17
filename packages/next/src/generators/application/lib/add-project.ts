import { NormalizedSchema } from './normalize-options';
import {
  addProjectConfiguration,
  ProjectConfiguration,
  readNxJson,
  Tree,
} from '@titan/devkit';
import { addBuildTargetDefaults } from '@titan/devkit/src/generators/add-build-target-defaults';

export function addProject(host: Tree, options: NormalizedSchema) {
  const targets: Record<string, any> = {};

  // Check if plugin exists in nx.json and if it doesn't then we can continue
  // with the default targets.

  const nxJson = readNxJson(host);
  const hasPlugin = nxJson.plugins?.some((p) =>
    typeof p === 'string'
      ? p === '@titan/next/plugin'
      : p.plugin === '@titan/next/plugin'
  );

  if (!hasPlugin) {
    addBuildTargetDefaults(host, '@titan/next:build');

    targets.build = {
      executor: '@titan/next:build',
      outputs: ['{options.outputPath}'],
      defaultConfiguration: 'production',
      options: {
        outputPath: options.outputPath,
      },
      configurations: {
        development: {
          outputPath: options.appProjectRoot,
        },
        production: {},
      },
    };

    targets.serve = {
      executor: '@titan/next:server',
      defaultConfiguration: 'development',
      options: {
        buildTarget: `${options.projectName}:build`,
        dev: true,
      },
      configurations: {
        development: {
          buildTarget: `${options.projectName}:build:development`,
          dev: true,
        },
        production: {
          buildTarget: `${options.projectName}:build:production`,
          dev: false,
        },
      },
    };

    targets.export = {
      executor: '@titan/next:export',
      options: {
        buildTarget: `${options.projectName}:build:production`,
      },
    };
  }

  const project: ProjectConfiguration = {
    root: options.appProjectRoot,
    sourceRoot: options.appProjectRoot,
    projectType: 'application',
    targets,
    tags: options.parsedTags,
  };

  addProjectConfiguration(host, options.projectName, {
    ...project,
  });
}
