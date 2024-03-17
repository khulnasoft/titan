import type { Tree } from '@titan/devkit';
import { getProjects } from '@titan/devkit';

export function validateProject(tree: Tree, projectName: string): void {
  const projects = getProjects(tree);

  if (!projects.has(projectName)) {
    throw new Error(
      `Project "${projectName}" does not exist! Please provide an existing project name.`
    );
  }
}
