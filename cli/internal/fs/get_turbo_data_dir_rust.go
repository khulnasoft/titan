//go:build rust
// +build rust

package fs

import (
	"github.com/khulnasoft/titan/cli/internal/ffi"
	"github.com/khulnasoft/titan/cli/internal/titanpath"
)

// GetTitanDataDir returns a directory outside of the repo
// where titan can store data files related to titan.
func GetTitanDataDir() titanpath.AbsoluteSystemPath {
	dir := ffi.GetTitanDataDir()
	return titanpath.AbsoluteSystemPathFromUpstream(dir)
}
