import type { Tree } from '@titan/devkit';
import { Linter } from '@titan/eslint';
import { createTreeWithEmptyWorkspace } from '@titan/devkit/testing';
import { normalizeOptions } from './normalize-options';

describe('normalizeOptions', () => {
  let tree: Tree;

  beforeEach(() => {
    tree = createTreeWithEmptyWorkspace();
  });

  it('should set importPath and projectRoot', async () => {
    const options = await normalizeOptions(tree, {
      name: 'my-lib',
      style: 'css',
      linter: Linter.None,
      unitTestRunner: 'jest',
    });

    expect(options).toMatchObject({
      importPath: '@proj/my-lib',
      projectRoot: 'my-lib',
    });
  });
});
