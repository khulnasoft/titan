import { formatFiles, getProjects, Tree } from '@titan/devkit';
import { createNodes } from '../../plugins/plugin';

import { createProjectRootMappingsFromProjectConfigurations } from 'nx/src/project-graph/utils/find-project-for-path';
import { replaceProjectConfigurationsWithPlugin } from '@titan/devkit/src/utils/replace-project-configuration-with-plugin';

export default async function update(tree: Tree) {
  const proj = Object.fromEntries(getProjects(tree).entries());

  const rootMappings = createProjectRootMappingsFromProjectConfigurations(proj);

  await replaceProjectConfigurationsWithPlugin(
    tree,
    rootMappings,
    '@nx/<%= dirName %>/plugin',
    createNodes,
    {
      targetName: 'TODO',
    }
  );

  await formatFiles(tree);
}
