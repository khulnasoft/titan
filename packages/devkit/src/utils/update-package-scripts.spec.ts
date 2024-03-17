import { createTreeWithEmptyWorkspace } from 'nx/src/generators/testing-utils/create-tree-with-empty-workspace';
import type { Tree } from 'nx/src/generators/tree';
import { readJson, writeJson } from 'nx/src/generators/utils/json';
import type { PackageJson } from 'nx/src/utils/package-json';
import { updatePackageScripts } from './update-package-scripts';

describe('updatePackageScripts', () => {
  let tree: Tree;

  beforeEach(() => {
    tree = createTreeWithEmptyWorkspace();
  });

  test.each`
    script
    ${'next-remote-watch'}
    ${'anext build'}
    ${'next builda'}
  `('should not replace "$script"', async ({ script }) => {
    tree.write('app1/next.config.js', '');
    writeJson(tree, 'app1/package.json', {
      name: 'app1',
      scripts: {
        build: script,
      },
    });

    await updatePackageScripts(tree, [
      '**/next.config.{js,cjs,mjs}',
      () => ({
        projects: {
          app1: {
            targets: {
              build: { command: 'next build' },
            },
          },
        },
      }),
    ]);

    const { scripts } = readJson<PackageJson>(tree, 'app1/package.json');
    expect(scripts.build).toBe(script);
  });

  test.each`
    script                                                                                    | expected
    ${'next build'}                                                                           | ${'nx build'}
    ${'npx next build'}                                                                       | ${'npx nx build'}
    ${'next build --debug'}                                                                   | ${'nx build --debug'}
    ${'NODE_OPTIONS="--inspect" next build'}                                                  | ${'NODE_OPTIONS="--inspect" nx build'}
    ${'NODE_OPTIONS="--inspect" npx next build --debug'}                                      | ${'NODE_OPTIONS="--inspect" npx nx build --debug'}
    ${'next build && echo "Done"'}                                                            | ${'nx build && echo "Done"'}
    ${'echo "Building..." && next build'}                                                     | ${'echo "Building..." && nx build'}
    ${'echo "Building..." && next build && echo "Done"'}                                      | ${'echo "Building..." && nx build && echo "Done"'}
    ${'echo "Building..." &&next build&& echo "Done"'}                                        | ${'echo "Building..." &&nx build&& echo "Done"'}
    ${'echo "Building..." && NODE_OPTIONS="--inspect" npx next build --debug && echo "Done"'} | ${'echo "Building..." && NODE_OPTIONS="--inspect" npx nx build --debug && echo "Done"'}
  `(
    'should replace "$script" with "$expected"',
    async ({ script, expected }) => {
      tree.write('app1/next.config.js', '');
      writeJson(tree, 'app1/package.json', {
        name: 'app1',
        scripts: {
          build: script,
        },
      });

      await updatePackageScripts(tree, [
        '**/next.config.{js,cjs,mjs}',
        () => ({
          projects: {
            app1: {
              targets: {
                build: { command: 'next build' },
              },
            },
          },
        }),
      ]);

      const { scripts } = readJson<PackageJson>(tree, 'app1/package.json');
      expect(scripts.build).toBe(expected);
    }
  );

  test.each`
    script                                                                                      | expected
    ${'cypress run --e2e --config-file cypress.config.ts'}                                      | ${'nx e2e'}
    ${'echo "Starting..." && cypress run --e2e --config-file cypress.config.ts && echo "Done"'} | ${'echo "Starting..." && nx e2e && echo "Done"'}
  `(
    'should replace "$script" with "$expected"',
    async ({ script, expected }) => {
      tree.write('app1/cypress.config.ts', '');
      writeJson(tree, 'app1/package.json', {
        name: 'app1',
        scripts: {
          e2e: script,
        },
      });

      await updatePackageScripts(tree, [
        '**/cypress.config.{js,ts,mjs,mts,cjs,cts}',
        () => ({
          projects: {
            app1: {
              targets: {
                e2e: {
                  command: 'cypress run --config-file cypress.config.ts --e2e',
                },
              },
            },
          },
        }),
      ]);

      const { scripts } = readJson<PackageJson>(tree, 'app1/package.json');
      expect(scripts.e2e).toBe(expected);
    }
  );

  it('should handle scripts with name different than the target name', async () => {
    tree.write('app1/next.config.js', '');
    writeJson(tree, 'app1/package.json', {
      name: 'app1',
      scripts: {
        'build:dev': 'next build',
      },
    });

    await updatePackageScripts(tree, [
      '**/next.config.{js,cjs,mjs}',
      () => ({
        projects: {
          app1: {
            targets: {
              build: {
                command: 'next build',
              },
            },
          },
        },
      }),
    ]);

    const { scripts } = readJson<PackageJson>(tree, 'app1/package.json');
    expect(scripts['build:dev']).toBe('nx build');
  });

  it('should support replacing multiple scripts', async () => {
    tree.write('app1/next.config.js', '');
    writeJson(tree, 'app1/package.json', {
      name: 'app1',
      scripts: {
        dev: 'PORT=4000 next dev --experimental-https',
        start: 'next build && PORT=4000 next start --experimental-https',
      },
    });

    await updatePackageScripts(tree, [
      '**/next.config.{js,cjs,mjs}',
      () => ({
        projects: {
          app1: {
            targets: {
              build: { command: 'next build' },
              dev: { command: 'next dev' },
              start: { command: 'next start' },
            },
          },
        },
      }),
    ]);

    const { scripts } = readJson<PackageJson>(tree, 'app1/package.json');
    expect(scripts.dev).toBe('PORT=4000 nx dev --experimental-https');
    expect(scripts.start).toBe(
      'nx build && PORT=4000 nx start --experimental-https'
    );
  });

  it('should support multiple occurrences of the same command within a script', async () => {
    tree.write('app1/tsconfig.json', '');
    writeJson(tree, 'app1/package.json', {
      name: 'app1',
      scripts: {
        typecheck: 'tsc -p tsconfig.lib.json && tsc -p tsconfig.spec.json',
      },
    });

    await updatePackageScripts(tree, [
      '**/tsconfig.json',
      () => ({
        projects: {
          app1: {
            targets: {
              build: { command: 'tsc' },
            },
          },
        },
      }),
    ]);

    const { scripts } = readJson<PackageJson>(tree, 'app1/package.json');
    expect(scripts.typecheck).toBe(
      'nx build -p tsconfig.lib.json && nx build -p tsconfig.spec.json'
    );
  });

  it('should support multiple occurrences of the same command within a script with extra commands', async () => {
    tree.write('app1/tsconfig.json', '');
    writeJson(tree, 'app1/package.json', {
      name: 'app1',
      scripts: {
        typecheck:
          'echo "Typechecking..." && tsc -p tsconfig.lib.json && tsc -p tsconfig.spec.json && echo "Done"',
      },
    });

    await updatePackageScripts(tree, [
      '**/tsconfig.json',
      () => ({
        projects: {
          app1: {
            targets: {
              build: { command: 'tsc' },
            },
          },
        },
      }),
    ]);

    const { scripts } = readJson<PackageJson>(tree, 'app1/package.json');
    expect(scripts.typecheck).toBe(
      'echo "Typechecking..." && nx build -p tsconfig.lib.json && nx build -p tsconfig.spec.json && echo "Done"'
    );
  });

  it('should set "includedScripts" to an empty array when running "nx init"', async () => {
    const originalEnvVarValue = process.env.NX_RUNNING_NX_INIT;
    process.env.NX_RUNNING_NX_INIT = 'true';

    tree.write('vite.config.ts', '');
    writeJson(tree, 'package.json', {
      name: 'app1',
      scripts: {
        build: 'vite build',
        serve: 'vite',
        test: 'vitest',
        coverage: 'vitest run --coverage',
        foo: 'echo "foo"',
      },
    });

    await updatePackageScripts(tree, [
      '**/{vite,vitest}.config.{js,ts,mjs,mts,cjs,cts}',
      () => ({
        projects: {
          app1: {
            targets: {
              build: { command: 'vite build' },
              serve: { command: 'vite serve' },
              test: { command: 'vitest run' },
            },
          },
        },
      }),
    ]);

    const packageJson = readJson<PackageJson>(tree, 'package.json');
    expect(packageJson.scripts).toStrictEqual({
      build: 'nx build',
      serve: 'vite',
      test: 'vitest',
      coverage: 'nx test --coverage',
      foo: 'echo "foo"',
    });
    expect(packageJson.nx.includedScripts).toStrictEqual([]);

    process.env.NX_RUNNING_NX_INIT = originalEnvVarValue;
  });

  it('should set "includedScripts" to all scripts except the ones matching inferred target names when "includedScripts" is not set', async () => {
    tree.write('vite.config.ts', '');
    writeJson(tree, 'package.json', {
      name: 'app1',
      scripts: {
        build: 'vite build',
        serve: 'vite',
        test: 'vitest',
        coverage: 'vitest run --coverage',
        foo: 'echo "foo"',
      },
    });

    await updatePackageScripts(tree, [
      '**/{vite,vitest}.config.{js,ts,mjs,mts,cjs,cts}',
      () => ({
        projects: {
          app1: {
            targets: {
              build: { command: 'vite build' },
              serve: { command: 'vite serve' },
              test: { command: 'vitest run' },
            },
          },
        },
      }),
    ]);

    const packageJson = readJson<PackageJson>(tree, 'package.json');
    expect(packageJson.scripts).toStrictEqual({
      build: 'nx build',
      serve: 'vite',
      test: 'vitest',
      coverage: 'nx test --coverage',
      foo: 'echo "foo"',
    });
    // "build": excluded because a script (itself) was replaced with a target "build"
    // "serve" not excluded even though it matches the name of an inferred target because no script was replaced with a target "serve"
    // "test" excluded even though it was not replaced because another script was replaced with a target "test"
    // "coverage" not excluded even though it was replaced because it does not match a target
    // "foo" not excluded because it does not match a target
    expect(packageJson.nx.includedScripts).toStrictEqual([
      'serve',
      'coverage',
      'foo',
    ]);
  });

  it('should not set "nx.includedScripts" when no script matched an inferred target', async () => {
    tree.write('vite.config.ts', '');
    writeJson(tree, 'package.json', {
      name: 'app1',
      scripts: {
        serve: 'vite',
        coverage: 'vitest run --coverage',
        foo: 'echo "foo"',
      },
    });

    await updatePackageScripts(tree, [
      '**/{vite,vitest}.config.{js,ts,mjs,mts,cjs,cts}',
      () => ({
        projects: {
          app1: {
            targets: {
              build: { command: 'vite build' },
              serve: { command: 'vite serve' },
              test: { command: 'vitest run' },
            },
          },
        },
      }),
    ]);

    const packageJson = readJson<PackageJson>(tree, 'package.json');
    expect(packageJson.scripts).toStrictEqual({
      serve: 'vite',
      coverage: 'nx test --coverage',
      foo: 'echo "foo"',
    });
    expect(packageJson.nx).toBeUndefined();
  });

  it('should exclude replaced package.json scripts from nx if they are initially included', async () => {
    tree.write('next.config.js', '');
    writeJson(tree, 'package.json', {
      name: 'app1',
      scripts: {
        build: 'next build',
        foo: 'echo "foo"',
      },
      nx: {
        includedScripts: ['build', 'foo'],
      },
    });

    await updatePackageScripts(tree, [
      '**/next.config.{js,cjs,mjs}',
      () => ({
        projects: {
          app1: {
            targets: {
              build: { command: 'next build' },
            },
          },
        },
      }),
    ]);

    const { nx } = readJson<PackageJson>(tree, 'package.json');
    expect(nx.includedScripts).toStrictEqual(['foo']);
  });
});
