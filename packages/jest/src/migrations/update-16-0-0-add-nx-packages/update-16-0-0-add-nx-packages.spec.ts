import { Tree, readJson, updateJson } from '@titan/devkit';
import { createTreeWithEmptyWorkspace } from '@titan/devkit/testing';
import replacePackage from './update-16-0-0-add-nx-packages';

describe('update-16-0-0-add-nx-packages', () => {
  let tree: Tree;
  beforeEach(() => {
    tree = createTreeWithEmptyWorkspace();

    updateJson(tree, 'package.json', (json) => {
      json.devDependencies['@nrwl/jest'] = '16.0.0';
      return json;
    });
  });

  it('should remove the dependency on @nrwl/jest', async () => {
    await replacePackage(tree);

    expect(
      readJson(tree, 'package.json').dependencies['@nrwl/jest']
    ).not.toBeDefined();
    expect(
      readJson(tree, 'package.json').devDependencies['@nrwl/jest']
    ).not.toBeDefined();
  });

  it('should add a dependency on @titan/jest', async () => {
    await replacePackage(tree);

    const packageJson = readJson(tree, 'package.json');
    const newDependencyVersion =
      packageJson.devDependencies['@titan/jest'] ??
      packageJson.dependencies['@titan/jest'];

    expect(newDependencyVersion).toBeDefined();
  });
});
