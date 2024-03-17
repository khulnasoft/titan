import {
  NxJsonConfiguration,
  PackageManager,
  readJson,
  readNxJson,
  Tree,
  updateJson,
  writeJson,
} from '@titan/devkit';
import { createTreeWithEmptyWorkspace } from '@titan/devkit/testing';
import { ciWorkflowGenerator } from './ci-workflow';
import { vol } from 'memfs';

jest.mock('@titan/devkit', () => ({
  ...jest.requireActual<any>('@titan/devkit'),
  workspaceRoot: '/root',
}));

jest.mock('fs', () => {
  const memFs = require('memfs').fs;
  const actualFs = jest.requireActual<any>('fs');
  return {
    ...jest.requireActual<any>('fs'),
    existsSync: (p) =>
      p.endsWith('yarn.lock') || p.endsWith('pnpm-lock.yaml')
        ? memFs.existsSync(p)
        : actualFs.existsSync(p),
  };
});

describe('CI Workflow generator', () => {
  let tree: Tree;

  beforeEach(() => {
    tree = createTreeWithEmptyWorkspace({ layout: 'apps-libs' });
  });

  afterEach(() => {
    vol.reset();
  });

  ['npm', 'yarn', 'pnpm'].forEach((packageManager: PackageManager) => {
    describe(`with ${packageManager}`, () => {
      beforeEach(() => {
        let fileSys;
        if (packageManager === 'yarn') {
          fileSys = { 'yarn.lock': '' };
        } else if (packageManager === 'pnpm') {
          fileSys = { 'pnpm-lock.yaml': '' };
        } else {
          fileSys = { 'package-lock.json': '' };
        }
        vol.fromJSON(fileSys, '');
      });

      it('should generate github CI config', async () => {
        setNxCloud(tree);
        await ciWorkflowGenerator(tree, { ci: 'github', name: 'CI' });

        expect(
          tree.read('.github/workflows/ci.yml', 'utf-8')
        ).toMatchSnapshot();
      });

      it('should generate circleci CI config', async () => {
        setNxCloud(tree);
        await ciWorkflowGenerator(tree, { ci: 'circleci', name: 'CI' });

        expect(tree.read('.circleci/config.yml', 'utf-8')).toMatchSnapshot();
      });

      it('should generate azure CI config', async () => {
        setNxCloud(tree);
        await ciWorkflowGenerator(tree, { ci: 'azure', name: 'CI' });

        expect(tree.read('azure-pipelines.yml', 'utf-8')).toMatchSnapshot();
      });

      it('should generate github CI config with custom name', async () => {
        setNxCloud(tree);
        await ciWorkflowGenerator(tree, {
          ci: 'github',
          name: 'My custom-workflow',
        });

        expect(
          tree.read('.github/workflows/my-custom-workflow.yml', 'utf-8')
        ).toMatchSnapshot();
      });

      it('should generate bitbucket pipelines config', async () => {
        setNxCloud(tree);
        await ciWorkflowGenerator(tree, {
          ci: 'bitbucket-pipelines',
          name: 'CI',
        });

        expect(tree.read('bitbucket-pipelines.yml', 'utf-8')).toMatchSnapshot();
      });

      it('should prefix nx.json affected defaultBase with origin/ if ci is bitbucket-pipelines', async () => {
        setNxCloud(tree);

        const nxJson = readJson(tree, 'nx.json');
        nxJson.affected.defaultBase = 'my-branch';
        writeJson(tree, 'nx.json', nxJson);

        await ciWorkflowGenerator(tree, {
          ci: 'bitbucket-pipelines',
          name: 'CI',
        });

        expect(readJson(tree, 'nx.json').affected.defaultBase).toEqual(
          'origin/my-branch'
        );
      });

      it('should prefix nx.json base with origin/ if ci is bitbucket-pipelines', async () => {
        setNxCloud(tree);

        const nxJson = readNxJson(tree);
        nxJson.defaultBase = 'my-branch';
        writeJson(tree, 'nx.json', nxJson);

        await ciWorkflowGenerator(tree, {
          ci: 'bitbucket-pipelines',
          name: 'CI',
        });

        expect(readNxJson(tree).defaultBase).toEqual('origin/my-branch');
      });

      it('should generate gitlab config', async () => {
        setNxCloud(tree);
        await ciWorkflowGenerator(tree, { ci: 'gitlab', name: 'CI' });

        expect(tree.read('.gitlab-ci.yml', 'utf-8')).toMatchSnapshot();
      });

      it('should throw error is nx cloud is not set', async () => {
        await expect(
          ciWorkflowGenerator(tree, {
            ci: 'github',
            name: 'CI',
          })
        ).rejects.toThrowErrorMatchingSnapshot();
      });
    });
  });

  describe('optional e2e', () => {
    beforeEach(() => {
      updateJson(tree, 'package.json', (json) => {
        json.devDependencies = {
          ...json.devDependencies,
          '@titan/cypress': 'latest',
        };
        return json;
      });
    });

    it('should add e2e to github CI config', async () => {
      setNxCloud(tree);
      await ciWorkflowGenerator(tree, { ci: 'github', name: 'CI' });

      expect(tree.read('.github/workflows/ci.yml', 'utf-8')).toMatchSnapshot();
    });

    it('should add e2e to circleci CI config', async () => {
      setNxCloud(tree);
      await ciWorkflowGenerator(tree, { ci: 'circleci', name: 'CI' });

      expect(tree.read('.circleci/config.yml', 'utf-8')).toMatchSnapshot();
    });

    it('should add e2e to azure CI config', async () => {
      setNxCloud(tree);
      await ciWorkflowGenerator(tree, { ci: 'azure', name: 'CI' });

      expect(tree.read('azure-pipelines.yml', 'utf-8')).toMatchSnapshot();
    });

    it('should add e2e to github CI config with custom name', async () => {
      setNxCloud(tree);
      await ciWorkflowGenerator(tree, {
        ci: 'github',
        name: 'My custom-workflow',
      });

      expect(
        tree.read('.github/workflows/my-custom-workflow.yml', 'utf-8')
      ).toMatchSnapshot();
    });

    it('should add e2e to bitbucket pipelines config', async () => {
      setNxCloud(tree);
      await ciWorkflowGenerator(tree, {
        ci: 'bitbucket-pipelines',
        name: 'CI',
      });

      expect(tree.read('bitbucket-pipelines.yml', 'utf-8')).toMatchSnapshot();
    });
  });
});

function setNxCloud(tree: Tree) {
  updateJson<NxJsonConfiguration>(tree, 'nx.json', (json) => {
    return {
      ...json,
      nxCloudAccessToken: 'xxxx-xxx-xxxx',
      nxCloudUrl: 'https://my.nx.app',
    };
  });
}
