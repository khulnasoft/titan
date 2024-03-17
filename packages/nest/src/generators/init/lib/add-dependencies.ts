import type { GeneratorCallback, Tree } from '@titan/devkit';
import { addDependenciesToPackageJson } from '@titan/devkit';
import { nestJsSchematicsVersion, nxVersion } from '../../../utils/versions';
import { InitGeneratorOptions } from '../schema';

export function addDependencies(
  tree: Tree,
  options: InitGeneratorOptions
): GeneratorCallback {
  return addDependenciesToPackageJson(
    tree,
    {},
    {
      '@nestjs/schematics': nestJsSchematicsVersion,
      '@nx/nest': nxVersion,
    },
    undefined,
    options.keepExistingVersions
  );
}
