import {
  addProjectConfiguration,
  readNxJson,
  readProjectConfiguration,
  updateNxJson,
} from '@titan/devkit';
import { createTreeWithEmptyWorkspace } from '@titan/devkit/testing';
import removeBaseUrlFromProjectJson from './remove-baseUrl-from-project-json';

describe('removeBaseUrlFromProjectJson', () => {
  describe('--projects', () => {
    it('should not update if the project is correct', async () => {
      // ARRANGE
      const tree = createTreeWithEmptyWorkspace();
      const project = {
        $schema: 'node_modules/nx/schemas/project-schema.json',
        name: 'test',
        root: '.',
        sourceRoot: '',
        targets: {
          e2e: {
            executor: '@titan/playwright:playwright',
          },
        },
      };

      addProjectConfiguration(tree, 'test', project);

      // ACT
      await removeBaseUrlFromProjectJson(tree);

      // ASSERT
      const maybeUpdatedProject = readProjectConfiguration(tree, 'test');
      expect(maybeUpdatedProject).toMatchInlineSnapshot(`
              {
                "$schema": "node_modules/nx/schemas/project-schema.json",
                "name": "test",
                "root": ".",
                "sourceRoot": "",
                "targets": {
                  "e2e": {
                    "executor": "@titan/playwright:playwright",
                  },
                },
              }
          `);
    });

    it('should remove baseUrl from target options', async () => {
      // ARRANGE
      const tree = createTreeWithEmptyWorkspace();
      const project = {
        $schema: 'node_modules/nx/schemas/project-schema.json',
        name: 'test',
        root: '.',
        sourceRoot: '',
        targets: {
          e2e: {
            executor: '@titan/playwright:playwright',
            options: {
              baseUrl: 'http://localhost:4200',
            },
          },
        },
      };

      addProjectConfiguration(tree, 'test', project);

      // ACT
      await removeBaseUrlFromProjectJson(tree);

      // ASSERT
      const maybeUpdatedProject = readProjectConfiguration(tree, 'test');
      expect(maybeUpdatedProject.targets['e2e'].options).toMatchInlineSnapshot(
        `{}`
      );
    });

    it('should remove baseUrl from target options and configurations', async () => {
      // ARRANGE
      const tree = createTreeWithEmptyWorkspace();
      const project = {
        $schema: 'node_modules/nx/schemas/project-schema.json',
        name: 'test',
        root: '.',
        sourceRoot: '',
        targets: {
          e2e: {
            executor: '@titan/playwright:playwright',
            options: {
              baseUrl: 'http://localhost:4200',
            },
            configurations: {
              production: {
                baseUrl: 'https://mytest.com',
              },
            },
          },
        },
      };

      addProjectConfiguration(tree, 'test', project);

      // ACT
      await removeBaseUrlFromProjectJson(tree);

      // ASSERT
      const maybeUpdatedProject = readProjectConfiguration(tree, 'test');
      expect(maybeUpdatedProject.targets['e2e'].options).toMatchInlineSnapshot(
        `{}`
      );
      expect(
        maybeUpdatedProject.targets['e2e'].configurations['production']
      ).toMatchInlineSnapshot(`{}`);
    });
  });

  describe('--nx.json', () => {
    it('should remove baseUrl from targetDefaults in nx.json', async () => {
      // ARRANGE
      const tree = createTreeWithEmptyWorkspace();
      const nxJson = readNxJson(tree);
      nxJson.targetDefaults['@titan/playwright:playwright'] = {
        options: {
          baseUrl: 'http://localhost:4200',
        },
        configurations: {
          ci: {
            baseUrl: 'http://localhost:4201',
          },
        },
      };
      nxJson.targetDefaults['e2e'] = {
        executor: '@titan/playwright:playwright',
        options: {
          baseUrl: 'http://localhost:4200',
        },
        configurations: {
          ci: {
            baseUrl: 'http://localhost:4201',
          },
        },
      };
      updateNxJson(tree, nxJson);

      // ACT
      await removeBaseUrlFromProjectJson(tree);

      // ASSERT
      const maybeUpdatedNxJson = readNxJson(tree);
      expect(maybeUpdatedNxJson.targetDefaults).toMatchInlineSnapshot(`
        {
          "@titan/playwright:playwright": {
            "configurations": {
              "ci": {},
            },
            "options": {},
          },
          "build": {
            "cache": true,
          },
          "e2e": {
            "configurations": {
              "ci": {},
            },
            "executor": "@titan/playwright:playwright",
            "options": {},
          },
          "lint": {
            "cache": true,
          },
        }
      `);
    });
  });
});
