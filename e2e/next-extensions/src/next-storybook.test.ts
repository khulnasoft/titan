import {
  checkFilesExist,
  cleanupProject,
  newProject,
  runCLI,
  uniq,
} from '@nx/e2e/utils';

// TODO(katerina): Enable some time?
// This test fails because of sharp. In this PR I have included all related links to the issue.
xdescribe('Next.js Storybook', () => {
  const appName = uniq('app');
  beforeAll(() => {
    newProject({
      name: 'proj',
      packageManager: 'npm',
      packages: ['@titan/next'],
    });
    runCLI(
      `generate @titan/next:app ${appName} --e2eTestRunner=none --project-name-and-root-format=as-provided --no-interactive`
    );
    runCLI(
      `generate @titan/next:component Foo --directory=${appName}/components/foo/Foo.tsx --no-interactive`
    );
  });

  afterAll(() => cleanupProject());

  it('should run a Next.js based Storybook setup', async () => {
    runCLI(
      `generate @titan/next:storybook-configuration ${appName} --generateStories --no-interactive`
    );
    runCLI(`build-storybook ${appName}`);
    checkFilesExist(`${appName}/storybook-static/index.html`);
  }, 600_000);
});
