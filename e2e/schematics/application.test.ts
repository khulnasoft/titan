import {
  checkFilesExist,
  cleanup,
  copyMissingPackages,
  newApp,
  newLib,
  ngNew,
  readFile,
  runCLI,
  updateFile
} from '../utils';

describe('Khulnasoft Workspace', () => {
  beforeEach(cleanup);

  it(
    'should work',
    () => {
      ngNew('--collection=@khulnasoft/schematics --npmScope=khulnasoft');
      copyMissingPackages();
      newApp('myapp');
      newLib('mylib --ngmodule');

      updateFile(
        'apps/myapp/src/app/app.module.ts',
        `
        import { NgModule } from '@angular/core';
        import { BrowserModule } from '@angular/platform-browser';
        import { MylibModule } from '@khulnasoft/mylib';
        import { AppComponent } from './app.component';

        @NgModule({
          imports: [BrowserModule, MylibModule],
          declarations: [AppComponent],
          bootstrap: [AppComponent]
        })
        export class AppModule {}
      `
      );

      runCLI('build --aot');
      expect(runCLI('test --single-run')).toContain('Executed 2 of 2 SUCCESS');
    },
    100000
  );

  it(
    'should support router config generation (lazy)',
    () => {
      ngNew('--collection=@khulnasoft/schematics --npmScope=khulnasoft');
      copyMissingPackages();
      newApp('myapp --routing');
      newLib('mylib --routing --lazy --parentModule=apps/myapp/src/app/app.module.ts');

      runCLI('build --aot');
      expect(runCLI('test --single-run')).toContain('Executed 2 of 2 SUCCESS');
    },
    100000
  );

  it(
    'should support router config generation (eager)',
    () => {
      ngNew('--collection=@khulnasoft/schematics --npmScope=khulnasoft');
      copyMissingPackages();
      newApp('myapp --routing');
      newLib('mylib --routing --parentModule=apps/myapp/src/app/app.module.ts');

      runCLI('build --aot');
      expect(runCLI('test --single-run')).toContain('Executed 2 of 2 SUCCESS');
    },
    100000
  );
});
