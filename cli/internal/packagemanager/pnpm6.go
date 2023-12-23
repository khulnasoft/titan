package packagemanager

import (
	"github.com/khulnasoft/titan/cli/internal/fs"
	"github.com/khulnasoft/titan/cli/internal/lockfile"
	"github.com/khulnasoft/titan/cli/internal/titanpath"
)

const pnpm6Lockfile = "pnpm-lock.yaml"

// Pnpm6Workspaces is a representation of workspace package globs found
// in pnpm-workspace.yaml
type Pnpm6Workspaces struct {
	Packages []string `yaml:"packages,omitempty"`
}

var nodejsPnpm6 = PackageManager{
	Name:                       "nodejs-pnpm6",
	Slug:                       "pnpm",
	Command:                    "pnpm",
	Specfile:                   "package.json",
	Lockfile:                   pnpm6Lockfile,
	PackageDir:                 "node_modules",
	ArgSeparator:               func(_userArgs []string) []string { return []string{"--"} },
	WorkspaceConfigurationPath: "pnpm-workspace.yaml",

	getWorkspaceGlobs: getPnpmWorkspaceGlobs,

	getWorkspaceIgnores: getPnpmWorkspaceIgnores,

	canPrune: func(cwd titanpath.AbsoluteSystemPath) (bool, error) {
		return true, nil
	},

	GetLockfileName: func(_ titanpath.AbsoluteSystemPath) string {
		return pnpm6Lockfile
	},

	GetLockfilePath: func(projectDirectory titanpath.AbsoluteSystemPath) titanpath.AbsoluteSystemPath {
		return projectDirectory.UntypedJoin(pnpm6Lockfile)
	},

	GetLockfileContents: func(projectDirectory titanpath.AbsoluteSystemPath) ([]byte, error) {
		return projectDirectory.UntypedJoin(pnpm6Lockfile).ReadFile()
	},

	UnmarshalLockfile: func(_rootPackageJSON *fs.PackageJSON, contents []byte) (lockfile.Lockfile, error) {
		return lockfile.DecodePnpmLockfile(contents)
	},
}
