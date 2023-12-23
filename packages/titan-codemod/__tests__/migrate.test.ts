import childProcess from "node:child_process";
import * as titanUtils from "@titan/utils";
import * as titanWorkspaces from "@titan/workspaces";
import { setupTestFixtures, spyExit } from "@titan/test-utils";
import { migrate } from "../src/commands/migrate";
import * as checkGitStatus from "../src/utils/checkGitStatus";
import * as getCurrentVersion from "../src/commands/migrate/steps/getCurrentVersion";
import * as getLatestVersion from "../src/commands/migrate/steps/getLatestVersion";
import * as getTitanUpgradeCommand from "../src/commands/migrate/steps/getTitanUpgradeCommand";
import { getWorkspaceDetailsMockReturnValue } from "./test-utils";

jest.mock("@titan/workspaces", () => ({
  __esModule: true,
  ...jest.requireActual("@titan/workspaces"),
}));

describe("migrate", () => {
  const mockExit = spyExit();
  const { useFixture } = setupTestFixtures({
    directory: __dirname,
    test: "migrate",
  });

  it("migrates from 1.0.0 to 1.7.0", async () => {
    const { root, readJson } = useFixture({
      fixture: "old-titan",
    });

    const packageManager = "pnpm";
    const packageManagerVersion = "1.2.3";

    // setup mocks
    const mockedCheckGitStatus = jest
      .spyOn(checkGitStatus, "checkGitStatus")
      .mockReturnValue(undefined);
    const mockedGetCurrentVersion = jest
      .spyOn(getCurrentVersion, "getCurrentVersion")
      .mockReturnValue("1.0.0");
    const mockedGetLatestVersion = jest
      .spyOn(getLatestVersion, "getLatestVersion")
      .mockResolvedValue("1.7.0");
    const mockedGetTitanUpgradeCommand = jest
      .spyOn(getTitanUpgradeCommand, "getTitanUpgradeCommand")
      .mockResolvedValue("pnpm install -g titan@latest");
    const mockedGetAvailablePackageManagers = jest
      .spyOn(titanUtils, "getAvailablePackageManagers")
      .mockResolvedValue({
        pnpm: packageManagerVersion,
        npm: undefined,
        yarn: undefined,
        bun: undefined,
      });
    const mockedGetWorkspaceDetails = jest
      .spyOn(titanWorkspaces, "getWorkspaceDetails")
      .mockResolvedValue(
        getWorkspaceDetailsMockReturnValue({
          root,
          packageManager,
        })
      );

    await migrate(root, {
      force: false,
      dry: false,
      print: false,
      install: false,
    });

    expect(readJson("package.json")).toStrictEqual({
      dependencies: {},
      devDependencies: {
        titan: "1.0.0",
      },
      name: "no-titan-json",
      packageManager: "pnpm@1.2.3",
      version: "1.0.0",
    });
    expect(readJson("titan.json")).toStrictEqual({
      $schema: "https://titan.build/schema.json",
      pipeline: {
        build: {
          outputs: [".next/**", "!.next/cache/**"],
        },
        dev: {
          cache: false,
        },
        lint: {},
        test: {
          outputs: ["dist/**", "build/**"],
        },
      },
    });

    // verify mocks were called
    expect(mockedCheckGitStatus).toHaveBeenCalled();
    expect(mockedGetCurrentVersion).toHaveBeenCalled();
    expect(mockedGetLatestVersion).toHaveBeenCalled();
    expect(mockedGetTitanUpgradeCommand).toHaveBeenCalled();
    expect(mockedGetAvailablePackageManagers).toHaveBeenCalled();
    expect(mockedGetWorkspaceDetails).toHaveBeenCalled();

    // restore mocks
    mockedCheckGitStatus.mockRestore();
    mockedGetCurrentVersion.mockRestore();
    mockedGetLatestVersion.mockRestore();
    mockedGetTitanUpgradeCommand.mockRestore();
    mockedGetAvailablePackageManagers.mockRestore();
    mockedGetWorkspaceDetails.mockRestore();
  });

  it("migrates from 1.0.0 to 1.2.0 (dry run)", async () => {
    const { root, readJson } = useFixture({
      fixture: "old-titan",
    });

    const packageManager = "pnpm";
    const packageManagerVersion = "1.2.3";

    // setup mocks
    const mockedCheckGitStatus = jest
      .spyOn(checkGitStatus, "checkGitStatus")
      .mockReturnValue(undefined);
    const mockedGetCurrentVersion = jest
      .spyOn(getCurrentVersion, "getCurrentVersion")
      .mockReturnValue("1.0.0");
    const mockedGetLatestVersion = jest
      .spyOn(getLatestVersion, "getLatestVersion")
      .mockResolvedValue("1.2.0");
    const mockedGetTitanUpgradeCommand = jest
      .spyOn(getTitanUpgradeCommand, "getTitanUpgradeCommand")
      .mockResolvedValue("pnpm install -g titan@latest");
    const mockedGetAvailablePackageManagers = jest
      .spyOn(titanUtils, "getAvailablePackageManagers")
      .mockResolvedValue({
        pnpm: packageManagerVersion,
        npm: undefined,
        yarn: undefined,
        bun: undefined,
      });
    const mockedGetWorkspaceDetails = jest
      .spyOn(titanWorkspaces, "getWorkspaceDetails")
      .mockResolvedValue(
        getWorkspaceDetailsMockReturnValue({
          root,
          packageManager,
        })
      );

    const packageJson = readJson("package.json");
    const titanJson = readJson("titan.json");

    await migrate(root, {
      force: false,
      dry: true,
      print: false,
      install: true,
    });

    // make sure nothing changed
    expect(readJson("package.json")).toStrictEqual(packageJson);
    expect(readJson("titan.json")).toStrictEqual(titanJson);

    // verify mocks were called
    expect(mockedCheckGitStatus).not.toHaveBeenCalled();
    expect(mockedGetCurrentVersion).toHaveBeenCalled();
    expect(mockedGetLatestVersion).toHaveBeenCalled();
    expect(mockedGetTitanUpgradeCommand).toHaveBeenCalled();
    expect(mockedGetAvailablePackageManagers).toHaveBeenCalled();
    expect(mockedGetWorkspaceDetails).toHaveBeenCalled();

    // restore mocks
    mockedCheckGitStatus.mockRestore();
    mockedGetCurrentVersion.mockRestore();
    mockedGetLatestVersion.mockRestore();
    mockedGetTitanUpgradeCommand.mockRestore();
    mockedGetAvailablePackageManagers.mockRestore();
    mockedGetWorkspaceDetails.mockRestore();
  });

  it("next version can be passed as an option", async () => {
    const { root, readJson } = useFixture({
      fixture: "old-titan",
    });

    const packageManager = "pnpm";
    const packageManagerVersion = "1.2.3";

    // setup mocks
    const mockedCheckGitStatus = jest
      .spyOn(checkGitStatus, "checkGitStatus")
      .mockReturnValue(undefined);
    const mockedGetCurrentVersion = jest
      .spyOn(getCurrentVersion, "getCurrentVersion")
      .mockReturnValue("1.0.0");
    const mockedGetLatestVersion = jest
      .spyOn(getLatestVersion, "getLatestVersion")
      .mockResolvedValue("1.7.0");
    const mockedGetTitanUpgradeCommand = jest
      .spyOn(getTitanUpgradeCommand, "getTitanUpgradeCommand")
      .mockResolvedValue("pnpm install -g titan@latest");
    const mockedGetAvailablePackageManagers = jest
      .spyOn(titanUtils, "getAvailablePackageManagers")
      .mockResolvedValue({
        pnpm: packageManagerVersion,
        npm: undefined,
        yarn: undefined,
        bun: undefined,
      });
    const mockedGetWorkspaceDetails = jest
      .spyOn(titanWorkspaces, "getWorkspaceDetails")
      .mockResolvedValue(
        getWorkspaceDetailsMockReturnValue({
          root,
          packageManager,
        })
      );

    await migrate(root, {
      force: false,
      dry: false,
      print: false,
      install: false,
      to: "1.7.0",
    });

    expect(readJson("package.json")).toStrictEqual({
      dependencies: {},
      devDependencies: {
        titan: "1.0.0",
      },
      name: "no-titan-json",
      packageManager: "pnpm@1.2.3",
      version: "1.0.0",
    });
    expect(readJson("titan.json")).toStrictEqual({
      $schema: "https://titan.build/schema.json",
      pipeline: {
        build: {
          outputs: [".next/**", "!.next/cache/**"],
        },
        dev: {
          cache: false,
        },
        test: {
          outputs: ["dist/**", "build/**"],
        },
        lint: {},
      },
    });

    // verify mocks were called
    expect(mockedCheckGitStatus).toHaveBeenCalled();
    expect(mockedGetCurrentVersion).toHaveBeenCalled();
    expect(mockedGetLatestVersion).toHaveBeenCalled();
    expect(mockedGetTitanUpgradeCommand).toHaveBeenCalled();
    expect(mockedGetAvailablePackageManagers).toHaveBeenCalled();
    expect(mockedGetWorkspaceDetails).toHaveBeenCalled();

    // restore mocks
    mockedCheckGitStatus.mockRestore();
    mockedGetCurrentVersion.mockRestore();
    mockedGetLatestVersion.mockRestore();
    mockedGetTitanUpgradeCommand.mockRestore();
    mockedGetAvailablePackageManagers.mockRestore();
    mockedGetWorkspaceDetails.mockRestore();
  });

  it("current version can be passed as an option", async () => {
    const { root, readJson } = useFixture({
      fixture: "old-titan",
    });

    const packageManager = "pnpm";
    const packageManagerVersion = "1.2.3";

    // setup mocks
    const mockedCheckGitStatus = jest
      .spyOn(checkGitStatus, "checkGitStatus")
      .mockReturnValue(undefined);
    const mockedGetLatestVersion = jest
      .spyOn(getLatestVersion, "getLatestVersion")
      .mockResolvedValue("1.7.0");
    const mockedGetTitanUpgradeCommand = jest
      .spyOn(getTitanUpgradeCommand, "getTitanUpgradeCommand")
      .mockResolvedValue("pnpm install -g titan@latest");
    const mockedGetAvailablePackageManagers = jest
      .spyOn(titanUtils, "getAvailablePackageManagers")
      .mockResolvedValue({
        pnpm: packageManagerVersion,
        npm: undefined,
        yarn: undefined,
        bun: undefined,
      });
    const mockedGetWorkspaceDetails = jest
      .spyOn(titanWorkspaces, "getWorkspaceDetails")
      .mockResolvedValue(
        getWorkspaceDetailsMockReturnValue({
          root,
          packageManager,
        })
      );

    await migrate(root, {
      force: false,
      dry: false,
      print: false,
      install: false,
      from: "1.0.0",
    });

    expect(readJson("package.json")).toStrictEqual({
      dependencies: {},
      devDependencies: {
        titan: "1.0.0",
      },
      name: "no-titan-json",
      packageManager: "pnpm@1.2.3",
      version: "1.0.0",
    });
    expect(readJson("titan.json")).toStrictEqual({
      $schema: "https://titan.build/schema.json",
      pipeline: {
        build: {
          outputs: [".next/**", "!.next/cache/**"],
        },
        dev: {
          cache: false,
        },
        lint: {},
        test: {
          outputs: ["dist/**", "build/**"],
        },
      },
    });

    // verify mocks were called
    expect(mockedCheckGitStatus).toHaveBeenCalled();
    expect(mockedGetLatestVersion).toHaveBeenCalled();
    expect(mockedGetTitanUpgradeCommand).toHaveBeenCalled();
    expect(mockedGetAvailablePackageManagers).toHaveBeenCalled();
    expect(mockedGetWorkspaceDetails).toHaveBeenCalled();

    // restore mocks
    mockedCheckGitStatus.mockRestore();
    mockedGetLatestVersion.mockRestore();
    mockedGetTitanUpgradeCommand.mockRestore();
    mockedGetAvailablePackageManagers.mockRestore();
    mockedGetWorkspaceDetails.mockRestore();
  });

  it("exits if the current version is the same as the new version", async () => {
    const { root } = useFixture({
      fixture: "old-titan",
    });

    const packageManager = "pnpm";

    // setup mocks
    const mockedCheckGitStatus = jest
      .spyOn(checkGitStatus, "checkGitStatus")
      .mockReturnValue(undefined);
    const mockedGetCurrentVersion = jest
      .spyOn(getCurrentVersion, "getCurrentVersion")
      .mockReturnValue("1.7.0");
    const mockedGetLatestVersion = jest
      .spyOn(getLatestVersion, "getLatestVersion")
      .mockResolvedValue("1.7.0");
    const mockedGetWorkspaceDetails = jest
      .spyOn(titanWorkspaces, "getWorkspaceDetails")
      .mockResolvedValue(
        getWorkspaceDetailsMockReturnValue({
          root,
          packageManager,
        })
      );

    await migrate(root, {
      force: false,
      dry: false,
      print: false,
      install: false,
    });

    expect(mockExit.exit).toHaveBeenCalledWith(0);

    // verify mocks were called
    expect(mockedCheckGitStatus).toHaveBeenCalled();
    expect(mockedGetCurrentVersion).toHaveBeenCalled();
    expect(mockedGetLatestVersion).toHaveBeenCalled();
    expect(mockedGetWorkspaceDetails).toHaveBeenCalled();

    // restore mocks
    mockedCheckGitStatus.mockRestore();
    mockedGetCurrentVersion.mockRestore();
    mockedGetWorkspaceDetails.mockRestore();
  });

  it("continues when migration doesn't require codemods", async () => {
    const { root } = useFixture({
      fixture: "old-titan",
    });

    const packageManager = "npm";

    // setup mocks
    const mockedCheckGitStatus = jest
      .spyOn(checkGitStatus, "checkGitStatus")
      .mockReturnValue(undefined);
    const mockedGetCurrentVersion = jest
      .spyOn(getCurrentVersion, "getCurrentVersion")
      .mockReturnValue("1.3.0");
    const mockedGetLatestVersion = jest
      .spyOn(getLatestVersion, "getLatestVersion")
      .mockResolvedValue("1.3.1");
    const mockedGetTitanUpgradeCommand = jest
      .spyOn(getTitanUpgradeCommand, "getTitanUpgradeCommand")
      .mockResolvedValue("npm install titan@1.3.1");
    const mockedExecSync = jest
      .spyOn(childProcess, "execSync")
      .mockReturnValue("installed");
    const mockedGetWorkspaceDetails = jest
      .spyOn(titanWorkspaces, "getWorkspaceDetails")
      .mockResolvedValue(
        getWorkspaceDetailsMockReturnValue({
          root,
          packageManager,
        })
      );

    await migrate(root, {
      force: false,
      dry: false,
      print: false,
      install: true,
    });

    // verify mocks were called
    expect(mockedCheckGitStatus).toHaveBeenCalled();
    expect(mockedGetCurrentVersion).toHaveBeenCalled();
    expect(mockedGetLatestVersion).toHaveBeenCalled();
    expect(mockedGetTitanUpgradeCommand).toHaveBeenCalled();
    expect(mockedGetWorkspaceDetails).toHaveBeenCalled();
    expect(mockedExecSync).toHaveBeenNthCalledWith(1, "titan bin", {
      cwd: root,
      stdio: "ignore",
    });
    expect(mockedExecSync).toHaveBeenNthCalledWith(2, "titan daemon stop", {
      cwd: root,
      stdio: "ignore",
    });
    expect(mockedExecSync).toHaveBeenNthCalledWith(
      3,
      "npm install titan@1.3.1",
      {
        cwd: root,
        stdio: "pipe",
      }
    );

    // restore mocks
    mockedCheckGitStatus.mockRestore();
    mockedGetCurrentVersion.mockRestore();
    mockedGetLatestVersion.mockRestore();
    mockedGetTitanUpgradeCommand.mockRestore();
    mockedGetWorkspaceDetails.mockRestore();
    mockedExecSync.mockRestore();
  });

  it("installs the correct titan version", async () => {
    const { root, readJson } = useFixture({
      fixture: "old-titan",
    });

    const packageManager = "pnpm";
    const packageManagerVersion = "1.2.3";

    // setup mocks
    const mockedCheckGitStatus = jest
      .spyOn(checkGitStatus, "checkGitStatus")
      .mockReturnValue(undefined);
    const mockedGetCurrentVersion = jest
      .spyOn(getCurrentVersion, "getCurrentVersion")
      .mockReturnValue("1.0.0");
    const mockedGetLatestVersion = jest
      .spyOn(getLatestVersion, "getLatestVersion")
      .mockResolvedValue("1.7.0");
    const mockedGetTitanUpgradeCommand = jest
      .spyOn(getTitanUpgradeCommand, "getTitanUpgradeCommand")
      .mockResolvedValue("pnpm install -g titan@1.7.0");
    const mockedGetAvailablePackageManagers = jest
      .spyOn(titanUtils, "getAvailablePackageManagers")
      .mockResolvedValue({
        pnpm: packageManagerVersion,
        npm: undefined,
        yarn: undefined,
        bun: undefined,
      });
    const mockedGetWorkspaceDetails = jest
      .spyOn(titanWorkspaces, "getWorkspaceDetails")
      .mockResolvedValue(
        getWorkspaceDetailsMockReturnValue({
          root,
          packageManager,
        })
      );
    const mockedExecSync = jest
      .spyOn(childProcess, "execSync")
      .mockReturnValue("installed");

    await migrate(root, {
      force: false,
      dry: false,
      print: false,
      install: true,
    });

    expect(readJson("package.json")).toStrictEqual({
      dependencies: {},
      devDependencies: {
        titan: "1.0.0",
      },
      name: "no-titan-json",
      packageManager: "pnpm@1.2.3",
      version: "1.0.0",
    });
    expect(readJson("titan.json")).toStrictEqual({
      $schema: "https://titan.build/schema.json",
      pipeline: {
        build: {
          outputs: [".next/**", "!.next/cache/**"],
        },
        dev: {
          cache: false,
        },
        lint: {},
        test: {
          outputs: ["dist/**", "build/**"],
        },
      },
    });

    // verify mocks were called
    expect(mockedCheckGitStatus).toHaveBeenCalled();
    expect(mockedGetCurrentVersion).toHaveBeenCalled();
    expect(mockedGetLatestVersion).toHaveBeenCalled();
    expect(mockedGetTitanUpgradeCommand).toHaveBeenCalled();
    expect(mockedGetAvailablePackageManagers).toHaveBeenCalled();
    expect(mockedGetWorkspaceDetails).toHaveBeenCalled();
    expect(mockedExecSync).toHaveBeenCalled();
    expect(mockedExecSync).toHaveBeenNthCalledWith(1, "titan bin", {
      cwd: root,
      stdio: "ignore",
    });
    expect(mockedExecSync).toHaveBeenNthCalledWith(2, "titan daemon stop", {
      cwd: root,
      stdio: "ignore",
    });
    expect(mockedExecSync).toHaveBeenNthCalledWith(
      3,
      "pnpm install -g titan@1.7.0",
      {
        cwd: root,
        stdio: "pipe",
      }
    );

    // restore mocks
    mockedCheckGitStatus.mockRestore();
    mockedGetCurrentVersion.mockRestore();
    mockedGetLatestVersion.mockRestore();
    mockedGetTitanUpgradeCommand.mockRestore();
    mockedGetAvailablePackageManagers.mockRestore();
    mockedGetWorkspaceDetails.mockRestore();
    mockedExecSync.mockRestore();
  });

  it("fails gracefully when the correct upgrade command cannot be found", async () => {
    const { root, readJson } = useFixture({
      fixture: "old-titan",
    });

    const packageManager = "pnpm";
    const packageManagerVersion = "1.2.3";

    // setup mocks
    const mockedCheckGitStatus = jest
      .spyOn(checkGitStatus, "checkGitStatus")
      .mockReturnValue(undefined);
    const mockedGetCurrentVersion = jest
      .spyOn(getCurrentVersion, "getCurrentVersion")
      .mockReturnValue("1.0.0");
    const mockedGetLatestVersion = jest
      .spyOn(getLatestVersion, "getLatestVersion")
      .mockResolvedValue("1.7.0");
    const mockedGetTitanUpgradeCommand = jest
      .spyOn(getTitanUpgradeCommand, "getTitanUpgradeCommand")
      .mockResolvedValue(undefined);
    const mockedGetAvailablePackageManagers = jest
      .spyOn(titanUtils, "getAvailablePackageManagers")
      .mockResolvedValue({
        pnpm: packageManagerVersion,
        npm: undefined,
        yarn: undefined,
        bun: undefined,
      });
    const mockedGetWorkspaceDetails = jest
      .spyOn(titanWorkspaces, "getWorkspaceDetails")
      .mockResolvedValue(
        getWorkspaceDetailsMockReturnValue({
          root,
          packageManager,
        })
      );
    const mockedExecSync = jest
      .spyOn(childProcess, "execSync")
      .mockReturnValue("installed");

    await migrate(root, {
      force: false,
      dry: false,
      print: false,
      install: true,
    });

    expect(readJson("package.json")).toStrictEqual({
      dependencies: {},
      devDependencies: {
        titan: "1.0.0",
      },
      name: "no-titan-json",
      packageManager: "pnpm@1.2.3",
      version: "1.0.0",
    });
    expect(readJson("titan.json")).toStrictEqual({
      $schema: "https://titan.build/schema.json",
      pipeline: {
        build: {
          outputs: [".next/**", "!.next/cache/**"],
        },
        dev: {
          cache: false,
        },
        lint: {},
        test: {
          outputs: ["dist/**", "build/**"],
        },
      },
    });

    expect(mockExit.exit).toHaveBeenCalledWith(1);

    // verify mocks were called
    expect(mockedCheckGitStatus).toHaveBeenCalled();
    expect(mockedGetCurrentVersion).toHaveBeenCalled();
    expect(mockedGetLatestVersion).toHaveBeenCalled();
    expect(mockedGetTitanUpgradeCommand).toHaveBeenCalled();
    expect(mockedGetAvailablePackageManagers).toHaveBeenCalled();
    expect(mockedGetWorkspaceDetails).toHaveBeenCalled();
    expect(mockedExecSync).toHaveBeenCalledTimes(2);
    expect(mockedExecSync).toHaveBeenNthCalledWith(1, "titan bin", {
      cwd: root,
      stdio: "ignore",
    });
    expect(mockedExecSync).toHaveBeenNthCalledWith(2, "titan daemon stop", {
      cwd: root,
      stdio: "ignore",
    });

    // restore mocks
    mockedCheckGitStatus.mockRestore();
    mockedGetCurrentVersion.mockRestore();
    mockedGetLatestVersion.mockRestore();
    mockedGetTitanUpgradeCommand.mockRestore();
    mockedGetAvailablePackageManagers.mockRestore();
    mockedGetWorkspaceDetails.mockRestore();
    mockedExecSync.mockRestore();
  });

  it("exits if current version is not passed and cannot be inferred", async () => {
    const { root } = useFixture({
      fixture: "old-titan",
    });

    const packageManager = "pnpm";

    // setup mocks
    const mockedCheckGitStatus = jest
      .spyOn(checkGitStatus, "checkGitStatus")
      .mockReturnValue(undefined);
    const mockedGetCurrentVersion = jest
      .spyOn(getCurrentVersion, "getCurrentVersion")
      .mockReturnValue(undefined);
    const mockedGetWorkspaceDetails = jest
      .spyOn(titanWorkspaces, "getWorkspaceDetails")
      .mockResolvedValue(
        getWorkspaceDetailsMockReturnValue({
          root,
          packageManager,
        })
      );

    await migrate(root, {
      force: false,
      dry: false,
      print: false,
      install: false,
    });

    expect(mockExit.exit).toHaveBeenCalledWith(1);

    // verify mocks were called
    expect(mockedCheckGitStatus).toHaveBeenCalled();
    expect(mockedGetCurrentVersion).toHaveBeenCalled();
    expect(mockedGetWorkspaceDetails).toHaveBeenCalled();

    // restore mocks
    mockedCheckGitStatus.mockRestore();
    mockedGetCurrentVersion.mockRestore();
    mockedGetWorkspaceDetails.mockRestore();
  });

  it("exits if latest version is not passed and cannot be inferred", async () => {
    const { root } = useFixture({
      fixture: "old-titan",
    });

    const packageManager = "npm";

    // setup mocks
    const mockedCheckGitStatus = jest
      .spyOn(checkGitStatus, "checkGitStatus")
      .mockReturnValue(undefined);
    const mockedGetCurrentVersion = jest
      .spyOn(getCurrentVersion, "getCurrentVersion")
      .mockReturnValue("1.5.0");
    const mockedGetLatestVersion = jest
      .spyOn(getLatestVersion, "getLatestVersion")
      .mockResolvedValue(undefined);
    const mockedGetWorkspaceDetails = jest
      .spyOn(titanWorkspaces, "getWorkspaceDetails")
      .mockResolvedValue(
        getWorkspaceDetailsMockReturnValue({
          root,
          packageManager,
        })
      );

    await migrate(root, {
      force: false,
      dry: false,
      print: false,
      install: false,
    });

    expect(mockExit.exit).toHaveBeenCalledWith(1);

    // verify mocks were called
    expect(mockedCheckGitStatus).toHaveBeenCalled();
    expect(mockedGetCurrentVersion).toHaveBeenCalled();
    expect(mockedGetLatestVersion).toHaveBeenCalled();
    expect(mockedGetWorkspaceDetails).toHaveBeenCalled();

    // restore mocks
    mockedCheckGitStatus.mockRestore();
    mockedGetCurrentVersion.mockRestore();
    mockedGetLatestVersion.mockRestore();
    mockedGetWorkspaceDetails.mockRestore();
  });

  it("exits if latest version throws", async () => {
    const { root } = useFixture({
      fixture: "old-titan",
    });

    const packageManager = "yarn";
    // setup mocks
    const mockedCheckGitStatus = jest
      .spyOn(checkGitStatus, "checkGitStatus")
      .mockReturnValue(undefined);
    const mockedGetCurrentVersion = jest
      .spyOn(getCurrentVersion, "getCurrentVersion")
      .mockReturnValue("1.5.0");
    const mockedGetLatestVersion = jest
      .spyOn(getLatestVersion, "getLatestVersion")
      .mockRejectedValue(new Error("failed to fetch version"));
    const mockedGetWorkspaceDetails = jest
      .spyOn(titanWorkspaces, "getWorkspaceDetails")
      .mockResolvedValue(
        getWorkspaceDetailsMockReturnValue({
          root,
          packageManager,
        })
      );

    await migrate(root, {
      force: false,
      dry: false,
      print: false,
      install: false,
    });

    expect(mockExit.exit).toHaveBeenCalledWith(1);

    // verify mocks were called
    expect(mockedCheckGitStatus).toHaveBeenCalled();
    expect(mockedGetCurrentVersion).toHaveBeenCalled();
    expect(mockedGetLatestVersion).toHaveBeenCalled();
    expect(mockedGetWorkspaceDetails).toHaveBeenCalled();

    // restore mocks
    mockedCheckGitStatus.mockRestore();
    mockedGetCurrentVersion.mockRestore();
    mockedGetLatestVersion.mockRestore();
    mockedGetWorkspaceDetails.mockRestore();
  });

  it("exits if any transforms encounter an error", async () => {
    const { root } = useFixture({
      fixture: "old-titan",
    });

    const packageManager = "pnpm";
    const packageManagerVersion = "1.2.3";

    // setup mocks
    const mockedCheckGitStatus = jest
      .spyOn(checkGitStatus, "checkGitStatus")
      .mockReturnValue(undefined);
    const mockedGetCurrentVersion = jest
      .spyOn(getCurrentVersion, "getCurrentVersion")
      .mockReturnValue("1.0.0");
    const mockedGetLatestVersion = jest
      .spyOn(getLatestVersion, "getLatestVersion")
      .mockResolvedValue("1.7.0");
    const mockedGetAvailablePackageManagers = jest
      .spyOn(titanUtils, "getAvailablePackageManagers")
      .mockResolvedValue({
        pnpm: packageManagerVersion,
        npm: undefined,
        yarn: undefined,
        bun: undefined,
      });
    const mockedGetWorkspaceDetails = jest
      .spyOn(titanWorkspaces, "getWorkspaceDetails")
      .mockResolvedValue(
        getWorkspaceDetailsMockReturnValue({
          root,
          packageManager,
        })
      );

    await migrate(root, {
      force: false,
      dry: true,
      print: false,
      install: true,
    });

    expect(mockExit.exit).toHaveBeenCalledWith(1);

    // verify mocks were called
    expect(mockedCheckGitStatus).not.toHaveBeenCalled();
    expect(mockedGetCurrentVersion).toHaveBeenCalled();
    expect(mockedGetLatestVersion).toHaveBeenCalled();
    expect(mockedGetAvailablePackageManagers).toHaveBeenCalled();
    expect(mockedGetWorkspaceDetails).toHaveBeenCalled();

    // restore mocks
    mockedCheckGitStatus.mockRestore();
    mockedGetCurrentVersion.mockRestore();
    mockedGetLatestVersion.mockRestore();
    mockedGetAvailablePackageManagers.mockRestore();
    mockedGetWorkspaceDetails.mockRestore();
  });

  it("exits if invalid directory is passed", async () => {
    useFixture({
      fixture: "old-titan",
    });

    // setup mocks
    const mockedCheckGitStatus = jest
      .spyOn(checkGitStatus, "checkGitStatus")
      .mockReturnValue(undefined);

    await migrate("~/path/that/does/not/exist", {
      force: false,
      dry: false,
      print: false,
      install: false,
    });

    expect(mockExit.exit).toHaveBeenCalledWith(1);

    // verify mocks were called
    expect(mockedCheckGitStatus).toHaveBeenCalled();

    // restore mocks
    mockedCheckGitStatus.mockRestore();
  });

  it("exits if directory with no repo is passed", async () => {
    const { root } = useFixture({
      fixture: "no-repo",
    });

    // setup mocks
    const mockedCheckGitStatus = jest
      .spyOn(checkGitStatus, "checkGitStatus")
      .mockReturnValue(undefined);

    await migrate(root, {
      force: false,
      dry: false,
      print: false,
      install: false,
    });

    expect(mockExit.exit).toHaveBeenCalledWith(1);

    // verify mocks were called
    expect(mockedCheckGitStatus).toHaveBeenCalled();

    // restore mocks
    mockedCheckGitStatus.mockRestore();
  });
});
