import {
  checkFilesExist,
  cleanup,
  copyMissingPackages,
  ngNew,
  readFile,
  runCLI,
  runSchematic,
  updateFile
} from '../utils';

describe('Khulnasoft Convert to Titan Workspace', () => {
  beforeEach(cleanup);

  it('should generate a workspace', () => {
    ngNew('--skip-install');

    // update package.json
    const packageJson = JSON.parse(readFile('package.json'));
    packageJson.description = 'some description';
    updateFile('package.json', JSON.stringify(packageJson, null, 2));
    // confirm that @khulnasoft and @ngrx dependencies do not exist yet
    expect(packageJson.devDependencies['@khulnasoft/schematics']).not.toBeDefined();
    expect(packageJson.dependencies['@khulnasoft/titan']).not.toBeDefined();
    expect(packageJson.dependencies['@ngrx/store']).not.toBeDefined();
    expect(packageJson.dependencies['@ngrx/effects']).not.toBeDefined();
    expect(packageJson.dependencies['@ngrx/router-store']).not.toBeDefined();
    expect(packageJson.dependencies['@ngrx/store-devtools']).not.toBeDefined();

    // update tsconfig.json
    const tsconfigJson = JSON.parse(readFile('tsconfig.json'));
    tsconfigJson.compilerOptions.paths = { a: ['b'] };
    updateFile('tsconfig.json', JSON.stringify(tsconfigJson, null, 2));

    // update angular-cli.json
    const angularCLIJson = JSON.parse(readFile('.angular-cli.json'));
    angularCLIJson.apps[0].scripts = ['../node_modules/x.js'];
    updateFile('.angular-cli.json', JSON.stringify(angularCLIJson, null, 2));

    // run the command
    runCLI('generate workspace proj --npmScope=proj --collection=@khulnasoft/schematics');

    // check that files have been moved!
    checkFilesExist('apps/proj/src/main.ts', 'apps/proj/src/app/app.module.ts');

    // check that package.json got merged
    const updatedPackageJson = JSON.parse(readFile('package.json'));
    expect(updatedPackageJson.description).toEqual('some description');
    expect(updatedPackageJson.devDependencies['@khulnasoft/schematics']).toBeDefined();
    expect(updatedPackageJson.dependencies['@khulnasoft/titan']).toBeDefined();
    expect(updatedPackageJson.dependencies['@ngrx/store']).toBeDefined();
    expect(updatedPackageJson.dependencies['@ngrx/effects']).toBeDefined();
    expect(updatedPackageJson.dependencies['@ngrx/router-store']).toBeDefined();
    expect(updatedPackageJson.dependencies['@ngrx/store-devtools']).toBeDefined();

    // check if angular-cli.json get merged
    const updatedAngularCLIJson = JSON.parse(readFile('.angular-cli.json'));
    expect(updatedAngularCLIJson.apps[0].root).toEqual('apps/proj/src');
    expect(updatedAngularCLIJson.apps[0].outDir).toEqual('dist/apps/proj');
    expect(updatedAngularCLIJson.apps[0].test).toEqual('../../../test.js');
    expect(updatedAngularCLIJson.apps[0].tsconfig).toEqual('../../../tsconfig.app.json');
    expect(updatedAngularCLIJson.apps[0].testTsconfig).toEqual('../../../tsconfig.spec.json');
    expect(updatedAngularCLIJson.apps[0].scripts[0]).toEqual('../../../node_modules/x.js');
    expect(updatedAngularCLIJson.defaults.schematics.collection).toEqual('@khulnasoft/schematics');

    // check if tsconfig.json get merged
    const updatedTsConfig = JSON.parse(readFile('tsconfig.json'));
    expect(updatedTsConfig.compilerOptions.paths).toEqual({
      a: ['b'],
      '@proj/*': ['libs/*']
    });
  });

  it('should generate a workspace and not change dependencies or devDependencies if they already exist', () => {
    // create a new AngularCLI app
    ngNew('--skip-install');
    const titanVersion = '0.0.0';
    const schematicsVersion = '0.0.0';
    const ngrxVersion = '0.0.0';
    // update package.json
    const existingPackageJson = JSON.parse(readFile('package.json'));
    existingPackageJson.devDependencies['@khulnasoft/schematics'] = schematicsVersion;
    existingPackageJson.dependencies['@khulnasoft/titan'] = titanVersion;
    existingPackageJson.dependencies['@ngrx/store'] = ngrxVersion;
    existingPackageJson.dependencies['@ngrx/effects'] = ngrxVersion;
    existingPackageJson.dependencies['@ngrx/router-store'] = ngrxVersion;
    existingPackageJson.dependencies['@ngrx/store-devtools'] = ngrxVersion;
    updateFile('package.json', JSON.stringify(existingPackageJson, null, 2));
    // run the command
    runCLI('generate workspace proj --collection=@khulnasoft/schematics');
    // check that dependencies and devDependencies remained the same
    const packageJson = JSON.parse(readFile('package.json'));
    expect(packageJson.devDependencies['@khulnasoft/schematics']).toEqual(schematicsVersion);
    expect(packageJson.dependencies['@khulnasoft/titan']).toEqual(titanVersion);
    expect(packageJson.dependencies['@ngrx/store']).toEqual(ngrxVersion);
    expect(packageJson.dependencies['@ngrx/effects']).toEqual(ngrxVersion);
    expect(packageJson.dependencies['@ngrx/router-store']).toEqual(ngrxVersion);
    expect(packageJson.dependencies['@ngrx/store-devtools']).toEqual(ngrxVersion);
  });
});
