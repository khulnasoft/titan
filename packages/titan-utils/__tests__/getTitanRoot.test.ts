import path from "path";
import { getTitanRoot } from "../src/getTitanRoot";
import { setupTestFixtures } from "@titan/test-utils";

describe("getTitanConfigs", () => {
  const { useFixture } = setupTestFixtures({
    directory: path.join(__dirname, "../"),
    test: "common",
  });

  test.each([[""], ["child"]])(
    "finds the root in a non-monorepo (%s)",
    (repoPath) => {
      const { root } = useFixture({ fixture: `single-package` });
      const titanRoot = getTitanRoot(path.join(root, repoPath));
      expect(titanRoot).toEqual(root);
    }
  );

  test.each([
    [""],
    ["apps"],
    ["apps/docs"],
    ["apps/web"],
    ["packages"],
    ["packages/ui"],
    ["not-a-real/path"],
  ])("finds the root in a monorepo with workspace configs (%s)", (repoPath) => {
    const { root } = useFixture({ fixture: `workspace-configs` });
    const titanRoot = getTitanRoot(path.join(root, repoPath));
    expect(titanRoot).toEqual(root);
  });
});
