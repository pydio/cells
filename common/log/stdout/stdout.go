package stdout

import (
	"context"
	"fmt"
	"net/url"
	"os"

	"go.uber.org/zap/zapcore"

	"github.com/pydio/cells/v4/common/log"
)

func init() {
	log.DefaultURLMux().RegisterSync("stdout", &opener{})
	log.DefaultURLMux().RegisterSync("err", &opener{})
}

type opener struct{}

func (o *opener) OpenSync(ctx context.Context, u *url.URL) (log.WriteSyncerCloser, error) {
	if u.Scheme == "stdout" {
		log.StdOut = os.Stdout
		return &wrapper{log.StdOut}, nil
	} else if u.Scheme == "stderr" {
		return &wrapper{os.Stderr}, nil
	} else {
		return nil, fmt.Errorf("unsupported WriteSyncer scheme %s", u.Scheme)
	}
}

type wrapper struct {
	zapcore.WriteSyncer
}

func (w *wrapper) Close() error {
	return nil
}
