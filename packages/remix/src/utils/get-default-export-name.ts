import { Tree } from '@titan/devkit';
import { getDefaultExport } from './get-default-export';

export function getDefaultExportName(tree: Tree, path: string) {
  return getDefaultExport(tree, path)?.name.text ?? 'Unknown';
}
