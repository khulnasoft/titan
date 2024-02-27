import { checkFilesExist, cleanup, copyMissingPackages, ngNewBazel, readFile, runCLI, runSchematic } from '../utils';

describe('library', () => {
  beforeEach(cleanup);

  describe('generate', () => {
    it('should work', () => {
      ngNewBazel('--collection=@khulnasoft/bazel --skip-install');
      runSchematic('@khulnasoft/bazel:lib --name=myLib');

      checkFilesExist(
        'tsconfig.json',
        'WORKSPACE',
        'BUILD.bazel',
        'libs/my-lib/BUILD.bazel',
        'libs/my-lib/index.ts',
        'libs/my-lib/src/my-lib.ts'
      );

      const cliConfig = JSON.parse(readFile('.angular-cli.json'));
      expect(cliConfig.apps[0].name).toEqual('myLib');
      expect(cliConfig.apps[0].root).toEqual('libs/my-lib/src');
    });
  });

  describe('build', () => {
    it('should work', () => {
      ngNewBazel('--collection=@khulnasoft/bazel');
      copyMissingPackages();
      runSchematic('@khulnasoft/bazel:lib --name=lib');

      expect(runCLI('build')).not.toContain('error');
    });
  });
});
