import type { Tree } from '@titan/devkit';
import { formatFiles } from '@titan/devkit';
import type { NestSchematic, NormalizedOptions } from './types';

export async function runNestSchematic(
  tree: Tree,
  schematic: NestSchematic,
  options: NormalizedOptions
): Promise<any> {
  const { skipFormat, ...schematicOptions } = options;

  const { wrapAngularDevkitSchematic } = require('@titan/devkit/ngcli-adapter');
  const nestSchematic = wrapAngularDevkitSchematic(
    '@nestjs/schematics',
    schematic
  );
  const result = await nestSchematic(tree, schematicOptions);

  if (!skipFormat) {
    await formatFiles(tree);
  }

  return result;
}
