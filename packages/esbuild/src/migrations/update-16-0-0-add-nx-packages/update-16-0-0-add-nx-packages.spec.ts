import { Tree, readJson, updateJson } from '@titan/devkit';
import { createTreeWithEmptyWorkspace } from '@titan/devkit/testing';
import replacePackage from './update-16-0-0-add-nx-packages';

describe('update-16-0-0-add-nx-packages', () => {
  let tree: Tree;
  beforeEach(() => {
    tree = createTreeWithEmptyWorkspace();

    updateJson(tree, 'package.json', (json) => {
      json.devDependencies['@nrwl/esbuild'] = '16.0.0';
      return json;
    });
  });

  it('should remove the dependency on @nrwl/esbuild', async () => {
    await replacePackage(tree);

    expect(
      readJson(tree, 'package.json').dependencies['@nrwl/esbuild']
    ).not.toBeDefined();
    expect(
      readJson(tree, 'package.json').devDependencies['@nrwl/esbuild']
    ).not.toBeDefined();
  });

  it('should add a dependency on @titan/esbuild', async () => {
    await replacePackage(tree);

    const packageJson = readJson(tree, 'package.json');
    const newDependencyVersion =
      packageJson.devDependencies['@titan/esbuild'] ??
      packageJson.dependencies['@titan/esbuild'];

    expect(newDependencyVersion).toBeDefined();
  });
});
