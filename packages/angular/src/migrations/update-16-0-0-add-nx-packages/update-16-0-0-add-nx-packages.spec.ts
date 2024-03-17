import { Tree, readJson, updateJson } from '@titan/devkit';
import * as devkit from '@titan/devkit';
import { createTreeWithEmptyWorkspace } from '@titan/devkit/testing';
import replacePackage from './update-16-0-0-add-nx-packages';

describe('update-16-0-0-add-nx-packages', () => {
  let tree: Tree;
  beforeEach(() => {
    tree = createTreeWithEmptyWorkspace();
    jest
      .spyOn(devkit, 'formatFiles')
      .mockImplementation(() => Promise.resolve());

    updateJson(tree, 'package.json', (json) => {
      json.devDependencies['@nrwl/angular'] = '16.0.0';
      return json;
    });
  });

  it('should remove the dependency on @nrwl/angular', async () => {
    await replacePackage(tree);

    expect(
      readJson(tree, 'package.json').dependencies['@nrwl/angular']
    ).not.toBeDefined();
    expect(
      readJson(tree, 'package.json').devDependencies['@nrwl/angular']
    ).not.toBeDefined();
  });

  it('should add a dependency on @titan/angular', async () => {
    await replacePackage(tree);

    const packageJson = readJson(tree, 'package.json');
    const newDependencyVersion =
      packageJson.devDependencies['@titan/angular'] ??
      packageJson.dependencies['@titan/angular'];

    expect(newDependencyVersion).toBeDefined();
  });
});
