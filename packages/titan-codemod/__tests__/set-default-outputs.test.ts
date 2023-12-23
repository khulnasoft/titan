import { setupTestFixtures } from "@titan/test-utils";
import { type Schema } from "@titan/types";
import { transformer } from "../src/transforms/set-default-outputs";

describe("set-default-outputs", () => {
  const { useFixture } = setupTestFixtures({
    directory: __dirname,
    test: "set-default-outputs",
  });
  it("migrates titan.json outputs - basic", () => {
    // load the fixture for the test
    const { root, read } = useFixture({
      fixture: "old-outputs",
    });

    // run the transformer
    const result = transformer({
      root,
      options: { force: false, dry: false, print: false },
    });

    expect(JSON.parse(read("titan.json") || "{}")).toStrictEqual({
      $schema: "https://titan.build/schema.json",
      pipeline: {
        "build-one": {
          outputs: ["foo"],
        },
        "build-two": {},
        "build-three": {
          outputs: ["dist/**", "build/**"],
        },
      },
    });

    expect(result.fatalError).toBeUndefined();
    expect(result.changes).toMatchInlineSnapshot(`
      Object {
        "titan.json": Object {
          "action": "modified",
          "additions": 2,
          "deletions": 1,
        },
      }
    `);
  });

  it("migrates titan.json outputs - workspace configs", () => {
    // load the fixture for the test
    const { root, readJson } = useFixture({
      fixture: "workspace-configs",
    });

    // run the transformer
    const result = transformer({
      root,
      options: { force: false, dry: false, print: false },
    });

    expect(readJson("titan.json") || "{}").toStrictEqual({
      $schema: "https://titan.build/schema.json",
      pipeline: {
        "build-one": {
          outputs: ["foo"],
        },
        "build-two": {},
        "build-three": {
          outputs: ["dist/**", "build/**"],
        },
      },
    });

    expect(readJson("apps/docs/titan.json") || "{}").toStrictEqual({
      $schema: "https://titan.build/schema.json",
      extends: ["//"],
      pipeline: {
        build: {
          outputs: ["dist/**", "build/**"],
        },
      },
    });

    expect(readJson("apps/web/titan.json") || "{}").toStrictEqual({
      $schema: "https://titan.build/schema.json",
      extends: ["//"],
      pipeline: {
        build: {},
      },
    });

    expect(readJson("packages/ui/titan.json") || "{}").toStrictEqual({
      $schema: "https://titan.build/schema.json",
      extends: ["//"],
      pipeline: {
        "build-three": {
          outputs: ["dist/**", "build/**"],
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
        "apps/web/titan.json": Object {
          "action": "modified",
          "additions": 1,
          "deletions": 0,
        },
        "packages/ui/titan.json": Object {
          "action": "modified",
          "additions": 1,
          "deletions": 1,
        },
        "titan.json": Object {
          "action": "modified",
          "additions": 2,
          "deletions": 1,
        },
      }
    `);
  });

  it("migrates titan.json outputs - dry", () => {
    // load the fixture for the test
    const { root, read } = useFixture({
      fixture: "old-outputs",
    });

    const titanJson = JSON.parse(read("titan.json") || "{}") as Schema;

    // run the transformer
    const result = transformer({
      root,
      options: { force: false, dry: true, print: false },
    });

    // make sure it didn't change
    expect(JSON.parse(read("titan.json") || "{}")).toEqual(titanJson);

    expect(result.fatalError).toBeUndefined();
    expect(result.changes).toMatchInlineSnapshot(`
      Object {
        "titan.json": Object {
          "action": "skipped",
          "additions": 2,
          "deletions": 1,
        },
      }
    `);
  });

  it("migrates titan.json outputs - print", () => {
    // load the fixture for the test
    const { root, read } = useFixture({
      fixture: "old-outputs",
    });

    // run the transformer
    const result = transformer({
      root,
      options: { force: false, dry: false, print: true },
    });

    expect(JSON.parse(read("titan.json") || "{}")).toStrictEqual({
      $schema: "https://titan.build/schema.json",
      pipeline: {
        "build-one": {
          outputs: ["foo"],
        },
        "build-two": {},
        "build-three": {
          outputs: ["dist/**", "build/**"],
        },
      },
    });

    expect(result.fatalError).toBeUndefined();
    expect(result.changes).toMatchInlineSnapshot(`
      Object {
        "titan.json": Object {
          "action": "modified",
          "additions": 2,
          "deletions": 1,
        },
      }
    `);
  });

  it("migrates titan.json outputs - dry & print", () => {
    // load the fixture for the test
    const { root, read } = useFixture({
      fixture: "old-outputs",
    });

    const titanJson = JSON.parse(read("titan.json") || "{}") as Schema;

    // run the transformer
    const result = transformer({
      root,
      options: { force: false, dry: true, print: false },
    });

    // make sure it didn't change
    expect(JSON.parse(read("titan.json") || "{}")).toEqual(titanJson);

    expect(result.fatalError).toBeUndefined();
    expect(result.changes).toMatchInlineSnapshot(`
      Object {
        "titan.json": Object {
          "action": "skipped",
          "additions": 2,
          "deletions": 1,
        },
      }
    `);
  });

  it("migrates titan.json outputs - invalid", () => {
    // load the fixture for the test
    const { root, read } = useFixture({
      fixture: "invalid-outputs",
    });

    // run the transformer
    const result = transformer({
      root,
      options: { force: false, dry: false, print: false },
    });

    expect(JSON.parse(read("titan.json") || "{}")).toStrictEqual({
      $schema: "https://titan.build/schema.json",
      pipeline: {
        "build-one": {
          outputs: ["foo"],
        },
        "build-two": {},
        "build-three": {
          outputs: ["dist/**", "build/**"],
        },
        "garbage-in-numeric-0": {
          outputs: ["dist/**", "build/**"],
        },
        "garbage-in-numeric": {
          outputs: 42,
        },
        "garbage-in-string": {
          outputs: "string",
        },
        "garbage-in-empty-string": {
          outputs: ["dist/**", "build/**"],
        },
        "garbage-in-null": {
          outputs: ["dist/**", "build/**"],
        },
        "garbage-in-false": {
          outputs: ["dist/**", "build/**"],
        },
        "garbage-in-true": {
          outputs: true,
        },
        "garbage-in-object": {
          outputs: {},
        },
      },
    });

    expect(result.fatalError).toBeUndefined();
    expect(result.changes).toMatchInlineSnapshot(`
      Object {
        "titan.json": Object {
          "action": "modified",
          "additions": 6,
          "deletions": 5,
        },
      }
    `);
  });

  it("migrates titan.json outputs - config with no pipeline", () => {
    // load the fixture for the test
    const { root, read } = useFixture({
      fixture: "no-pipeline",
    });

    // run the transformer
    const result = transformer({
      root,
      options: { force: false, dry: false, print: false },
    });

    expect(JSON.parse(read("titan.json") || "{}")).toStrictEqual({
      $schema: "https://titan.build/schema.json",
      globalDependencies: ["$NEXT_PUBLIC_API_KEY", "$STRIPE_API_KEY", ".env"],
      pipeline: {},
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

  it("migrates titan.json outputs - config with no outputs", () => {
    // load the fixture for the test
    const { root, read } = useFixture({
      fixture: "no-outputs",
    });

    // run the transformer
    const result = transformer({
      root,
      options: { force: false, dry: false, print: false },
    });

    expect(JSON.parse(read("titan.json") || "{}")).toStrictEqual({
      $schema: "https://titan.build/schema.json",
      pipeline: {
        "build-one": {
          dependsOn: ["build-two"],
          outputs: ["dist/**", "build/**"],
        },
        "build-two": {
          cache: false,
        },
        "build-three": {
          persistent: true,
          outputs: ["dist/**", "build/**"],
        },
      },
    });

    expect(result.fatalError).toBeUndefined();
    expect(result.changes).toMatchInlineSnapshot(`
      Object {
        "titan.json": Object {
          "action": "modified",
          "additions": 2,
          "deletions": 0,
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
