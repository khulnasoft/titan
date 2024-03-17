import { addDependenciesToPackageJson, readJson, Tree } from '@titan/devkit';
import { createTreeWithEmptyWorkspace } from '@titan/devkit/testing';

import { nxVersion } from '../../utils/versions';

import webInitGenerator from './init';

describe('init', () => {
  let tree: Tree;

  beforeEach(() => {
    tree = createTreeWithEmptyWorkspace();
  });

  it('should add web dependencies', async () => {
    const existing = 'existing';
    const existingVersion = '1.0.0';
    addDependenciesToPackageJson(
      tree,
      {
        '@nx/web': nxVersion,
        [existing]: existingVersion,
      },
      {
        [existing]: existingVersion,
      }
    );
    await webInitGenerator(tree, {});
    const packageJson = readJson(tree, 'package.json');
    expect(packageJson.devDependencies['@nx/web']).toBeDefined();
    expect(packageJson.devDependencies[existing]).toBeDefined();
    expect(packageJson.dependencies['@nx/web']).toBeUndefined();
    expect(packageJson.dependencies[existing]).toBeDefined();
  });
});
