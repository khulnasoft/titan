import { formatFiles, GeneratorCallback, readNxJson, Tree } from '@titan/devkit';

import { runTasksInSerial } from '@titan/devkit';
import applicationGenerator from '../application/application.impl';
import setupGenerator from '../setup/setup.impl';
import { normalizeOptions } from './lib/normalize-options';
import { RemixGeneratorSchema } from './schema';

export default async function (tree: Tree, _options: RemixGeneratorSchema) {
  const options = normalizeOptions(tree, _options);
  const tasks: GeneratorCallback[] = [];

  const setupGenTask = await setupGenerator(tree);
  tasks.push(setupGenTask);

  const nxJson = readNxJson(tree);
  const addPluginDefault =
    process.env.NX_ADD_PLUGINS !== 'false' &&
    nxJson.useInferencePlugins !== false;

  const appGenTask = await applicationGenerator(tree, {
    name: options.appName,
    tags: options.tags,
    skipFormat: true,
    rootProject: true,
    unitTestRunner: options.unitTestRunner ?? 'vitest',
    e2eTestRunner: options.e2eTestRunner ?? 'cypress',
    js: options.js ?? false,
    addPlugin: addPluginDefault,
  });
  tasks.push(appGenTask);

  tree.delete('apps');
  tree.delete('libs');

  await formatFiles(tree);

  return runTasksInSerial(...tasks);
}
