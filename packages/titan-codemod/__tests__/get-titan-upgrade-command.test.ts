import * as titanWorkspaces from "@titan/workspaces";
import * as titanUtils from "@titan/utils";
import { setupTestFixtures } from "@titan/test-utils";
import { getTitanUpgradeCommand } from "../src/commands/migrate/steps/getTitanUpgradeCommand";
import * as utils from "../src/commands/migrate/utils";
import { getWorkspaceDetailsMockReturnValue } from "./test-utils";

jest.mock("@titan/workspaces", () => ({
  __esModule: true,
  ...jest.requireActual("@titan/workspaces"),
}));

interface TestCase {
  version: string;
  packageManager: titanUtils.PackageManager;
  packageManagerVersion: string;
  fixture: string;
  expected: string;
}

const LOCAL_INSTALL_COMMANDS: Array<TestCase> = [
  // npm - workspaces
  {
    version: "latest",
    packageManager: "npm",
    packageManagerVersion: "7.0.0",
    fixture: "normal-workspaces-dev-install",
    expected: "npm install titan@latest --save-dev",
  },
  {
    version: "1.6.3",
    packageManager: "npm",
    packageManagerVersion: "7.0.0",
    fixture: "normal-workspaces-dev-install",
    expected: "npm install titan@1.6.3 --save-dev",
  },
  {
    version: "canary",
    packageManager: "npm",
    packageManagerVersion: "7.0.0",
    fixture: "normal-workspaces-dev-install",
    expected: "npm install titan@canary --save-dev",
  },
  {
    version: "latest",
    packageManager: "npm",
    packageManagerVersion: "7.0.0",
    fixture: "normal-workspaces",
    expected: "npm install titan@latest",
  },
  // npm - single package
  {
    version: "latest",
    packageManager: "npm",
    packageManagerVersion: "7.0.0",
    fixture: "single-package-dev-install",
    expected: "npm install titan@latest --save-dev",
  },
  {
    version: "latest",
    packageManager: "npm",
    packageManagerVersion: "7.0.0",
    fixture: "single-package",
    expected: "npm install titan@latest",
  },
  // pnpm - workspaces
  {
    version: "latest",
    packageManager: "pnpm",
    packageManagerVersion: "7.0.0",
    fixture: "pnpm-workspaces-dev-install",
    expected: "pnpm add titan@latest --save-dev -w",
  },
  {
    version: "1.6.3",
    packageManager: "pnpm",
    packageManagerVersion: "7.0.0",
    fixture: "pnpm-workspaces-dev-install",
    expected: "pnpm add titan@1.6.3 --save-dev -w",
  },
  {
    version: "canary",
    packageManager: "pnpm",
    packageManagerVersion: "7.0.0",
    fixture: "pnpm-workspaces-dev-install",
    expected: "pnpm add titan@canary --save-dev -w",
  },
  {
    version: "latest",
    packageManager: "pnpm",
    packageManagerVersion: "7.0.0",
    fixture: "pnpm-workspaces",
    expected: "pnpm add titan@latest -w",
  },
  // pnpm - single package
  {
    version: "latest",
    packageManager: "pnpm",
    packageManagerVersion: "7.0.0",
    fixture: "single-package-dev-install",
    expected: "pnpm add titan@latest --save-dev",
  },
  {
    version: "latest",
    packageManager: "pnpm",
    packageManagerVersion: "7.0.0",
    fixture: "single-package",
    expected: "pnpm add titan@latest",
  },
  // yarn 1.x - workspaces
  {
    version: "latest",
    packageManager: "yarn",
    packageManagerVersion: "1.22.19",
    fixture: "normal-workspaces-dev-install",
    expected: "yarn add titan@latest --dev -W",
  },
  {
    version: "latest",
    packageManager: "yarn",
    packageManagerVersion: "1.22.19",
    fixture: "normal-workspaces",
    expected: "yarn add titan@latest -W",
  },
  {
    version: "1.6.3",
    packageManager: "yarn",
    packageManagerVersion: "1.22.19",
    fixture: "normal-workspaces-dev-install",
    expected: "yarn add titan@1.6.3 --dev -W",
  },
  {
    version: "canary",
    packageManager: "yarn",
    packageManagerVersion: "1.22.19",
    fixture: "normal-workspaces-dev-install",
    expected: "yarn add titan@canary --dev -W",
  },
  // yarn 1.x - single package
  {
    version: "latest",
    packageManager: "yarn",
    packageManagerVersion: "1.22.19",
    fixture: "single-package-dev-install",
    expected: "yarn add titan@latest --dev",
  },
  {
    version: "latest",
    packageManager: "yarn",
    packageManagerVersion: "1.22.19",
    fixture: "single-package",
    expected: "yarn add titan@latest",
  },
  // yarn 2.x - workspaces
  {
    version: "latest",
    packageManager: "yarn",
    packageManagerVersion: "2.3.4",
    fixture: "normal-workspaces-dev-install",
    expected: "yarn add titan@latest --dev",
  },
  {
    version: "latest",
    packageManager: "yarn",
    packageManagerVersion: "2.3.4",
    fixture: "normal-workspaces",
    expected: "yarn add titan@latest",
  },
  {
    version: "1.6.3",
    packageManager: "yarn",
    packageManagerVersion: "2.3.4",
    fixture: "normal-workspaces-dev-install",
    expected: "yarn add titan@1.6.3 --dev",
  },
  {
    version: "canary",
    packageManager: "yarn",
    packageManagerVersion: "2.3.4",
    fixture: "normal-workspaces-dev-install",
    expected: "yarn add titan@canary --dev",
  },
  // yarn 2.x - single package
  {
    version: "latest",
    packageManager: "yarn",
    packageManagerVersion: "2.3.4",
    fixture: "single-package-dev-install",
    expected: "yarn add titan@latest --dev",
  },
  {
    version: "latest",
    packageManager: "yarn",
    packageManagerVersion: "2.3.4",
    fixture: "single-package",
    expected: "yarn add titan@latest",
  },
  // yarn 3.x - workspaces
  {
    version: "latest",
    packageManager: "yarn",
    packageManagerVersion: "3.3.4",
    fixture: "normal-workspaces-dev-install",
    expected: "yarn add titan@latest --dev",
  },
  {
    version: "latest",
    packageManager: "yarn",
    packageManagerVersion: "3.3.4",
    fixture: "normal-workspaces",
    expected: "yarn add titan@latest",
  },
  {
    version: "1.6.3",
    packageManager: "yarn",
    packageManagerVersion: "3.3.4",
    fixture: "normal-workspaces-dev-install",
    expected: "yarn add titan@1.6.3 --dev",
  },
  {
    version: "canary",
    packageManager: "yarn",
    packageManagerVersion: "3.3.4",
    fixture: "normal-workspaces-dev-install",
    expected: "yarn add titan@canary --dev",
  },
  // yarn 3.x - single package
  {
    version: "latest",
    packageManager: "yarn",
    packageManagerVersion: "3.3.4",
    fixture: "single-package-dev-install",
    expected: "yarn add titan@latest --dev",
  },
  {
    version: "latest",
    packageManager: "yarn",
    packageManagerVersion: "3.3.4",
    fixture: "single-package",
    expected: "yarn add titan@latest",
  },
];

const GLOBAL_INSTALL_COMMANDS: Array<TestCase> = [
  // npm
  {
    version: "latest",
    packageManager: "npm",
    packageManagerVersion: "7.0.0",
    fixture: "normal-workspaces-dev-install",
    expected: "npm install titan@latest --global",
  },
  {
    version: "1.6.3",
    packageManager: "npm",
    packageManagerVersion: "7.0.0",
    fixture: "normal-workspaces-dev-install",
    expected: "npm install titan@1.6.3 --global",
  },
  {
    version: "latest",
    packageManager: "npm",
    packageManagerVersion: "7.0.0",
    fixture: "normal-workspaces",
    expected: "npm install titan@latest --global",
  },
  {
    version: "latest",
    packageManager: "npm",
    packageManagerVersion: "7.0.0",
    fixture: "single-package",
    expected: "npm install titan@latest --global",
  },
  {
    version: "latest",
    packageManager: "npm",
    packageManagerVersion: "7.0.0",
    fixture: "single-package-dev-install",
    expected: "npm install titan@latest --global",
  },
  // pnpm
  {
    version: "latest",
    packageManager: "pnpm",
    packageManagerVersion: "7.0.0",
    fixture: "pnpm-workspaces-dev-install",
    expected: "pnpm add titan@latest --global",
  },
  {
    version: "1.6.3",
    packageManager: "pnpm",
    packageManagerVersion: "7.0.0",
    fixture: "pnpm-workspaces-dev-install",
    expected: "pnpm add titan@1.6.3 --global",
  },
  {
    version: "latest",
    packageManager: "pnpm",
    packageManagerVersion: "7.0.0",
    fixture: "pnpm-workspaces",
    expected: "pnpm add titan@latest --global",
  },
  {
    version: "latest",
    packageManager: "pnpm",
    packageManagerVersion: "7.0.0",
    fixture: "single-package",
    expected: "pnpm add titan@latest --global",
  },
  {
    version: "latest",
    packageManager: "pnpm",
    packageManagerVersion: "7.0.0",
    fixture: "single-package-dev-install",
    expected: "pnpm add titan@latest --global",
  },
  // yarn 1.x
  {
    version: "latest",
    packageManager: "yarn",
    packageManagerVersion: "1.22.19",
    fixture: "normal-workspaces-dev-install",
    expected: "yarn global add titan@latest",
  },
  {
    version: "latest",
    packageManager: "yarn",
    packageManagerVersion: "1.22.19",
    fixture: "normal-workspaces",
    expected: "yarn global add titan@latest",
  },
  {
    version: "1.6.3",
    packageManager: "yarn",
    packageManagerVersion: "1.22.19",
    fixture: "normal-workspaces-dev-install",
    expected: "yarn global add titan@1.6.3",
  },
  {
    version: "latest",
    packageManager: "yarn",
    packageManagerVersion: "1.22.19",
    fixture: "single-package",
    expected: "yarn global add titan@latest",
  },
  {
    version: "latest",
    packageManager: "yarn",
    packageManagerVersion: "1.22.19",
    fixture: "single-package-dev-install",
    expected: "yarn global add titan@latest",
  },
  // yarn 2.x
  {
    version: "latest",
    packageManager: "yarn",
    packageManagerVersion: "2.3.4",
    fixture: "normal-workspaces-dev-install",
    expected: "yarn global add titan@latest",
  },
  {
    version: "latest",
    packageManager: "yarn",
    packageManagerVersion: "2.3.4",
    fixture: "normal-workspaces",
    expected: "yarn global add titan@latest",
  },
  {
    version: "1.6.3",
    packageManager: "yarn",
    packageManagerVersion: "2.3.4",
    fixture: "normal-workspaces-dev-install",
    expected: "yarn global add titan@1.6.3",
  },
  {
    version: "latest",
    packageManager: "yarn",
    packageManagerVersion: "2.3.4",
    fixture: "single-package",
    expected: "yarn global add titan@latest",
  },
  {
    version: "latest",
    packageManager: "yarn",
    packageManagerVersion: "2.3.4",
    fixture: "single-package-dev-install",
    expected: "yarn global add titan@latest",
  },
  // yarn 3.x
  {
    version: "latest",
    packageManager: "yarn",
    packageManagerVersion: "3.3.3",
    fixture: "normal-workspaces-dev-install",
    expected: "yarn global add titan@latest",
  },
  {
    version: "latest",
    packageManager: "yarn",
    packageManagerVersion: "3.3.3",
    fixture: "normal-workspaces",
    expected: "yarn global add titan@latest",
  },
  {
    version: "1.6.3",
    packageManager: "yarn",
    packageManagerVersion: "3.3.3",
    fixture: "normal-workspaces-dev-install",
    expected: "yarn global add titan@1.6.3",
  },
  {
    version: "latest",
    packageManager: "yarn",
    packageManagerVersion: "3.3.4",
    fixture: "single-package",
    expected: "yarn global add titan@latest",
  },
  {
    version: "latest",
    packageManager: "yarn",
    packageManagerVersion: "3.3.4",
    fixture: "single-package-dev-install",
    expected: "yarn global add titan@latest",
  },
];

describe("get-titan-upgrade-command", () => {
  const { useFixture } = setupTestFixtures({
    directory: __dirname,
    test: "get-titan-upgrade-command",
  });

  test.each(LOCAL_INSTALL_COMMANDS)(
    "returns correct upgrade command for local install of titan@$version using $packageManager@$packageManagerVersion (fixture: $fixture)",
    async ({
      version,
      packageManager,
      packageManagerVersion,
      fixture,
      expected,
    }) => {
      const { root } = useFixture({
        fixture,
      });

      const mockedExec = jest
        .spyOn(utils, "exec")
        .mockImplementation((command: string) => {
          // fail the check for global titan
          if (command.includes("bin")) {
            return undefined;
          }
        });
      const mockGetPackageManagersBinPaths = jest
        .spyOn(titanUtils, "getPackageManagersBinPaths")
        .mockResolvedValue({
          pnpm: undefined,
          npm: undefined,
          yarn: undefined,
          bun: undefined,
        });
      const mockGetAvailablePackageManagers = jest
        .spyOn(titanUtils, "getAvailablePackageManagers")
        .mockResolvedValue({
          pnpm: packageManager === "pnpm" ? packageManagerVersion : undefined,
          npm: packageManager === "npm" ? packageManagerVersion : undefined,
          yarn: packageManager === "yarn" ? packageManagerVersion : undefined,
          bun: packageManager === "bun" ? packageManagerVersion : undefined,
        });

      const project = getWorkspaceDetailsMockReturnValue({
        root,
        packageManager,
        singlePackage: fixture.includes("single-package"),
      });
      const mockGetWorkspaceDetails = jest
        .spyOn(titanWorkspaces, "getWorkspaceDetails")
        .mockResolvedValue(project);

      // get the command
      const upgradeCommand = await getTitanUpgradeCommand({
        project,
        to: version === "latest" ? undefined : version,
      });

      expect(upgradeCommand).toEqual(expected);

      mockedExec.mockRestore();
      mockGetPackageManagersBinPaths.mockRestore();
      mockGetAvailablePackageManagers.mockRestore();
      mockGetWorkspaceDetails.mockRestore();
    }
  );

  test.each(GLOBAL_INSTALL_COMMANDS)(
    "returns correct upgrade command for global install of titan@$version using $packageManager@$packageManagerVersion (fixture: $fixture)",
    async ({
      version,
      packageManager,
      packageManagerVersion,
      fixture,
      expected,
    }) => {
      const { root } = useFixture({
        fixture,
      });

      const mockedExec = jest
        .spyOn(utils, "exec")
        .mockImplementation((command: string) => {
          if (command === "titan bin") {
            return `/global/${packageManager}/bin/titan`;
          }
          return undefined;
        });
      const mockGetPackageManagersBinPaths = jest
        .spyOn(titanUtils, "getPackageManagersBinPaths")
        .mockResolvedValue({
          pnpm: `/global/pnpm/bin`,
          npm: `/global/npm/bin`,
          yarn: `/global/yarn/bin`,
          bun: `/global/bun/bin`,
        });

      const mockGetAvailablePackageManagers = jest
        .spyOn(titanUtils, "getAvailablePackageManagers")
        .mockResolvedValue({
          pnpm: packageManager === "pnpm" ? packageManagerVersion : undefined,
          npm: packageManager === "npm" ? packageManagerVersion : undefined,
          yarn: packageManager === "yarn" ? packageManagerVersion : undefined,
          bun: packageManager === "bun" ? packageManagerVersion : undefined,
        });

      const project = getWorkspaceDetailsMockReturnValue({
        root,
        packageManager,
      });
      const mockGetWorkspaceDetails = jest
        .spyOn(titanWorkspaces, "getWorkspaceDetails")
        .mockResolvedValue(project);

      // get the command
      const upgradeCommand = await getTitanUpgradeCommand({
        project,
        to: version === "latest" ? undefined : version,
      });

      expect(upgradeCommand).toEqual(expected);

      mockedExec.mockRestore();
      mockGetPackageManagersBinPaths.mockRestore();
      mockGetAvailablePackageManagers.mockRestore();
      mockGetWorkspaceDetails.mockRestore();
    }
  );

  describe("errors", () => {
    test("fails gracefully if no package.json exists", async () => {
      const { root } = useFixture({
        fixture: "no-package",
      });

      const mockedExec = jest
        .spyOn(utils, "exec")
        .mockImplementation((command: string) => {
          // fail the check for the titan to force local
          if (command.includes("bin")) {
            return undefined;
          }
        });

      const mockGetAvailablePackageManagers = jest
        .spyOn(titanUtils, "getAvailablePackageManagers")
        .mockResolvedValue({
          pnpm: "8.0.0",
          npm: undefined,
          yarn: undefined,
          bun: undefined,
        });

      const project = getWorkspaceDetailsMockReturnValue({
        root,
        packageManager: "pnpm",
      });
      const mockGetWorkspaceDetails = jest
        .spyOn(titanWorkspaces, "getWorkspaceDetails")
        .mockResolvedValue(project);

      // get the command
      const upgradeCommand = await getTitanUpgradeCommand({
        project,
      });

      expect(upgradeCommand).toEqual(undefined);

      mockedExec.mockRestore();
      mockGetAvailablePackageManagers.mockRestore();
      mockGetWorkspaceDetails.mockRestore();
    });

    test.each([
      {
        fixture: "no-package",
        name: "fails gracefully if no package.json exists",
      },
      {
        fixture: "no-titan",
        name: "fails gracefully if titan cannot be found in package.json",
      },
      {
        fixture: "no-deps",
        name: "fails gracefully if package.json has no deps or devDeps",
      },
    ])("$name", async ({ fixture }) => {
      const { root } = useFixture({
        fixture,
      });

      const mockedExec = jest
        .spyOn(utils, "exec")
        .mockImplementation((command: string) => {
          // fail the check for the titan to force local
          if (command.includes("bin")) {
            return undefined;
          }
        });

      const mockGetAvailablePackageManagers = jest
        .spyOn(titanUtils, "getAvailablePackageManagers")
        .mockResolvedValue({
          pnpm: "8.0.0",
          npm: undefined,
          yarn: undefined,
          bun: undefined,
        });

      const project = getWorkspaceDetailsMockReturnValue({
        root,
        packageManager: "pnpm",
      });
      const mockGetWorkspaceDetails = jest
        .spyOn(titanWorkspaces, "getWorkspaceDetails")
        .mockResolvedValue(project);

      // get the command
      const upgradeCommand = await getTitanUpgradeCommand({
        project,
      });

      expect(upgradeCommand).toEqual(undefined);

      mockedExec.mockRestore();
      mockGetAvailablePackageManagers.mockRestore();
      mockGetWorkspaceDetails.mockRestore();
    });
  });
});
