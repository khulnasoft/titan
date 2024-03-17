import type { Tree } from '@titan/devkit';
import { readNxJson, updateNxJson } from '@titan/devkit';

export function setApplicationStrictDefault(host: Tree, strict: boolean) {
  const nxJson = readNxJson(host);

  nxJson.generators = nxJson.generators || {};
  nxJson.generators['@titan/angular:application'] =
    nxJson.generators['@titan/angular:application'] || {};
  nxJson.generators['@titan/angular:application'].strict =
    nxJson.generators['@titan/angular:application'].strict ?? strict;

  updateNxJson(host, nxJson);
}
