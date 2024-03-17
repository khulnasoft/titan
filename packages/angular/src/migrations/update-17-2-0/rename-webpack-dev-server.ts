import {
  formatFiles,
  getProjects,
  readNxJson,
  updateNxJson,
  updateProjectConfiguration,
  type Tree,
} from '@titan/devkit';

export default async function (tree: Tree) {
  const projects = getProjects(tree);
  for (const [, project] of projects) {
    if (project.projectType !== 'application') {
      continue;
    }

    for (const target of Object.values(project.targets ?? {})) {
      if (
        target.executor === '@titan/angular:webpack-dev-server' ||
        target.executor === '@nrwl/angular:webpack-dev-server'
      ) {
        target.executor = '@titan/angular:dev-server';
      }
    }

    updateProjectConfiguration(tree, project.name, project);
  }

  // update options from nx.json target defaults
  const nxJson = readNxJson(tree);
  if (!nxJson.targetDefaults) {
    return;
  }

  for (const [targetOrExecutor, targetConfig] of Object.entries(
    nxJson.targetDefaults
  )) {
    if (targetOrExecutor === '@titan/angular:webpack-dev-server') {
      nxJson.targetDefaults['@titan/angular:dev-server'] = targetConfig;
      delete nxJson.targetDefaults['@titan/angular:webpack-dev-server'];
    } else if (targetOrExecutor === '@nrwl/angular:webpack-dev-server') {
      nxJson.targetDefaults['@titan/angular:dev-server'] = targetConfig;
      delete nxJson.targetDefaults['@nrwl/angular:webpack-dev-server'];
    } else if (
      targetConfig.executor === '@titan/angular:webpack-dev-server' ||
      targetConfig.executor === '@nrwl/angular:webpack-dev-server'
    ) {
      targetConfig.executor = '@titan/angular:dev-server';
    }
  }

  updateNxJson(tree, nxJson);

  await formatFiles(tree);
}
