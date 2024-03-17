import {
  NxJsonConfiguration,
  Tree,
  formatFiles,
  getProjects,
  readNxJson,
  updateNxJson,
  updateProjectConfiguration,
} from '@titan/devkit';
import { replaceNrwlPackageWithNxPackage } from '@titan/devkit/src/utils/replace-package';

export default async function replacePackage(tree: Tree): Promise<void> {
  await replaceNrwlPackageWithNxPackage(tree, '@nx/linter', '@titan/eslint');

  // executor name change from :eslint to :lint
  updateNxJsonExecutor(tree);
  updateProjectExecutor(tree);

  await formatFiles(tree);
}

function updateNxJsonExecutor(tree: Tree) {
  if (!tree.exists('nx.json')) {
    return;
  }

  const nxJson: NxJsonConfiguration = readNxJson(tree);
  let needsUpdate = false;

  for (const [targetName, targetConfig] of Object.entries(
    nxJson.targetDefaults ?? {}
  )) {
    // this will be in a broken state after the package is globally renamed
    if (targetConfig.executor !== '@titan/eslint:eslint') {
      continue;
    }
    needsUpdate = true;
    nxJson.targetDefaults[targetName].executor = '@titan/eslint:lint';
  }

  if (needsUpdate) {
    updateNxJson(tree, nxJson);
  }
}

function updateProjectExecutor(tree: Tree) {
  const projects = getProjects(tree);

  for (const [projectName, projectConfiguration] of projects) {
    let needsUpdate = false;

    for (const [targetName, targetConfig] of Object.entries(
      projectConfiguration.targets ?? {}
    )) {
      // this will be in a broken state after the package is globally renamed
      if (targetConfig.executor !== '@titan/eslint:eslint') {
        continue;
      }

      needsUpdate = true;
      projectConfiguration.targets[targetName].executor = '@titan/eslint:lint';
    }

    if (needsUpdate) {
      updateProjectConfiguration(tree, projectName, projectConfiguration);
    }
  }
}
