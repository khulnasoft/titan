import { Tree } from 'nx/src/generators/tree';
import { Linter, lintProjectGenerator } from '@titan/eslint';
import { joinPathFragments } from 'nx/src/utils/path';
import {
  addDependenciesToPackageJson,
  runTasksInSerial,
  updateJson,
} from '@titan/devkit';
import { extraEslintDependencies } from './lint';
import {
  addExtendsToLintConfig,
  isEslintConfigSupported,
} from '@titan/eslint/src/generators/utils/eslint-file';

export async function addLinting(
  host: Tree,
  options: {
    linter: Linter;
    name: string;
    projectRoot: string;
    unitTestRunner?: 'vitest' | 'none';
    setParserOptionsProject?: boolean;
    skipPackageJson?: boolean;
    rootProject?: boolean;
    addPlugin?: boolean;
  },
  projectType: 'lib' | 'app'
) {
  if (options.linter === Linter.EsLint) {
    const lintTask = await lintProjectGenerator(host, {
      linter: options.linter,
      project: options.name,
      tsConfigPaths: [
        joinPathFragments(options.projectRoot, `tsconfig.${projectType}.json`),
      ],
      unitTestRunner: options.unitTestRunner,
      skipFormat: true,
      setParserOptionsProject: options.setParserOptionsProject,
      rootProject: options.rootProject,
      addPlugin: options.addPlugin,
    });

    if (isEslintConfigSupported(host)) {
      addExtendsToLintConfig(host, options.projectRoot, [
        'plugin:vue/vue3-essential',
        'eslint:recommended',
        '@vue/eslint-config-typescript',
        '@vue/eslint-config-prettier/skip-formatting',
      ]);
    }

    editEslintConfigFiles(host, options.projectRoot, options.rootProject);

    let installTask = () => {};
    if (!options.skipPackageJson) {
      installTask = addDependenciesToPackageJson(
        host,
        extraEslintDependencies.dependencies,
        extraEslintDependencies.devDependencies
      );
    }

    return runTasksInSerial(lintTask, installTask);
  } else {
    return () => {};
  }
}

export function editEslintConfigFiles(
  tree: Tree,
  projectRoot: string,
  rootProject?: boolean
) {
  if (tree.exists(joinPathFragments(projectRoot, 'eslint.config.js'))) {
    const fileName = joinPathFragments(projectRoot, 'eslint.config.js');
    updateJson(tree, fileName, (json) => {
      let updated = false;
      for (let override of json.overrides) {
        if (override.parserOptions) {
          if (!override.files.includes('*.vue')) {
            override.files.push('*.vue');
          }
          updated = true;
        }
      }
      if (!updated) {
        json.overrides = [
          {
            files: ['*.ts', '*.tsx', '*.js', '*.jsx', '*.vue'],
            rules: { 'vue/multi-word-component-names': 'off' },
          },
        ];
      }
      return json;
    });
  } else {
    const fileName = joinPathFragments(projectRoot, '.eslintrc.json');
    updateJson(tree, fileName, (json) => {
      let updated = false;
      for (let override of json.overrides) {
        if (override.parserOptions) {
          if (!override.files.includes('*.vue')) {
            override.files.push('*.vue');
          }
          updated = true;
        }
      }
      if (!updated) {
        json.overrides = [
          {
            files: ['*.ts', '*.tsx', '*.js', '*.jsx', '*.vue'],
            rules: { 'vue/multi-word-component-names': 'off' },
          },
        ];
      }
      return json;
    });
  }

  // Edit root config too
  if (tree.exists('.eslintrc.base.json')) {
    updateJson(tree, '.eslintrc.base.json', (json) => {
      for (let override of json.overrides) {
        if (
          override.rules &&
          '@nx/enforce-module-boundaries' in override.rules
        ) {
          if (!override.files.includes('*.vue')) {
            override.files.push('*.vue');
          }
        }
      }
      return json;
    });
  } else if (tree.exists('.eslintrc.json') && !rootProject) {
    updateJson(tree, '.eslintrc.json', (json) => {
      for (let override of json.overrides) {
        if (
          override.rules &&
          '@nx/enforce-module-boundaries' in override.rules
        ) {
          if (!override.files.includes('*.vue')) {
            override.files.push('*.vue');
          }
        }
      }
      return json;
    });
  }
}
