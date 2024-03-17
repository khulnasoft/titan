import type { Tree } from '@titan/devkit';
import { formatFiles } from '@titan/devkit';
import { componentGenerator } from '../component/component';
import { exportScam } from '../utils/export-scam';
import { convertComponentToScam, normalizeOptions } from './lib';
import type { Schema } from './schema';

export async function scamGenerator(tree: Tree, rawOptions: Schema) {
  const options = await normalizeOptions(tree, rawOptions);
  await componentGenerator(tree, {
    ...options,
    skipImport: true,
    export: false,
    standalone: false,
    skipFormat: true,
    // options are already normalize, use them as is
    nameAndDirectoryFormat: 'as-provided',
  });

  convertComponentToScam(tree, options);
  exportScam(tree, options);

  if (!options.skipFormat) {
    await formatFiles(tree);
  }
}

export default scamGenerator;
