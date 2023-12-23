import path from "node:path";
import childProcess from "node:child_process";
import chalk from "chalk";
import { setupTestFixtures, spyConsole, spyExit } from "@titan/test-utils";
import { logger } from "@titan/utils";
import type { PackageManager } from "@titan/utils";
// imports for mocks
import * as titanWorkspaces from "@titan/workspaces";
import * as titanUtils from "@titan/utils";
import type { CreateCommandArgument } from "../src/commands/create/types";
import { create } from "../src/commands/create";
import { getWorkspaceDetailsMockReturnValue } from "./test-utils";

jest.mock("@titan/workspaces", () => ({
  __esModule: true,
  ...jest.requireActual("@titan/workspaces"),
}));

describe("create-titan", () => {
  const { useFixture } = setupTestFixtures({
    directory: path.join(__dirname, "../"),
    options: { emptyFixture: true },
  });

  const mockConsole = spyConsole();
  const mockExit = spyExit();

  test.each<{ packageManager: PackageManager }>([
    { packageManager: "yarn" },
    { packageManager: "npm" },
    { packageManager: "pnpm" },
    { packageManager: "bun" },
  ])(
    "outputs expected console messages when using $packageManager (option)",
    async ({ packageManager }) => {
      const { root } = useFixture({ fixture: `create-titan` });

      const availableScripts = ["build", "test", "dev"];

      const mockAvailablePackageManagers = jest
        .spyOn(titanUtils, "getAvailablePackageManagers")
        .mockResolvedValue({
          npm: "8.19.2",
          yarn: "1.22.10",
          pnpm: "7.22.2",
          bun: "1.0.1",
        });

      const mockCreateProject = jest
        .spyOn(titanUtils, "createProject")
        .mockResolvedValue({
          cdPath: "",
          hasPackageJson: true,
          availableScripts,
        });

      const mockGetWorkspaceDetails = jest
        .spyOn(titanWorkspaces, "getWorkspaceDetails")
        .mockResolvedValue(
          getWorkspaceDetailsMockReturnValue({
            root,
            packageManager,
          })
        );

      const mockExecSync = jest
        .spyOn(childProcess, "execSync")
        .mockImplementation(() => {
          return "success";
        });

      await create(
        root as CreateCommandArgument,
        packageManager as CreateCommandArgument,
        {
          skipInstall: true,
          example: "default",
        }
      );

      const expected = `${chalk.bold(
        logger.titanGradient(">>> Success!")
      )} Created a new Titanrepo at "${path.relative(process.cwd(), root)}".`;

      expect(mockConsole.log).toHaveBeenCalledWith(expected);
      expect(mockConsole.log).toHaveBeenCalledWith(
        "Inside that directory, you can run several commands:"
      );

      availableScripts.forEach((script) => {
        expect(mockConsole.log).toHaveBeenCalledWith(
          chalk.cyan(`  ${packageManager} run ${script}`)
        );
      });

      mockAvailablePackageManagers.mockRestore();
      mockCreateProject.mockRestore();
      mockGetWorkspaceDetails.mockRestore();
      mockExecSync.mockRestore();
    }
  );

  test.each<{ packageManager: PackageManager }>([
    { packageManager: "yarn" },
    { packageManager: "npm" },
    { packageManager: "pnpm" },
    { packageManager: "bun" },
  ])(
    "outputs expected console messages when using $packageManager (arg)",
    async ({ packageManager }) => {
      const { root } = useFixture({ fixture: `create-titan` });

      const availableScripts = ["build", "test", "dev"];

      const mockAvailablePackageManagers = jest
        .spyOn(titanUtils, "getAvailablePackageManagers")
        .mockResolvedValue({
          npm: "8.19.2",
          yarn: "1.22.10",
          pnpm: "7.22.2",
          bun: "1.0.1",
        });

      const mockCreateProject = jest
        .spyOn(titanUtils, "createProject")
        .mockResolvedValue({
          cdPath: "",
          hasPackageJson: true,
          availableScripts,
        });

      const mockGetWorkspaceDetails = jest
        .spyOn(titanWorkspaces, "getWorkspaceDetails")
        .mockResolvedValue(
          getWorkspaceDetailsMockReturnValue({
            root,
            packageManager,
          })
        );

      const mockExecSync = jest
        .spyOn(childProcess, "execSync")
        .mockImplementation(() => {
          return "success";
        });

      await create(root as CreateCommandArgument, undefined, {
        packageManager,
        skipInstall: true,
        example: "default",
      });

      const expected = `${chalk.bold(
        logger.titanGradient(">>> Success!")
      )} Created a new Titanrepo at "${path.relative(process.cwd(), root)}".`;

      expect(mockConsole.log).toHaveBeenCalledWith(expected);
      expect(mockConsole.log).toHaveBeenCalledWith(
        "Inside that directory, you can run several commands:"
      );

      availableScripts.forEach((script) => {
        expect(mockConsole.log).toHaveBeenCalledWith(
          chalk.cyan(`  ${packageManager} run ${script}`)
        );
      });

      mockAvailablePackageManagers.mockRestore();
      mockCreateProject.mockRestore();
      mockGetWorkspaceDetails.mockRestore();
      mockExecSync.mockRestore();
    }
  );

  test("throws correct error message when a download error is encountered", async () => {
    const { root } = useFixture({ fixture: `create-titan` });
    const packageManager = "pnpm";
    const mockAvailablePackageManagers = jest
      .spyOn(titanUtils, "getAvailablePackageManagers")
      .mockResolvedValue({
        npm: "8.19.2",
        yarn: "1.22.10",
        pnpm: "7.22.2",
        bun: "1.0.1",
      });

    const mockCreateProject = jest
      .spyOn(titanUtils, "createProject")
      .mockRejectedValue(new titanUtils.DownloadError("Could not connect"));

    const mockGetWorkspaceDetails = jest
      .spyOn(titanWorkspaces, "getWorkspaceDetails")
      .mockResolvedValue(
        getWorkspaceDetailsMockReturnValue({
          root,
          packageManager,
        })
      );

    const mockExecSync = jest
      .spyOn(childProcess, "execSync")
      .mockImplementation(() => {
        return "success";
      });

    await create(
      root as CreateCommandArgument,
      packageManager as CreateCommandArgument,
      {
        skipInstall: true,
        example: "default",
      }
    );

    expect(mockConsole.error).toHaveBeenCalledTimes(2);
    expect(mockConsole.error).toHaveBeenNthCalledWith(
      1,
      logger.titanRed.bold(">>>"),
      chalk.red("Unable to download template from Github")
    );
    expect(mockConsole.error).toHaveBeenNthCalledWith(
      2,
      logger.titanRed.bold(">>>"),
      chalk.red("Could not connect")
    );
    expect(mockExit.exit).toHaveBeenCalledWith(1);

    mockAvailablePackageManagers.mockRestore();
    mockCreateProject.mockRestore();
    mockGetWorkspaceDetails.mockRestore();
    mockExecSync.mockRestore();
  });
});
