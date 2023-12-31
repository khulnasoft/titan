import { setupTestFixtures } from "@titan/test-utils";
import { transformer } from "../src/transforms/stabilize-env-mode";

describe.only("stabilize-env-mode", () => {
  const { useFixture } = setupTestFixtures({
    directory: __dirname,
    test: "stabilize-env-mode",
  });

  it("migrates env-mode has-both", () => {
    // load the fixture for the test
    const { root, read } = useFixture({
      fixture: "has-both",
    });

    // run the transformer
    const result = transformer({
      root,
      options: { force: false, dry: false, print: false },
    });

    expect(JSON.parse(read("titan.json") || "{}")).toStrictEqual({
      $schema: "https://titan.build/schema.json",
      globalPassThroughEnv: [
        "EXPERIMENTAL_GLOBAL_PASSTHROUGH",
        "GLOBAL_PASSTHROUGH",
      ],
      pipeline: {
        build: {
          passThroughEnv: ["EXPERIMENTAL_TASK_PASSTHROUGH", "TASK_PASSTHROUGH"],
        },
      },
    });

    expect(result.fatalError).toBeUndefined();
    expect(result.changes).toMatchInlineSnapshot(`
      Object {
        "titan.json": Object {
          "action": "modified",
          "additions": 2,
          "deletions": 4,
        },
      }
    `);
  });

  it("migrates env-mode has-duplicates", () => {
    // load the fixture for the test
    const { root, read } = useFixture({
      fixture: "has-duplicates",
    });

    // run the transformer
    const result = transformer({
      root,
      options: { force: false, dry: false, print: false },
    });

    expect(JSON.parse(read("titan.json") || "{}")).toStrictEqual({
      $schema: "https://titan.build/schema.json",
      globalPassThroughEnv: [
        "DUPLICATE_GLOBAL",
        "EXPERIMENTAL_GLOBAL_PASSTHROUGH",
        "GLOBAL_PASSTHROUGH",
      ],
      pipeline: {
        build: {
          passThroughEnv: [
            "DUPLICATE_TASK",
            "EXPERIMENTAL_TASK_PASSTHROUGH",
            "TASK_PASSTHROUGH",
          ],
        },
      },
    });

    expect(result.fatalError).toBeUndefined();
    expect(result.changes).toMatchInlineSnapshot(`
      Object {
        "titan.json": Object {
          "action": "modified",
          "additions": 2,
          "deletions": 6,
        },
      }
    `);
  });

  it("migrates env-mode has-empty", () => {
    // load the fixture for the test
    const { root, read } = useFixture({
      fixture: "has-empty",
    });

    // run the transformer
    const result = transformer({
      root,
      options: { force: false, dry: false, print: false },
    });

    expect(JSON.parse(read("titan.json") || "{}")).toStrictEqual({
      $schema: "https://titan.build/schema.json",
      globalPassThroughEnv: [],
      pipeline: {
        build: {
          passThroughEnv: [],
        },
      },
    });

    expect(result.fatalError).toBeUndefined();
    expect(result.changes).toMatchInlineSnapshot(`
      Object {
        "titan.json": Object {
          "action": "modified",
          "additions": 2,
          "deletions": 2,
        },
      }
    `);
  });

  it("migrates env-mode has-neither", () => {
    // load the fixture for the test
    const { root, read } = useFixture({
      fixture: "has-neither",
    });

    // run the transformer
    const result = transformer({
      root,
      options: { force: false, dry: false, print: false },
    });

    expect(JSON.parse(read("titan.json") || "{}")).toStrictEqual({
      $schema: "https://titan.build/schema.json",
      pipeline: {
        build: {},
      },
    });

    expect(result.fatalError).toBeUndefined();
    expect(result.changes).toMatchInlineSnapshot(`
      Object {
        "titan.json": Object {
          "action": "unchanged",
          "additions": 0,
          "deletions": 0,
        },
      }
    `);
  });

  it("migrates env-mode has-new", () => {
    // load the fixture for the test
    const { root, read } = useFixture({
      fixture: "has-new",
    });

    // run the transformer
    const result = transformer({
      root,
      options: { force: false, dry: false, print: false },
    });

    expect(JSON.parse(read("titan.json") || "{}")).toStrictEqual({
      $schema: "https://titan.build/schema.json",
      globalPassThroughEnv: ["GLOBAL_PASSTHROUGH"],
      pipeline: {
        build: {
          passThroughEnv: ["TASK_PASSTHROUGH"],
        },
      },
    });

    expect(result.fatalError).toBeUndefined();
    expect(result.changes).toMatchInlineSnapshot(`
      Object {
        "titan.json": Object {
          "action": "unchanged",
          "additions": 0,
          "deletions": 0,
        },
      }
    `);
  });

  it("migrates env-mode has-old", () => {
    // load the fixture for the test
    const { root, read } = useFixture({
      fixture: "has-old",
    });

    // run the transformer
    const result = transformer({
      root,
      options: { force: false, dry: false, print: false },
    });

    expect(JSON.parse(read("titan.json") || "{}")).toStrictEqual({
      $schema: "https://titan.build/schema.json",
      globalPassThroughEnv: ["GLOBAL_PASSTHROUGH"],
      pipeline: {
        build: {
          passThroughEnv: ["TASK_PASSTHROUGH"],
        },
      },
    });

    expect(result.fatalError).toBeUndefined();
    expect(result.changes).toMatchInlineSnapshot(`
      Object {
        "titan.json": Object {
          "action": "modified",
          "additions": 2,
          "deletions": 2,
        },
      }
    `);
  });

  it("migrates env-mode workspace-configs", () => {
    // load the fixture for the test
    const { root, read } = useFixture({
      fixture: "workspace-configs",
    });

    // run the transformer
    const result = transformer({
      root,
      options: { force: false, dry: false, print: false },
    });

    expect(JSON.parse(read("titan.json") || "{}")).toStrictEqual({
      $schema: "https://titan.build/schema.json",
      globalPassThroughEnv: [
        "EXPERIMENTAL_GLOBAL_PASSTHROUGH",
        "GLOBAL_PASSTHROUGH",
      ],
      pipeline: {
        build: {
          passThroughEnv: ["EXPERIMENTAL_TASK_PASSTHROUGH", "TASK_PASSTHROUGH"],
        },
      },
    });

    expect(JSON.parse(read("apps/docs/titan.json") || "{}")).toStrictEqual({
      extends: ["//"],
      pipeline: {
        build: {
          passThroughEnv: [
            "DOCS_TASK_PASSTHROUGH",
            "EXPERIMENTAL_DOCS_TASK_PASSTHROUGH",
          ],
        },
      },
    });

    expect(JSON.parse(read("apps/website/titan.json") || "{}")).toStrictEqual({
      extends: ["//"],
      pipeline: {
        build: {
          passThroughEnv: [
            "EXPERIMENTAL_WEBSITE_TASK_PASSTHROUGH",
            "WEBSITE_TASK_PASSTHROUGH",
          ],
        },
      },
    });

    expect(result.fatalError).toBeUndefined();
    expect(result.changes).toMatchInlineSnapshot(`
      Object {
        "apps/docs/titan.json": Object {
          "action": "modified",
          "additions": 1,
          "deletions": 1,
        },
        "apps/website/titan.json": Object {
          "action": "modified",
          "additions": 1,
          "deletions": 2,
        },
        "titan.json": Object {
          "action": "modified",
          "additions": 2,
          "deletions": 4,
        },
      }
    `);
  });

  it("errors if no titan.json can be found", () => {
    // load the fixture for the test
    const { root, read } = useFixture({
      fixture: "no-titan-json",
    });

    expect(read("titan.json")).toBeUndefined();

    // run the transformer
    const result = transformer({
      root,
      options: { force: false, dry: false, print: false },
    });

    expect(read("titan.json")).toBeUndefined();
    expect(result.fatalError).toBeDefined();
    expect(result.fatalError?.message).toMatch(
      /No titan\.json found at .*?\. Is the path correct\?/
    );
  });

  it("errors if package.json config exists and has not been migrated", () => {
    // load the fixture for the test
    const { root } = useFixture({
      fixture: "old-config",
    });

    // run the transformer
    const result = transformer({
      root,
      options: { force: false, dry: false, print: false },
    });

    expect(result.fatalError).toBeDefined();
    expect(result.fatalError?.message).toMatch(
      'titan" key detected in package.json. Run `npx @titan/codemod transform create-titan-config` first'
    );
  });
});
