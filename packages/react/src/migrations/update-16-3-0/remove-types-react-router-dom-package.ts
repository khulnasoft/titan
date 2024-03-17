import {
  Tree,
  formatFiles,
  removeDependenciesFromPackageJson,
} from '@titan/devkit';

export default async function removePackage(tree: Tree): Promise<void> {
  removeDependenciesFromPackageJson(tree, [], ['react-test-renderer']);
  await formatFiles(tree);
}
