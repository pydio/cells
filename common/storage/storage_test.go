package storage

import (
	"context"
	"fmt"
	"net/url"
	"testing"

	"github.com/pydio/cells/v4/common/utils/openurl"
)

type mockOpener struct{}

func (*mockOpener) Open(ctx context.Context, u *url.URL) (Storage, error) {
	fmt.Println("this is a test")

	return
}

func TestOpener(t *testing.T) {
	o := openurl.NewURLMux[Storage]("test")
	o.Register("test", &mockOpener{})
}
