import { type Tree, readNxJson, updateNxJson } from '@titan/devkit';

export function addMfEnvToTargetDefaultInputs(tree: Tree) {
  const nxJson = readNxJson(tree);
  const webpackExecutor = '@titan/angular:webpack-browser';
  const mfEnvVar = 'NX_MF_DEV_SERVER_STATIC_REMOTES';

  nxJson.targetDefaults ??= {};
  nxJson.targetDefaults[webpackExecutor] ??= {};
  nxJson.targetDefaults[webpackExecutor].inputs ??= [
    'production',
    '^production',
  ];

  let mfEnvVarExists = false;
  for (const input of nxJson.targetDefaults[webpackExecutor].inputs) {
    if (typeof input === 'object' && input['env'] === mfEnvVar) {
      mfEnvVarExists = true;
      break;
    }
  }
  if (!mfEnvVarExists) {
    nxJson.targetDefaults[webpackExecutor].inputs.push({ env: mfEnvVar });
    updateNxJson(tree, nxJson);
  }
}
