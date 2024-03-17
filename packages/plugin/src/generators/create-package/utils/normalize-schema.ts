import { Tree } from '@titan/devkit';
import { determineProjectNameAndRootOptions } from '@titan/devkit/src/generators/project-name-and-root-utils';
import { CreatePackageSchema } from '../schema';

export interface NormalizedSchema extends CreatePackageSchema {
  bundler: 'swc' | 'tsc';
  projectName: string;
  projectRoot: string;
}

export async function normalizeSchema(
  host: Tree,
  schema: CreatePackageSchema
): Promise<NormalizedSchema> {
  const {
    projectName,
    names: projectNames,
    projectRoot,
    projectNameAndRootFormat,
  } = await determineProjectNameAndRootOptions(host, {
    name: schema.name,
    projectType: 'library',
    directory: schema.directory,
    projectNameAndRootFormat: schema.projectNameAndRootFormat,
    callingGenerator: '@nx/plugin:create-package',
  });
  schema.projectNameAndRootFormat = projectNameAndRootFormat;

  return {
    ...schema,
    bundler: schema.compiler ?? 'tsc',
    projectName,
    projectRoot,
    name: projectNames.projectSimpleName,
  };
}
