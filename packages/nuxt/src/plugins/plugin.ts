import {
  CreateDependencies,
  CreateNodes,
  CreateNodesContext,
  detectPackageManager,
  joinPathFragments,
  readJsonFile,
  TargetConfiguration,
  workspaceRoot,
  writeJsonFile,
} from '@titan/devkit';
import { basename, dirname, isAbsolute, join, relative } from 'path';
import { projectGraphCacheDirectory } from 'nx/src/utils/cache-directory';
import { getNamedInputs } from '@titan/devkit/src/utils/get-named-inputs';
import { existsSync, readdirSync } from 'fs';
import { loadNuxtKitDynamicImport } from '../utils/executor-utils';
import { calculateHashForCreateNodes } from '@titan/devkit/src/utils/calculate-hash-for-create-nodes';
import { getLockFileName } from '@nx/js';

const cachePath = join(projectGraphCacheDirectory, 'nuxt.hash');
const targetsCache = existsSync(cachePath) ? readTargetsCache() : {};

const calculatedTargets: Record<
  string,
  Record<string, TargetConfiguration>
> = {};

function readTargetsCache(): Record<
  string,
  Record<string, TargetConfiguration>
> {
  return readJsonFile(cachePath);
}

function writeTargetsToCache(
  targets: Record<string, Record<string, TargetConfiguration>>
) {
  writeJsonFile(cachePath, targets);
}

export const createDependencies: CreateDependencies = () => {
  writeTargetsToCache(calculatedTargets);
  return [];
};

export interface NuxtPluginOptions {
  buildTargetName?: string;
  serveTargetName?: string;
  serveStaticTargetName?: string;
  buildStaticTargetName?: string;
}

export const createNodes: CreateNodes<NuxtPluginOptions> = [
  '**/nuxt.config.{js,ts,mjs,mts,cjs,cts}',
  async (configFilePath, options, context) => {
    const projectRoot = dirname(configFilePath);
    // Do not create a project if package.json and project.json isn't there.
    const siblingFiles = readdirSync(join(context.workspaceRoot, projectRoot));
    if (
      !siblingFiles.includes('package.json') &&
      !siblingFiles.includes('project.json')
    ) {
      return {};
    }

    options = normalizeOptions(options);

    const hash = calculateHashForCreateNodes(projectRoot, options, context, [
      getLockFileName(detectPackageManager(context.workspaceRoot)),
    ]);
    const targets = targetsCache[hash]
      ? targetsCache[hash]
      : await buildNuxtTargets(configFilePath, projectRoot, options, context);

    calculatedTargets[hash] = targets;

    return {
      projects: {
        [projectRoot]: {
          root: projectRoot,
          targets,
        },
      },
    };
  },
];

async function buildNuxtTargets(
  configFilePath: string,
  projectRoot: string,
  options: NuxtPluginOptions,
  context: CreateNodesContext
) {
  const nuxtConfig: {
    buildDir: string;
  } = await getInfoFromNuxtConfig(configFilePath, context, projectRoot);

  const { buildOutputs } = getOutputs(nuxtConfig, projectRoot);

  const namedInputs = getNamedInputs(projectRoot, context);

  const targets: Record<string, TargetConfiguration> = {};

  targets[options.buildTargetName] = buildTarget(
    options.buildTargetName,
    namedInputs,
    buildOutputs,
    projectRoot
  );

  targets[options.serveTargetName] = serveTarget(projectRoot);

  targets[options.serveStaticTargetName] = serveStaticTarget(options);

  targets[options.buildStaticTargetName] = buildStaticTarget(
    options.buildStaticTargetName,
    namedInputs,
    buildOutputs,
    projectRoot
  );

  return targets;
}

function buildTarget(
  buildTargetName: string,
  namedInputs: {
    [inputName: string]: any[];
  },
  buildOutputs: string[],
  projectRoot: string
) {
  return {
    command: `nuxt build`,
    options: { cwd: projectRoot },
    cache: true,
    dependsOn: [`^${buildTargetName}`],
    inputs: [
      ...('production' in namedInputs
        ? ['production', '^production']
        : ['default', '^default']),

      {
        externalDependencies: ['nuxt'],
      },
    ],
    outputs: buildOutputs,
  };
}

function serveTarget(projectRoot: string) {
  const targetConfig: TargetConfiguration = {
    command: `nuxt dev`,
    options: {
      cwd: projectRoot,
    },
  };

  return targetConfig;
}

function serveStaticTarget(options: NuxtPluginOptions) {
  const targetConfig: TargetConfiguration = {
    executor: '@nx/web:file-server',
    options: {
      buildTarget: `${options.buildStaticTargetName}`,
      staticFilePath: '{projectRoot}/dist',
      port: 4200,
    },
  };

  return targetConfig;
}

function buildStaticTarget(
  buildStaticTargetName: string,
  namedInputs: {
    [inputName: string]: any[];
  },
  buildOutputs: string[],
  projectRoot: string
) {
  const targetConfig: TargetConfiguration = {
    command: `nuxt build --prerender`,
    options: { cwd: projectRoot },
    cache: true,
    dependsOn: [`^${buildStaticTargetName}`],
    inputs: [
      ...('production' in namedInputs
        ? ['production', '^production']
        : ['default', '^default']),

      {
        externalDependencies: ['nuxt'],
      },
    ],
    outputs: buildOutputs,
  };
  return targetConfig;
}

async function getInfoFromNuxtConfig(
  configFilePath: string,
  context: CreateNodesContext,
  projectRoot: string
): Promise<{
  buildDir: string;
}> {
  const { loadNuxtConfig } = await loadNuxtKitDynamicImport();

  const config = await loadNuxtConfig({
    cwd: joinPathFragments(context.workspaceRoot, projectRoot),
    configFile: basename(configFilePath),
  });

  return {
    buildDir: config?.buildDir,
  };
}

function getOutputs(
  nuxtConfig: { buildDir: string },
  projectRoot: string
): {
  buildOutputs: string[];
} {
  let nuxtBuildDir = nuxtConfig?.buildDir;
  if (nuxtConfig?.buildDir && basename(nuxtConfig?.buildDir) === '.nuxt') {
    // if buildDir exists, it will be `something/something/.nuxt`
    // we want the "general" outputPath to be `something/something`
    nuxtBuildDir = nuxtConfig.buildDir.replace(
      basename(nuxtConfig.buildDir),
      ''
    );
  }
  const buildOutputPath = normalizeOutputPath(nuxtBuildDir, projectRoot);

  return {
    buildOutputs: [buildOutputPath],
  };
}

function normalizeOutputPath(
  outputPath: string | undefined,
  projectRoot: string
): string {
  if (!outputPath) {
    if (projectRoot === '.') {
      return `{projectRoot}`;
    } else {
      return `{workspaceRoot}/{projectRoot}`;
    }
  } else {
    if (isAbsolute(outputPath)) {
      return `{workspaceRoot}/${relative(workspaceRoot, outputPath)}`;
    } else {
      if (outputPath.startsWith('..')) {
        return join('{workspaceRoot}', join(projectRoot, outputPath));
      } else {
        return join('{projectRoot}', outputPath);
      }
    }
  }
}

function normalizeOptions(options: NuxtPluginOptions): NuxtPluginOptions {
  options ??= {};
  options.buildTargetName ??= 'build';
  options.serveTargetName ??= 'serve';
  options.serveStaticTargetName ??= 'serve-static';
  options.buildStaticTargetName ??= 'build-static';
  return options;
}
