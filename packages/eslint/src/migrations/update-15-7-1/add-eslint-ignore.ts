import {
  formatFiles,
  joinPathFragments,
  readJson,
  Tree,
  updateNxJson,
} from '@titan/devkit';
import { getEslintTargets } from '../../generators/utils/eslint-targets';
import { ESLINT_CONFIG_FILENAMES } from '../../utils/config-file';

export default async function addEslintIgnore(tree: Tree) {
  const nxJson = readJson(tree, 'nx.json');

  const globalEslintFile = ESLINT_CONFIG_FILENAMES.find((file) =>
    tree.exists(file)
  );

  if (globalEslintFile) {
    if (tree.exists('.eslintignore')) {
      const content = tree.read('.eslintignore', 'utf-8');
      if (!content.includes('node_modules')) {
        tree.write('.eslintignore', `node_modules\n${content}`);
      }
    } else {
      tree.write('.eslintignore', 'node_modules\n');
    }

    for (const targetName of getEslintTargets(tree)) {
      nxJson.targetDefaults ??= {};
      const lintTargetDefaults = (nxJson.targetDefaults[targetName] ??= {});

      const lintIgnorePath = joinPathFragments(
        '{workspaceRoot}',
        globalEslintFile
      );

      if (lintTargetDefaults.inputs) {
        if (!lintTargetDefaults.inputs.includes(lintIgnorePath)) {
          lintTargetDefaults.inputs.push(lintIgnorePath);
        }
      } else {
        lintTargetDefaults.inputs = ['default', lintIgnorePath];
      }
    }

    updateNxJson(tree, nxJson);
    await formatFiles(tree);
  }
}
