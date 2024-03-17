import { createTreeWithEmptyWorkspace } from '@titan/devkit/testing';
import { readJson, NxJsonConfiguration, Tree } from '@titan/devkit';

import { nextInitGenerator } from './init';

describe('init', () => {
  let tree: Tree;

  beforeEach(() => {
    tree = createTreeWithEmptyWorkspace();
  });

  it('should add react dependencies', async () => {
    await nextInitGenerator(tree, {});
    const packageJson = readJson(tree, 'package.json');
    expect(packageJson.dependencies['@nx/react']).toBeUndefined();
    expect(packageJson.devDependencies['@titan/next']).toBeDefined();
    expect(packageJson.dependencies['next']).toBeDefined();
  });
});
