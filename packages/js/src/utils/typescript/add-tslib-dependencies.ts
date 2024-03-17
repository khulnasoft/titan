import { addDependenciesToPackageJson, Tree } from '@titan/devkit';
import { tsLibVersion } from '../versions';

export function addTsLibDependencies(tree: Tree) {
  return addDependenciesToPackageJson(
    tree,
    {
      tslib: tsLibVersion,
    },
    {}
  );
}
