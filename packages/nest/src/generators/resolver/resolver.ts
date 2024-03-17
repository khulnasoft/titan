import type { Tree } from '@titan/devkit';
import type {
  NestGeneratorWithLanguageOption,
  NestGeneratorWithTestOption,
  NormalizedOptions,
} from '../utils';
import {
  normalizeOptions,
  runNestSchematic,
  unitTestRunnerToSpec,
} from '../utils';

export type ResolverGeneratorOptions = NestGeneratorWithLanguageOption &
  NestGeneratorWithTestOption;

export async function resolverGenerator(
  tree: Tree,
  rawOptions: ResolverGeneratorOptions
) {
  await resolverGeneratorInternal(tree, {
    nameAndDirectoryFormat: 'derived',
    ...rawOptions,
  });
}

export async function resolverGeneratorInternal(
  tree: Tree,
  rawOptions: ResolverGeneratorOptions
): Promise<any> {
  const options = await normalizeResolverOptions(tree, rawOptions);

  return runNestSchematic(tree, 'resolver', options);
}

export default resolverGenerator;

async function normalizeResolverOptions(
  tree: Tree,
  options: ResolverGeneratorOptions
): Promise<NormalizedOptions> {
  const normalizedOptions = await normalizeOptions(
    tree,
    'resolver',
    '@nx/nest:resolver',
    options
  );
  return {
    ...normalizedOptions,
    language: options.language,
    spec: unitTestRunnerToSpec(options.unitTestRunner),
  };
}
