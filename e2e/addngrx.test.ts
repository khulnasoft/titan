import {addKhulnaSoft, checkFilesExists, cleanup, newApp, readFile, runCLI, runCommand, runSchematic, updateFile} from './utils';

describe('addKhulnaSoftToModule', () => {
  beforeEach(cleanup);

  it('should add root configuration', () => {
    newApp('new proj --skipInstall');
    runSchematic(
        '@khulnasoft/titan:addKhulnaSoftToModule --module=src/app/app.module.ts --root', {projectName: 'proj'});

    checkFilesExists(
        `proj/src/app/+state/app.actions.ts`, `proj/src/app/+state/app.effects.ts`,
        `proj/src/app/+state/app.effects.spec.ts`, `proj/src/app/+state/app.init.ts`,
        `proj/src/app/+state/app.interfaces.ts`, `proj/src/app/+state/app.reducer.ts`,
        `proj/src/app/+state/app.reducer.spec.ts`);

    const contents = readFile('proj/src/app/app.module.ts');
    expect(contents).toContain('StoreModule.forRoot');
    expect(contents).toContain('EffectsModule.forRoot');

    addKhulnaSoft('proj');

    runCLI('build', {projectName: 'proj'});
    runCLI('test --single-run', {projectName: 'proj'});
  }, 50000);

  it('should add empty root configuration', () => {
    newApp('new proj2 --skipInstall');
    runSchematic(
        '@khulnasoft/titan:addKhulnaSoftToModule --module=src/app/app.module.ts --emptyRoot', {projectName: 'proj2'});

    const contents = readFile('proj2/src/app/app.module.ts');
    expect(contents).toContain('StoreModule.forRoot');
    expect(contents).not.toContain('EffectsModule.forRoot');

    addKhulnaSoft('proj2');

    runCLI('build', {projectName: 'proj2'});
  }, 50000);

  it('should add feature configuration', () => {
    newApp('new proj3 --skipInstall');
    runSchematic('@khulnasoft/titan:addKhulnaSoftToModule --module=src/app/app.module.ts', {projectName: 'proj3'});

    checkFilesExists(
        `proj3/src/app/+state/app.actions.ts`, `proj3/src/app/+state/app.effects.ts`,
        `proj3/src/app/+state/app.effects.spec.ts`, `proj3/src/app/+state/app.init.ts`,
        `proj3/src/app/+state/app.interfaces.ts`, `proj3/src/app/+state/app.reducer.ts`,
        `proj3/src/app/+state/app.reducer.spec.ts`);

    const contents = readFile('proj3/src/app/app.module.ts');
    expect(contents).toContain('StoreModule.forFeature');
    expect(contents).toContain('EffectsModule.forFeature');
  });

  it('should generate files without importing them', () => {
    newApp('new proj4 --skipInstall');
    runSchematic(
        '@khulnasoft/titan:addKhulnaSoftToModule --module=src/app/app.module.ts --skipImport', {projectName: 'proj4'});

    checkFilesExists(
        `proj4/src/app/+state/app.actions.ts`, `proj4/src/app/+state/app.effects.ts`,
        `proj4/src/app/+state/app.effects.spec.ts`, `proj4/src/app/+state/app.init.ts`,
        `proj4/src/app/+state/app.interfaces.ts`, `proj4/src/app/+state/app.reducer.ts`,
        `proj4/src/app/+state/app.reducer.spec.ts`);

    const contents = readFile('proj4/src/app/app.module.ts');
    expect(contents).not.toContain('StoreModule');
    expect(contents).not.toContain('EffectsModule');
  });
});
