import { addDependenciesToPackageJson, Tree } from '@titan/devkit';
import {
  cssInJsDependenciesBabel,
  cssInJsDependenciesSwc,
} from '../utils/styled';

export function addStyledModuleDependencies(
  host: Tree,
  options: { styledModule?: string; compiler?: 'babel' | 'swc' }
) {
  const extraDependencies =
    options.compiler === 'swc'
      ? cssInJsDependenciesSwc[options.styledModule]
      : cssInJsDependenciesBabel[options.styledModule];

  if (extraDependencies) {
    return addDependenciesToPackageJson(
      host,
      extraDependencies.dependencies,
      extraDependencies.devDependencies
    );
  } else {
    return () => {};
  }
}
