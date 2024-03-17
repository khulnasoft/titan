import type { Tree } from '@titan/devkit';
import { joinPathFragments, updateJson } from '@titan/devkit';
import type { NormalizedOptions } from '../schema';

export function updateTsConfig(tree: Tree, options: NormalizedOptions): void {
  updateJson(
    tree,
    joinPathFragments(options.appProjectRoot, 'tsconfig.app.json'),
    (json) => {
      json.compilerOptions.emitDecoratorMetadata = true;
      json.compilerOptions.target = 'es2021';
      if (options.strict) {
        json.compilerOptions = {
          ...json.compilerOptions,
          strictNullChecks: true,
          noImplicitAny: true,
          strictBindCallApply: true,
          forceConsistentCasingInFileNames: true,
          noFallthroughCasesInSwitch: true,
        };
      }
      return json;
    }
  );
}
