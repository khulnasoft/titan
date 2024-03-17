import { readNxJson, updateNxJson, type Tree } from '@titan/devkit';
import type { NormalizedSchema } from './normalized-schema';

export function setGeneratorDefaults(
  tree: Tree,
  options: NormalizedSchema
): void {
  const nxJson = readNxJson(tree);

  nxJson.generators = nxJson.generators ?? {};
  nxJson.generators['@titan/angular:application'] = {
    e2eTestRunner: options.e2eTestRunner,
    linter: options.linter,
    style: options.style,
    unitTestRunner: options.unitTestRunner,
    ...(nxJson.generators['@titan/angular:application'] || {}),
  };

  updateNxJson(tree, nxJson);
}
