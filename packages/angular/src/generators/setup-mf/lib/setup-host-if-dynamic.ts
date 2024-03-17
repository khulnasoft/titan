import type { Tree } from '@titan/devkit';
import {
  joinPathFragments,
  readProjectConfiguration,
  updateProjectConfiguration,
} from '@titan/devkit';
import type { Schema } from '../schema';

export function setupHostIfDynamic(tree: Tree, options: Schema) {
  if (options.federationType === 'static') {
    return;
  }

  const project = readProjectConfiguration(tree, options.appName);
  const pathToMFManifest = joinPathFragments(
    project.sourceRoot,
    'assets/module-federation.manifest.json'
  );

  if (!tree.exists(pathToMFManifest)) {
    tree.write(pathToMFManifest, '{}');
  }

  const pathToProdWebpackConfig = joinPathFragments(
    project.root,
    `webpack.prod.config.${options.typescriptConfiguration ? 'ts' : 'js'}`
  );
  if (tree.exists(pathToProdWebpackConfig)) {
    tree.delete(pathToProdWebpackConfig);
  }

  delete project.targets.build.configurations.production?.customWebpackConfig;

  updateProjectConfiguration(tree, options.appName, project);
}
