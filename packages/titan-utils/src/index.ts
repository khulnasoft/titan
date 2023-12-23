// utils
export { getTitanRoot } from "./getTitanRoot";
export { getTitanConfigs, getWorkspaceConfigs } from "./getTitanConfigs";
export { searchUp } from "./searchUp";
export {
  getAvailablePackageManagers,
  getPackageManagersBinPaths,
} from "./managers";
export { isFolderEmpty } from "./isFolderEmpty";
export { validateDirectory } from "./validateDirectory";
export {
  isUrlOk,
  getRepoInfo,
  hasRepo,
  existsInRepo,
  downloadAndExtractRepo,
  downloadAndExtractExample,
} from "./examples";
export { isWriteable } from "./isWriteable";
export { createProject, DownloadError } from "./createProject";
export { convertCase } from "./convertCase";

export * as logger from "./logger";

// types
export type { RepoInfo } from "./examples";
export type {
  TitanConfig,
  TitanConfigs,
  WorkspaceConfig,
} from "./getTitanConfigs";
export * from "./types";
