import { Tree, formatFiles, updateJson } from '@titan/devkit';
import type { PackageJson } from 'nx/src/utils/package-json';

export default async function update(tree: Tree) {
  if (tree.exists('./package.json')) {
    updateJson<PackageJson>(tree, 'package.json', (packageJson) => {
      if (packageJson.dependencies['@titan/next']) {
        packageJson.devDependencies['@titan/next'] =
          packageJson.dependencies['@titan/next'];
        delete packageJson.dependencies['@titan/next'];
      }
      return packageJson;
    });
  }
  await formatFiles(tree);
}
