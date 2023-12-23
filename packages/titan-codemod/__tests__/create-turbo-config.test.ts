import { setupTestFixtures } from "@titan/test-utils";
import fs from "fs-extra";
import { transformer } from "../src/transforms/create-titan-config";

describe("create-titan-config", () => {
  const { useFixture } = setupTestFixtures({
    directory: __dirname,
    test: "create-titan-config",
  });

  test("package.json config exists but no titan.json config - basic", () => {
    // load the fixture for the test
    const { root, read } = useFixture({ fixture: "no-titan-json-config" });

    // titan.json should not exist
    expect(read("titan.json")).toBeUndefined();

    // get config from package.json for comparison later
    const titanConfig = JSON.parse(read("package.json") || "{}").titan;
    expect(titanConfig).toBeDefined();
    // run the transformer
    const result = transformer({
      root,
      options: { force: false, dry: false, print: false },
    });

    // titan.json should now exist (and match the package.json config)
    expect(JSON.parse(read("titan.json") || "{}")).toEqual(titanConfig);

    // result should be correct
    expect(result.fatalError).toBeUndefined();
    expect(result.changes).toMatchInlineSnapshot(`
      Object {
        "package.json": Object {
          "action": "modified",
          "additions": 0,
          "deletions": 1,
        },
        "titan.json": Object {
          "action": "modified",
          "additions": 1,
          "deletions": 0,
        },
      }
    `);
  });

  test("package.json config exists but no titan.json config - repeat run", () => {
    // load the fixture for the test
    const { root, read } = useFixture({ fixture: "no-titan-json-config" });

    // titan.json should not exist
    expect(read("titan.json")).toBeUndefined();

    // get config from package.json for comparison later
    const titanConfig = JSON.parse(read("package.json") || "{}").titan;
    expect(titanConfig).toBeDefined();
    // run the transformer
    const result = transformer({
      root,
      options: { force: false, dry: false, print: false },
    });

    // titan.json should now exist (and match the package.json config)
    expect(JSON.parse(read("titan.json") || "{}")).toEqual(titanConfig);

    // result should be correct
    expect(result.fatalError).toBeUndefined();
    expect(result.changes).toMatchInlineSnapshot(`
      Object {
        "package.json": Object {
          "action": "modified",
          "additions": 0,
          "deletions": 1,
        },
        "titan.json": Object {
          "action": "modified",
          "additions": 1,
          "deletions": 0,
        },
      }
    `);

    // run the transformer
    const repeatResult = transformer({
      root,
      options: { force: false, dry: false, print: false },
    });
    // result should be correct
    expect(repeatResult.fatalError).toBeUndefined();
    expect(repeatResult.changes).toMatchInlineSnapshot(`
      Object {
        "package.json": Object {
          "action": "unchanged",
          "additions": 0,
          "deletions": 0,
        },
        "titan.json": Object {
          "action": "unchanged",
          "additions": 0,
          "deletions": 0,
        },
      }
    `);
  });

  test("package.json config exists but no titan.json config - dry", () => {
    // load the fixture for the test
    const { root, read } = useFixture({ fixture: "no-titan-json-config" });

    // titan.json should not exist
    expect(read("titan.json")).toBeUndefined();

    // get config from package.json for comparison later
    const titanConfig = JSON.parse(read("package.json") || "{}").titan;
    expect(titanConfig).toBeDefined();
    // run the transformer
    const result = transformer({
      root,
      options: { force: false, dry: true, print: false },
    });

    // titan.json still not exist (dry run)
    expect(read("titan.json")).toBeUndefined();

    // result should be correct
    expect(result.fatalError).toBeUndefined();
    expect(result.changes).toMatchInlineSnapshot(`
      Object {
        "package.json": Object {
          "action": "skipped",
          "additions": 0,
          "deletions": 1,
        },
        "titan.json": Object {
          "action": "skipped",
          "additions": 1,
          "deletions": 0,
        },
      }
    `);
  });

  test("package.json config exists but no titan.json config - print", () => {
    // load the fixture for the test
    const { root, read } = useFixture({ fixture: "no-titan-json-config" });

    // titan.json should not exist
    expect(read("titan.json")).toBeUndefined();

    // get config from package.json for comparison later
    const titanConfig = JSON.parse(read("package.json") || "{}").titan;
    expect(titanConfig).toBeDefined();
    // run the transformer
    const result = transformer({
      root,
      options: { force: false, dry: false, print: true },
    });

    // titan.json should now exist (and match the package.json config)
    expect(JSON.parse(read("titan.json") || "{}")).toEqual(titanConfig);

    // result should be correct
    expect(result.fatalError).toBeUndefined();
    expect(result.changes).toMatchInlineSnapshot(`
      Object {
        "package.json": Object {
          "action": "modified",
          "additions": 0,
          "deletions": 1,
        },
        "titan.json": Object {
          "action": "modified",
          "additions": 1,
          "deletions": 0,
        },
      }
    `);
  });

  test("package.json config exists but no titan.json config - dry & print", () => {
    // load the fixture for the test
    const { root, read } = useFixture({ fixture: "no-titan-json-config" });

    // titan.json should not exist
    expect(read("titan.json")).toBeUndefined();

    // get config from package.json for comparison later
    const titanConfig = JSON.parse(read("package.json") || "{}").titan;
    expect(titanConfig).toBeDefined();
    // run the transformer
    const result = transformer({
      root,
      options: { force: false, dry: true, print: true },
    });

    // titan.json still not exist (dry run)
    expect(read("titan.json")).toBeUndefined();

    // result should be correct
    expect(result.fatalError).toBeUndefined();
    expect(result.changes).toMatchInlineSnapshot(`
      Object {
        "package.json": Object {
          "action": "skipped",
          "additions": 0,
          "deletions": 1,
        },
        "titan.json": Object {
          "action": "skipped",
          "additions": 1,
          "deletions": 0,
        },
      }
    `);
  });

  test("no package.json config or titan.json file exists", () => {
    // load the fixture for the test
    const { root, read } = useFixture({ fixture: "no-package-json-config" });

    // titan.json should not exist
    expect(read("titan.json")).toBeUndefined();

    // get config from package.json for comparison later
    const packageJsonConfig = JSON.parse(read("package.json") || "{}");
    const titanConfig = packageJsonConfig.titan;
    expect(titanConfig).toBeUndefined();
    // run the transformer
    const result = transformer({
      root,
      options: { force: false, dry: false, print: false },
    });

    // titan.json should still not exist
    expect(read("titan.json")).toBeUndefined();

    // make sure we didn't change the package.json
    expect(JSON.parse(read("package.json") || "{}")).toEqual(packageJsonConfig);

    // result should be correct
    expect(result.fatalError).toBeUndefined();
    expect(result.changes).toMatchInlineSnapshot(`
      Object {
        "package.json": Object {
          "action": "unchanged",
          "additions": 0,
          "deletions": 0,
        },
        "titan.json": Object {
          "action": "unchanged",
          "additions": 0,
          "deletions": 0,
        },
      }
    `);
  });

  test("no package.json file exists", () => {
    // load the fixture for the test
    const { root, read } = useFixture({ fixture: "no-package-json-file" });

    // titan.json should not exist
    expect(read("titan.json")).toBeUndefined();

    // run the transformer
    const result = transformer({
      root,
      options: { force: false, dry: false, print: false },
    });

    // titan.json should still not exist
    expect(read("titan.json")).toBeUndefined();

    // result should be correct
    expect(result.fatalError?.message).toMatch(
      /No package\.json found at .*?\. Is the path correct\?/
    );
  });

  test("titan.json file exists and no package.json config exists", () => {
    // load the fixture for the test
    const { root, read } = useFixture({ fixture: "titan-json-config" });

    // titan.json should exist
    expect(read("titan.json")).toBeDefined();

    // no config should exist in package.json
    const packageJsonConfig = JSON.parse(read("package.json") || "{}");
    const titanConfig = packageJsonConfig.titan;
    expect(titanConfig).toBeUndefined();

    // run the transformer
    const result = transformer({
      root,
      options: { force: false, dry: false, print: false },
    });

    // titan.json should still exist
    expect(read("titan.json")).toBeDefined();

    // make sure we didn't change the package.json
    expect(JSON.parse(read("package.json") || "{}")).toEqual(packageJsonConfig);

    // result should be correct
    expect(result.fatalError).toBeUndefined();
    expect(result.changes).toMatchInlineSnapshot(`
      Object {
        "package.json": Object {
          "action": "unchanged",
          "additions": 0,
          "deletions": 0,
        },
        "titan.json": Object {
          "action": "unchanged",
          "additions": 0,
          "deletions": 0,
        },
      }
    `);
  });

  test("titan.json file exists and package.json config exists", () => {
    // load the fixture for the test
    const { root, read } = useFixture({ fixture: "both-configs" });

    // titan.json should exist
    const titanJsonConfig = JSON.parse(read("titan.json") || "{}");
    expect(titanJsonConfig.pipeline).toBeDefined();

    // no config should exist in package.json
    const packageJsonConfig = JSON.parse(read("package.json") || "{}");
    const titanConfig = JSON.parse(read("package.json") || "{}").titan;
    expect(titanConfig).toBeDefined();

    // run the transformer
    const result = transformer({
      root,
      options: { force: false, dry: false, print: false },
    });

    // make sure we didn't change the package.json
    expect(JSON.parse(read("package.json") || "{}")).toEqual(packageJsonConfig);

    // make sure we didn't change the titan.json
    expect(JSON.parse(read("titan.json") || "{}")).toEqual(titanJsonConfig);

    // result should be correct
    expect(result.fatalError?.message).toBeUndefined();
    expect(result.changes).toMatchInlineSnapshot(`
      Object {
        "package.json": Object {
          "action": "unchanged",
          "additions": 0,
          "deletions": 0,
        },
        "titan.json": Object {
          "action": "unchanged",
          "additions": 0,
          "deletions": 0,
        },
      }
    `);
  });

  test("errors when unable to write json", () => {
    // load the fixture for the test
    const { root, read } = useFixture({ fixture: "no-titan-json-config" });

    // titan.json should not exist
    expect(read("titan.json")).toBeUndefined();

    // get config from package.json for comparison later
    const titanConfig = JSON.parse(read("package.json") || "{}").titan;
    expect(titanConfig).toBeDefined();

    const mockWriteJsonSync = jest
      .spyOn(fs, "writeJsonSync")
      .mockImplementation(() => {
        throw new Error("could not write file");
      });

    // run the transformer
    const result = transformer({
      root,
      options: { force: false, dry: false, print: false },
    });

    // titan.json should still not exist (error writing)
    expect(read("titan.json")).toBeUndefined();

    // result should be correct
    expect(result.fatalError).toBeDefined();
    expect(result.fatalError?.message).toMatch(
      "Encountered an error while transforming files"
    );
    expect(result.changes).toMatchInlineSnapshot(`
      Object {
        "package.json": Object {
          "action": "error",
          "additions": 0,
          "deletions": 1,
          "error": [Error: could not write file],
        },
        "titan.json": Object {
          "action": "error",
          "additions": 1,
          "deletions": 0,
          "error": [Error: could not write file],
        },
      }
    `);

    mockWriteJsonSync.mockRestore();
  });
});
