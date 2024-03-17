import type { ServerBuilderOptions } from '@angular-devkit/build-angular';
import type { Tree } from '@titan/devkit';
import {
  formatFiles,
  readProjectConfiguration,
  updateProjectConfiguration,
} from '@titan/devkit';
import { forEachExecutorOptions } from '@titan/devkit/src/generators/executor-options-utils';

const executors = [
  '@angular-devkit/build-angular:server',
  '@titan/angular:server',
  '@nrwl/angular:server',
];

export default async function (tree: Tree) {
  executors.forEach((executor) => {
    forEachExecutorOptions<ServerBuilderOptions>(
      tree,
      executor,
      (_options, projectName, targetName, configurationName) => {
        const projectConfiguration = readProjectConfiguration(
          tree,
          projectName
        );
        const configToUpdate: ServerBuilderOptions = configurationName
          ? projectConfiguration.targets[targetName].configurations[
              configurationName
            ]
          : projectConfiguration.targets[targetName].options;

        if (
          configToUpdate.buildOptimizer === undefined &&
          configToUpdate.optimization !== undefined
        ) {
          configToUpdate.buildOptimizer = !!configToUpdate.optimization;
        }

        updateProjectConfiguration(tree, projectName, projectConfiguration);
      }
    );
  });

  await formatFiles(tree);
}
