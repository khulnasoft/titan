import { NormalizedJestProjectSchema } from '../schema';
import {
  readProjectConfiguration,
  Tree,
  updateProjectConfiguration,
  joinPathFragments,
  normalizePath,
} from '@titan/devkit';

export function updateWorkspace(
  tree: Tree,
  options: NormalizedJestProjectSchema
) {
  const projectConfig = readProjectConfiguration(tree, options.project);
  if (!projectConfig.targets) {
    projectConfig.targets = {};
  }

  projectConfig.targets[options.targetName] = {
    executor: '@titan/jest:jest',
    outputs: [
      options.rootProject
        ? joinPathFragments('{workspaceRoot}', 'coverage', '{projectName}')
        : joinPathFragments('{workspaceRoot}', 'coverage', '{projectRoot}'),
    ],
    options: {
      jestConfig: joinPathFragments(
        normalizePath(projectConfig.root),
        `jest.config.${options.js ? 'js' : 'ts'}`
      ),
    },
  };

  updateProjectConfiguration(tree, options.project, projectConfig);
}
