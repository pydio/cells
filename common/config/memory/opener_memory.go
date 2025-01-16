package memory

import (
	"context"
	"github.com/pydio/cells/v5/common/config"
)

const (
	memScheme = "mem"
)

func init() {
	config.DefaultURLMux().Register(memScheme, &MemOpener{})
}

type MemOpener struct{}

func (o *MemOpener) Open(ctx context.Context, urlstr string, base config.Store) (config.Store, error) {
	return base, nil
}
