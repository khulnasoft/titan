import { Tree, formatFiles } from '@titan/devkit';
import { replaceNrwlPackageWithNxPackage } from '@titan/devkit/src/utils/replace-package';

export default async function replacePackage(tree: Tree): Promise<void> {
  replaceNrwlPackageWithNxPackage(tree, '@nrwl/detox', '@nx/detox');

  await formatFiles(tree);
}
