import {
  readProjectConfiguration,
  Tree,
  updateProjectConfiguration,
} from '@titan/devkit';
import { forEachExecutorOptions } from '@titan/devkit/src/generators/executor-options-utils';

export default async function update(tree: Tree) {
  forEachExecutorOptions(
    tree,
    '@titan/next:build',
    (options, projectName, targetName) => {
      const projectConfig = readProjectConfiguration(tree, projectName);
      delete projectConfig.targets[targetName].options.root;
      updateProjectConfiguration(tree, projectName, projectConfig);
    }
  );
  forEachExecutorOptions(
    tree,
    '@nrwl/next:build',
    (options, projectName, targetName) => {
      const projectConfig = readProjectConfiguration(tree, projectName);
      delete projectConfig.targets[targetName].options.root;
      updateProjectConfiguration(tree, projectName, projectConfig);
    }
  );
}
