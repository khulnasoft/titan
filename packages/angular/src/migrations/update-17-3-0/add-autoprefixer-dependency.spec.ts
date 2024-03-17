import { addProjectConfiguration, readJson, type Tree } from '@titan/devkit';
import { createTreeWithEmptyWorkspace } from '@titan/devkit/testing';
import migration from './add-autoprefixer-dependency';

describe('add-autoprefixer-dependency migration', () => {
  let tree: Tree;

  beforeEach(() => {
    tree = createTreeWithEmptyWorkspace();
  });

  it('should add "autoprefixer" as devDependencies when "@titan/angular:ng-packagr-lite" is used', async () => {
    addProjectConfiguration(tree, 'my-lib', {
      root: 'libs/my-lib',
      projectType: 'library',
      targets: {
        build: {
          executor: '@titan/angular:ng-packagr-lite',
        },
      },
    });

    await migration(tree);

    const { devDependencies } = readJson(tree, 'package.json');
    expect(devDependencies['autoprefixer']).toEqual('^10.4.0');
  });

  it('should add "autoprefixer" as devDependencies when "@titan/angular:package" is used', async () => {
    addProjectConfiguration(tree, 'my-lib', {
      root: 'libs/my-lib',
      projectType: 'library',
      targets: {
        build: {
          executor: '@titan/angular:package',
        },
      },
    });

    await migration(tree);

    const { devDependencies } = readJson(tree, 'package.json');
    expect(devDependencies['autoprefixer']).toEqual('^10.4.0');
  });

  it('should not add "autoprefixer" as devDependencies when relevant executors are not used', async () => {
    addProjectConfiguration(tree, 'my-lib', {
      root: 'libs/my-lib',
      projectType: 'library',
      targets: {
        build: {
          executor: '@angular-devkit/build-angular:ng-packagr',
        },
      },
    });

    await migration(tree);

    const { devDependencies } = readJson(tree, 'package.json');
    expect(devDependencies['autoprefixer']).toBeUndefined();
  });
});
