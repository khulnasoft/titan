import { Tree, readNxJson } from '@titan/devkit';

export function hasEslintPlugin(tree: Tree): boolean {
  const nxJson = readNxJson(tree);
  return nxJson.plugins?.some((p) =>
    typeof p === 'string'
      ? p === '@titan/eslint/plugin'
      : p.plugin === '@titan/eslint/plugin'
  );
}
