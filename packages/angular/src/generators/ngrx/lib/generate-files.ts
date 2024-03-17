import type { Tree } from '@titan/devkit';
import { generateFiles, joinPathFragments, names } from '@titan/devkit';
import { lt } from 'semver';
import { NormalizedNgRxGeneratorOptions } from './normalize-options';

/**
 * Generate 'feature' scaffolding: actions, reducer, effects, interfaces, selectors, facade
 */
export function generateNgrxFilesFromTemplates(
  tree: Tree,
  options: NormalizedNgRxGeneratorOptions
): void {
  const name = options.name;
  const projectNames = names(name);

  generateFiles(
    tree,
    joinPathFragments(__dirname, '..', 'files'),
    options.parentDirectory,
    {
      ...options,
      ...projectNames,
      importFromOperators: lt(options.rxjsVersion, '7.2.0'),
      tmpl: '',
    }
  );

  if (!options.facade) {
    tree.delete(
      joinPathFragments(
        options.parentDirectory,
        options.directory,
        `${projectNames.fileName}.facade.ts`
      )
    );
    tree.delete(
      joinPathFragments(
        options.parentDirectory,
        options.directory,
        `${projectNames.fileName}.facade.spec.ts`
      )
    );
  }
}
