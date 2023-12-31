/**
 * Definitions for globals that are injected by the Titanpack runtime.
 *
 * These are available from every module, but should only be used by Titanpack
 * code, not by user code.
 */

type UpdateCallback = (update: ServerMessage) => void;

type ChunkRegistry = {
  push: (registration: ChunkRegistration) => void;
};

type ChunkListProvider = {
  push: (registration: ChunkList) => void;
};

type ChunkUpdateProvider = {
  push: (registration: [ChunkPath, UpdateCallback]) => void;
};

declare var TITANPACK: ChunkRegistry | ChunkRegistration[] | undefined;
declare var TITANPACK_CHUNK_LISTS: ChunkListProvider | ChunkList[] | undefined;
declare var TITANPACK_CHUNK_UPDATE_LISTENERS:
  | ChunkUpdateProvider
  | [ChunkPath, UpdateCallback][]
  | undefined;
// This is used by the Next.js integration test suite to notify it when HMR
// updates have been completed.
declare var __NEXT_HMR_CB: undefined | null | (() => void);
