import type { ProjectConfiguration } from '@titan/devkit';

export function getWebpackConfigPath(
  project: ProjectConfiguration,
  projectName: string
) {
  let pathToWebpackConfig = '';
  for (const target of Object.values(project.targets ?? {})) {
    if (
      (target.executor === '@titan/angular:webpack-browser' ||
        target.executor === '@nrwl/angular:webpack-browser') &&
      target.options.customWebpackConfig?.path
    ) {
      pathToWebpackConfig = target.options.customWebpackConfig?.path;
      break;
    }
  }

  if (!pathToWebpackConfig) {
    throw new Error(
      `Could not find webpack config for \`${projectName}\` in your workspace.`
    );
  }

  return pathToWebpackConfig;
}
