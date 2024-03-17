import {
  addProjectConfiguration,
  readJson,
  readProjectConfiguration,
  updateJson,
  type NxJsonConfiguration,
  type Tree,
} from '@titan/devkit';
import * as devkit from '@titan/devkit';
import { createTreeWithEmptyWorkspace } from '@titan/devkit/testing';
import migration from './rename-webpack-dev-server';

describe('rename-webpack-dev-server migration', () => {
  let tree: Tree;

  beforeEach(() => {
    tree = createTreeWithEmptyWorkspace();
    jest
      .spyOn(devkit, 'formatFiles')
      .mockImplementation(() => Promise.resolve());
  });

  it('should replace @titan/angular:webpack-dev-server with @titan/angular:dev-server', async () => {
    addProjectConfiguration(tree, 'app1', {
      root: 'apps/app1',
      projectType: 'application',
      targets: {
        serve: {
          executor: '@titan/angular:webpack-dev-server',
          options: {},
          configurations: {},
        },
      },
    });

    await migration(tree);

    const project = readProjectConfiguration(tree, 'app1');
    expect(project.targets.serve.executor).toBe('@titan/angular:dev-server');
  });

  it('should replace @nrwl/angular:webpack-dev-server with @titan/angular:dev-server', async () => {
    addProjectConfiguration(tree, 'app1', {
      root: 'apps/app1',
      projectType: 'application',
      targets: {
        serve: {
          executor: '@nrwl/angular:webpack-dev-server',
          options: {},
          configurations: {},
        },
      },
    });

    await migration(tree);

    const project = readProjectConfiguration(tree, 'app1');
    expect(project.targets.serve.executor).toBe('@titan/angular:dev-server');
  });

  it('should replace @titan/angular:webpack-dev-server with @titan/angular:dev-server from nx.json targetDefaults keys', async () => {
    updateJson<NxJsonConfiguration>(tree, 'nx.json', (json) => {
      json.targetDefaults ??= {};
      json.targetDefaults['@titan/angular:webpack-dev-server'] = {
        options: {},
        configurations: {},
      };
      return json;
    });

    await migration(tree);

    const nxJson = readJson<NxJsonConfiguration>(tree, 'nx.json');
    expect(
      nxJson.targetDefaults['@titan/angular:webpack-dev-server']
    ).toBeUndefined();
    expect(nxJson.targetDefaults['@titan/angular:dev-server']).toBeDefined();
  });

  it('should replace @nrwl/angular:webpack-dev-server with @titan/angular:dev-server from nx.json targetDefaults keys', async () => {
    updateJson<NxJsonConfiguration>(tree, 'nx.json', (json) => {
      json.targetDefaults ??= {};
      json.targetDefaults['@nrwl/angular:webpack-dev-server'] = {
        options: {},
        configurations: {},
      };
      return json;
    });

    await migration(tree);

    const nxJson = readJson<NxJsonConfiguration>(tree, 'nx.json');
    expect(
      nxJson.targetDefaults['@nrwl/angular:webpack-dev-server']
    ).toBeUndefined();
    expect(nxJson.targetDefaults['@titan/angular:dev-server']).toBeDefined();
  });

  it('should replace @titan/angular:webpack-dev-server with @titan/angular:dev-server from nx.json targetDefaults value executors', async () => {
    updateJson<NxJsonConfiguration>(tree, 'nx.json', (json) => {
      json.targetDefaults ??= {};
      json.targetDefaults.serve = {
        executor: '@titan/angular:webpack-dev-server',
        options: {},
        configurations: {},
      };
      return json;
    });

    await migration(tree);

    const nxJson = readJson<NxJsonConfiguration>(tree, 'nx.json');
    expect(nxJson.targetDefaults.serve.executor).toBe('@titan/angular:dev-server');
  });

  it('should replace @nrwl/angular:webpack-dev-server with @titan/angular:dev-server from nx.json targetDefaults value executors', async () => {
    updateJson<NxJsonConfiguration>(tree, 'nx.json', (json) => {
      json.targetDefaults ??= {};
      json.targetDefaults.serve = {
        executor: '@nrwl/angular:webpack-dev-server',
        options: {},
        configurations: {},
      };
      return json;
    });

    await migration(tree);

    const nxJson = readJson<NxJsonConfiguration>(tree, 'nx.json');
    expect(nxJson.targetDefaults.serve.executor).toBe('@titan/angular:dev-server');
  });
});
