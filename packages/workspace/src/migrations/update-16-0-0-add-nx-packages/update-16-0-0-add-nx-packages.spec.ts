import { Tree, readJson, updateJson } from '@titan/devkit';
import { createTreeWithEmptyWorkspace } from '@titan/devkit/testing';
import replacePackage from './update-16-0-0-add-nx-packages';

describe('update-16-0-0-add-nx-packages', () => {
  let tree: Tree;
  beforeEach(() => {
    tree = createTreeWithEmptyWorkspace();

    updateJson(tree, 'package.json', (json) => {
      json.devDependencies['@nrwl/workspace'] = '16.0.0';
      return json;
    });
  });

  it('should remove the dependency on @nrwl/workspace', async () => {
    await replacePackage(tree);

    expect(
      readJson(tree, 'package.json').dependencies['@nrwl/workspace']
    ).not.toBeDefined();
    expect(
      readJson(tree, 'package.json').devDependencies['@nrwl/workspace']
    ).not.toBeDefined();
  });

  it('should add a dependency on @nx/workspace', async () => {
    await replacePackage(tree);

    const packageJson = readJson(tree, 'package.json');
    const newDependencyVersion =
      packageJson.devDependencies['@nx/workspace'] ??
      packageJson.dependencies['@nx/workspace'];

    expect(newDependencyVersion).toBeDefined();
  });
});
