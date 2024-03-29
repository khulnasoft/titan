import addMfEnvVarToTargetDefaults from './add-mf-env-var-to-target-defaults';
import { createTreeWithEmptyWorkspace } from '@titan/devkit/testing';
import { addProjectConfiguration, readNxJson, updateNxJson } from '@titan/devkit';

describe('addMfEnvVarToTargetDefaults', () => {
  it('should add the executor and input when it does not exist', async () => {
    // ARRANGE
    const tree = createTreeWithEmptyWorkspace();
    addProjectConfiguration(tree, 'test', {
      root: '',
      targets: {
        build: {
          executor: '@titan/angular:webpack-browser',
        },
      },
    });

    tree.write('module-federation.config.ts', '');

    // ACT
    await addMfEnvVarToTargetDefaults(tree);

    // ASSERT
    const nxJson = readNxJson(tree);
    expect(nxJson.targetDefaults).toMatchInlineSnapshot(`
      {
        "@titan/angular:webpack-browser": {
          "inputs": [
            "production",
            "^production",
            {
              "env": "NX_MF_DEV_SERVER_STATIC_REMOTES",
            },
          ],
        },
        "build": {
          "cache": true,
        },
        "lint": {
          "cache": true,
        },
      }
    `);
  });

  it('should not add the executor and input when no project uses it', async () => {
    // ARRANGE
    const tree = createTreeWithEmptyWorkspace();
    addProjectConfiguration(tree, 'test', {
      root: '',
      targets: {
        build: {
          executor: '@titan/angular:module-federation-dev-server',
        },
      },
    });

    // ACT
    await addMfEnvVarToTargetDefaults(tree);

    // ASSERT
    const nxJson = readNxJson(tree);
    expect(nxJson.targetDefaults).toMatchInlineSnapshot(`
      {
        "build": {
          "cache": true,
        },
        "lint": {
          "cache": true,
        },
      }
    `);
  });

  it('should update the executor and input target default when it already exists', async () => {
    // ARRANGE
    const tree = createTreeWithEmptyWorkspace();
    addProjectConfiguration(tree, 'test', {
      root: '',
      targets: {
        build: {
          executor: '@titan/angular:webpack-browser',
        },
      },
    });
    tree.write('module-federation.config.ts', '');

    let nxJson = readNxJson(tree);
    nxJson = {
      ...nxJson,
      targetDefaults: {
        ...nxJson.targetDefaults,
        ['@titan/angular:webpack-browser']: {
          inputs: ['^build'],
        },
      },
    };

    updateNxJson(tree, nxJson);

    // ACT
    await addMfEnvVarToTargetDefaults(tree);

    // ASSERT
    nxJson = readNxJson(tree);
    expect(nxJson.targetDefaults).toMatchInlineSnapshot(`
      {
        "@titan/angular:webpack-browser": {
          "inputs": [
            "^build",
            {
              "env": "NX_MF_DEV_SERVER_STATIC_REMOTES",
            },
          ],
        },
        "build": {
          "cache": true,
        },
        "lint": {
          "cache": true,
        },
      }
    `);
  });
});
