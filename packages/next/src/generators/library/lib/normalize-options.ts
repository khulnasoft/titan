import { Tree, readNxJson } from '@titan/devkit';
import { determineProjectNameAndRootOptions } from '@titan/devkit/src/generators/project-name-and-root-utils';
import { Schema } from '../schema';

export interface NormalizedSchema extends Schema {
  importPath: string;
  projectRoot: string;
}

export async function normalizeOptions(
  host: Tree,
  options: Schema
): Promise<NormalizedSchema> {
  const { projectRoot, importPath, projectNameAndRootFormat } =
    await determineProjectNameAndRootOptions(host, {
      name: options.name,
      projectType: 'library',
      directory: options.directory,
      importPath: options.importPath,
      projectNameAndRootFormat: options.projectNameAndRootFormat,
      callingGenerator: '@titan/next:library',
    });
  options.projectNameAndRootFormat = projectNameAndRootFormat;

  const nxJson = readNxJson(host);
  const addPlugin =
    process.env.NX_ADD_PLUGINS !== 'false' &&
    nxJson.useInferencePlugins !== false;
  options.addPlugin ??= addPlugin;

  return {
    ...options,
    importPath,
    projectRoot,
  };
}
