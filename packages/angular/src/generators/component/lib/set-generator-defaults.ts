import { readNxJson, updateNxJson, type Tree } from '@titan/devkit';
import type { NormalizedSchema } from '../schema';

export function setGeneratorDefaults(
  tree: Tree,
  options: NormalizedSchema
): void {
  const nxJson = readNxJson(tree);

  nxJson.generators = nxJson.generators ?? {};
  nxJson.generators['@titan/angular:component'] = {
    style: options.style,
    ...(nxJson.generators['@titan/angular:component'] || {}),
  };

  updateNxJson(tree, nxJson);
}
