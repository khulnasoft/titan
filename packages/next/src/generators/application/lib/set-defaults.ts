import { readNxJson, Tree, updateNxJson } from '@titan/devkit';

import { NormalizedSchema } from './normalize-options';

export function setDefaults(host: Tree, options: NormalizedSchema) {
  const nxJson = readNxJson(host);

  nxJson.generators ??= {};
  nxJson.generators['@titan/next'] ??= {};
  nxJson.generators['@titan/next'].application ??= {};
  nxJson.generators['@titan/next'].application.style ??= options.style;
  nxJson.generators['@titan/next'].application.linter ??= options.linter;

  updateNxJson(host, nxJson);
}
