import { Tree, formatFiles } from '@titan/devkit';
import { replaceNrwlPackageWithNxPackage } from '@titan/devkit/src/utils/replace-package';

export default async function replacePackage(tree: Tree): Promise<void> {
  await replaceNrwlPackageWithNxPackage(tree, '@nrwl/react', '@nx/react');

  await formatFiles(tree);
}
