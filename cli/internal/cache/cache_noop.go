package cache

import "github.com/khulnasoft/titan/cli/internal/titanpath"

type noopCache struct{}

func newNoopCache() *noopCache {
	return &noopCache{}
}

func (c *noopCache) Put(_ titanpath.AbsoluteSystemPath, _ string, _ int, _ []titanpath.AnchoredSystemPath) error {
	return nil
}
func (c *noopCache) Fetch(_ titanpath.AbsoluteSystemPath, _ string, _ []string) (ItemStatus, []titanpath.AnchoredSystemPath, error) {
	return NewCacheMiss(), nil, nil
}

func (c *noopCache) Exists(_ string) ItemStatus {
	return NewCacheMiss()
}

func (c *noopCache) Clean(_ titanpath.AbsoluteSystemPath) {}
func (c *noopCache) CleanAll()                            {}
func (c *noopCache) Shutdown()                            {}
