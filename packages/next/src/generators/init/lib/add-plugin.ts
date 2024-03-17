import { Tree, readNxJson, updateNxJson } from '@titan/devkit';

export function addPlugin(tree: Tree) {
  const nxJson = readNxJson(tree);
  nxJson.plugins ??= [];

  for (const plugin of nxJson.plugins) {
    if (
      typeof plugin === 'string'
        ? plugin === '@titan/next/plugin'
        : plugin.plugin === '@titan/next/plugin'
    ) {
      return;
    }
  }

  nxJson.plugins.push({
    plugin: '@titan/next/plugin',
    options: {
      buildTargetName: 'build',
      devTargetName: 'dev',
      startTargetName: 'start',
      serveStaticTargetName: 'serve-static',
    },
  });

  updateNxJson(tree, nxJson);
}
