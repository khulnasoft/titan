import type { Tree } from '@titan/devkit';
import {
  joinPathFragments,
  normalizePath,
  readProjectConfiguration,
  visitNotIgnoredFiles,
} from '@titan/devkit';
import { basename, dirname } from 'path';
import type { MoveImplOptions } from './types';

const libraryExecutors = [
  '@angular-devkit/build-angular:ng-packagr',
  '@titan/angular:ng-packagr-lite',
  '@titan/angular:package',
  // TODO(v17): remove when @nrwl/* scope is removed
  '@nrwl/angular:ng-packagr-lite',
  '@nrwl/angular:package',
];

export function updateSecondaryEntryPoints(
  tree: Tree,
  schema: MoveImplOptions
): void {
  if (schema.oldProjectName === schema.newProjectName) {
    return;
  }

  const project = readProjectConfiguration(tree, schema.newProjectName);

  if (project.projectType !== 'library') {
    return;
  }

  if (
    !Object.values(project.targets ?? {}).some((target) =>
      libraryExecutors.includes(target.executor)
    )
  ) {
    return;
  }

  visitNotIgnoredFiles(tree, project.root, (filePath) => {
    if (
      basename(filePath) !== 'ng-package.json' ||
      normalizePath(filePath) ===
        joinPathFragments(project.root, 'ng-package.json')
    ) {
      return;
    }

    updateReadme(
      tree,
      dirname(filePath),
      schema.oldProjectName,
      schema.newProjectName
    );
  });
}

function updateReadme(
  tree: Tree,
  dir: string,
  oldProjectName: string,
  newProjectName: string
) {
  const readmePath = joinPathFragments(dir, 'README.md');
  if (!tree.exists(readmePath)) {
    return;
  }

  const findName = new RegExp(`${oldProjectName}`, 'g');
  const oldContent = tree.read(readmePath, 'utf-8');
  const newContent = oldContent.replace(findName, newProjectName);
  tree.write(readmePath, newContent);
}
