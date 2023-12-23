// Package cmdutil holds functionality to run titan via cobra. That includes flag parsing and configuration
// of components common to all subcommands
package cmdutil

import (
	"fmt"
	"io"
	"io/ioutil"
	"os"
	"sync"

	"github.com/hashicorp/go-hclog"

	"github.com/fatih/color"
	"github.com/khulnasoft/titan/cli/internal/client"
	"github.com/khulnasoft/titan/cli/internal/fs"
	"github.com/khulnasoft/titan/cli/internal/titanpath"
	"github.com/khulnasoft/titan/cli/internal/titanstate"
	"github.com/khulnasoft/titan/cli/internal/ui"
	"github.com/mitchellh/cli"
)

const (
	// _envLogLevel is the environment log level
	_envLogLevel = "TITAN_LOG_LEVEL"
)

// Helper is a struct used to hold configuration values passed via flag, env vars,
// config files, etc. It is not intended for direct use by titan commands, it drives
// the creation of CmdBase, which is then used by the commands themselves.
type Helper struct {
	// TitanVersion is the version of titan that is currently executing
	TitanVersion string

	// for logging
	verbosity int

	rawRepoRoot string

	cleanupsMu sync.Mutex
	cleanups   []io.Closer
}

// RegisterCleanup saves a function to be run after titan execution,
// even if the command that runs returns an error
func (h *Helper) RegisterCleanup(cleanup io.Closer) {
	h.cleanupsMu.Lock()
	defer h.cleanupsMu.Unlock()
	h.cleanups = append(h.cleanups, cleanup)
}

// Cleanup runs the register cleanup handlers. It requires the flags
// to the root command so that it can construct a UI if necessary
func (h *Helper) Cleanup(cliConfig *titanstate.ParsedArgsFromRust) {
	h.cleanupsMu.Lock()
	defer h.cleanupsMu.Unlock()
	var ui cli.Ui
	for _, cleanup := range h.cleanups {
		if err := cleanup.Close(); err != nil {
			if ui == nil {
				ui = h.getUI(cliConfig)
			}
			ui.Warn(fmt.Sprintf("failed cleanup: %v", err))
		}
	}
}

func (h *Helper) getUI(cliArgs *titanstate.ParsedArgsFromRust) cli.Ui {
	factory := h.getUIFactory(cliArgs)
	return factory.Build(os.Stdout, os.Stdin, os.Stderr)
}

func (h *Helper) getUIFactory(cliArgs *titanstate.ParsedArgsFromRust) ui.Factory {
	colorMode := ui.GetColorModeFromEnv()
	if cliArgs.NoColor {
		colorMode = ui.ColorModeSuppressed
	}
	if cliArgs.Color {
		colorMode = ui.ColorModeForced
	}
	return &ui.ColoredUIFactory{
		ColorMode: colorMode,
		Base:      &ui.BasicUIFactory{},
	}
}

func (h *Helper) getLogger() (hclog.Logger, error) {
	var level hclog.Level
	switch h.verbosity {
	case 0:
		if v := os.Getenv(_envLogLevel); v != "" {
			level = hclog.LevelFromString(v)
			if level == hclog.NoLevel {
				return nil, fmt.Errorf("%s value %q is not a valid log level", _envLogLevel, v)
			}
		} else {
			level = hclog.NoLevel
		}
	case 1:
		level = hclog.Info
	case 2:
		level = hclog.Debug
	case 3:
		level = hclog.Trace
	default:
		level = hclog.Trace
	}
	// Default output is nowhere unless we enable logging.
	output := ioutil.Discard
	color := hclog.ColorOff
	if level != hclog.NoLevel {
		output = os.Stderr
		color = hclog.AutoColor
	}

	return hclog.New(&hclog.LoggerOptions{
		Name:   "titan",
		Level:  level,
		Color:  color,
		Output: output,
	}), nil
}

// NewHelper returns a new helper instance to hold configuration values for the root
// titan command.
func NewHelper(titanVersion string, args *titanstate.ParsedArgsFromRust) *Helper {
	return &Helper{
		TitanVersion: titanVersion,
		verbosity:    args.Verbosity,
	}
}

// GetCmdBase returns a CmdBase instance configured with values from this helper.
// It additionally returns a mechanism to set an error, so
func (h *Helper) GetCmdBase(executionState *titanstate.ExecutionState) (*CmdBase, error) {
	// terminal is for color/no-color output
	uiFactory := h.getUIFactory(&executionState.CLIArgs)
	terminal := uiFactory.Build(os.Stdin, os.Stdout, os.Stderr)
	// logger is configured with verbosity level using --verbosity flag from end users
	logger, err := h.getLogger()
	if err != nil {
		return nil, err
	}
	cwdRaw := executionState.CLIArgs.CWD
	if err != nil {
		return nil, err
	}
	cwd, err := fs.GetCwd(cwdRaw)
	if err != nil {
		return nil, err
	}
	repoRoot := fs.ResolveUnknownPath(cwd, h.rawRepoRoot)
	repoRoot, err = repoRoot.EvalSymlinks()
	if err != nil {
		return nil, err
	}
	apiClientConfig := executionState.APIClientConfig
	spacesAPIClientConfig := executionState.SpacesAPIClientConfig

	apiClient := client.NewClient(
		apiClientConfig,
		logger,
		h.TitanVersion,
	)

	spacesClient := client.NewClient(
		spacesAPIClientConfig,
		logger,
		h.TitanVersion,
	)

	return &CmdBase{
		UI:              terminal,
		UIFactory:       uiFactory,
		Logger:          logger,
		RepoRoot:        repoRoot,
		Config:          executionState.Config,
		APIClient:       apiClient,
		SpacesAPIClient: spacesClient,
		TitanVersion:    h.TitanVersion,
	}, nil
}

// CmdBase encompasses configured components common to all titan commands.
type CmdBase struct {
	UI              cli.Ui
	UIFactory       ui.Factory
	Logger          hclog.Logger
	RepoRoot        titanpath.AbsoluteSystemPath
	Config          titanstate.Config
	APIClient       *client.APIClient
	SpacesAPIClient *client.APIClient
	TitanVersion    string
}

// LogError prints an error to the UI
func (b *CmdBase) LogError(format string, args ...interface{}) {
	err := fmt.Errorf(format, args...)
	b.Logger.Error(fmt.Sprintf("error: %v", err))
	b.UI.Error(fmt.Sprintf("%s%s", ui.ERROR_PREFIX, color.RedString(" %v", err)))
}

// LogWarning logs an error and outputs it to the UI.
func (b *CmdBase) LogWarning(prefix string, err error) {
	b.Logger.Warn(prefix, "warning", err)

	if prefix != "" {
		prefix = " " + prefix + ": "
	}

	b.UI.Warn(fmt.Sprintf("%s%s%s", ui.WARNING_PREFIX, prefix, color.YellowString(" %v", err)))
}

// LogInfo logs an message and outputs it to the UI.
func (b *CmdBase) LogInfo(msg string) {
	b.Logger.Info(msg)
	b.UI.Info(fmt.Sprintf("%s%s", ui.InfoPrefix, color.WhiteString(" %v", msg)))
}
