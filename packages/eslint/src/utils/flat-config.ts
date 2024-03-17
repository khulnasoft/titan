import { Tree } from '@titan/devkit';

export function useFlatConfig(tree: Tree): boolean {
  return tree.exists('eslint.config.js');
}
