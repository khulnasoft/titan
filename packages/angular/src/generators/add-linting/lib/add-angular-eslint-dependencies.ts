import {
  addDependenciesToPackageJson,
  type GeneratorCallback,
  type Tree,
} from '@titan/devkit';
import { versions } from '../../utils/version-utils';
import { isBuildableLibraryProject } from './buildable-project';

export function addAngularEsLintDependencies(
  tree: Tree,
  projectName: string
): GeneratorCallback {
  const angularEslintVersionToInstall = versions(tree).angularEslintVersion;
  const devDependencies = {
    '@angular-eslint/eslint-plugin': angularEslintVersionToInstall,
    '@angular-eslint/eslint-plugin-template': angularEslintVersionToInstall,
    '@angular-eslint/template-parser': angularEslintVersionToInstall,
  };

  if (isBuildableLibraryProject(tree, projectName)) {
    const jsoncEslintParserVersionToInstall =
      versions(tree).jsoncEslintParserVersion;
    devDependencies['jsonc-eslint-parser'] = jsoncEslintParserVersionToInstall;
  }

  return addDependenciesToPackageJson(tree, {}, devDependencies);
}
