//go:build go || !rust
// +build go !rust

package fs

import (
	"github.com/adrg/xdg"
	"github.com/khulnasoft/titan/cli/internal/titanpath"
)

// GetTitanDataDir returns a directory outside of the repo
// where titan can store data files related to titan.
func GetTitanDataDir() titanpath.AbsoluteSystemPath {
	dataHome := AbsoluteSystemPathFromUpstream(xdg.DataHome)
	return dataHome.UntypedJoin("titanrepo")
}
