package memory

import (
	"context"
	"github.com/pydio/cells/v4/common/config"
	"net/url"
)

var scheme = "memory"

type URLOpener struct {}

func init() {
	o := &URLOpener{}
	config.DefaultURLMux().Register(scheme, o)
}

func (o *URLOpener) OpenURL(ctx context.Context, u *url.URL) (config.Store, error) {
	return config.New(New()), nil
}
