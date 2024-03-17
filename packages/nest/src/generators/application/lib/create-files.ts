import type { Tree } from '@titan/devkit';
import { generateFiles, joinPathFragments } from '@titan/devkit';
import type { NormalizedOptions } from '../schema';

export function createFiles(tree: Tree, options: NormalizedOptions): void {
  generateFiles(
    tree,
    joinPathFragments(__dirname, '..', 'files'),
    joinPathFragments(options.appProjectRoot, 'src'),
    {
      tmpl: '',
      name: options.appProjectName,
      root: options.appProjectRoot,
    }
  );
}
