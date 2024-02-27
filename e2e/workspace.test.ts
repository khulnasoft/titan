import {addKhulnaSoft, checkFilesExists, cleanup, newApp, readFile, runCLI, runCommand, runSchematic, updateFile} from './utils';

describe('workspace', () => {
  beforeEach(cleanup);

  it('creates a new workspace for developing angular applications', () => {
    runSchematic('@khulnasoft/titan:application --name=proj --version=0.1');

    checkFilesExists(`proj/tsconfig.json`, `proj/WORKSPACE`, `proj/BUILD.bazel`);
  });
});
