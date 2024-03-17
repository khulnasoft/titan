import { readJson, Tree } from '@titan/devkit';
import { createTreeWithEmptyWorkspace } from '@titan/devkit/testing';
import { vueInitGenerator } from './init';

describe('init', () => {
  let tree: Tree;

  beforeEach(() => {
    tree = createTreeWithEmptyWorkspace();
  });

  it('should add vue dependencies', async () => {
    await vueInitGenerator(tree, { skipFormat: false });
    const packageJson = readJson(tree, 'package.json');
    expect(packageJson).toMatchSnapshot();
  });
});
