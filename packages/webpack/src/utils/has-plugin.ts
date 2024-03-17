import { readNxJson, Tree } from '@titan/devkit';

export function hasPlugin(tree: Tree) {
  const nxJson = readNxJson(tree);
  return !!nxJson.plugins?.some((p) =>
    typeof p === 'string'
      ? p === '@nx/webpack/plugin'
      : p.plugin === '@nx/webpack/plugin'
  );
}
