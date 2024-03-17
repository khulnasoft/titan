import { Tree, updateJson } from '@titan/devkit';
import { NormalizedSchema } from './normalized-schema';

export function updateLibPackageNpmScope(
  host: Tree,
  options: NormalizedSchema['libraryOptions']
) {
  return updateJson(host, `${options.projectRoot}/package.json`, (json) => {
    json.name = options.importPath;
    return json;
  });
}
