import { addProjectConfiguration, Tree } from '@titan/devkit';
import { createTreeWithEmptyWorkspace } from '@titan/devkit/testing';

export function createTreeWithNestApplication(appName: string): Tree {
  const tree = createTreeWithEmptyWorkspace();
  addProjectConfiguration(tree, appName, {
    root: `${appName}`,
    sourceRoot: `${appName}/src`,
    projectType: 'application',
    targets: {},
  });
  return tree;
}
