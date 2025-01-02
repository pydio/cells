package memory

import (
	"context"
	"net/url"

	"github.com/pydio/cells/v5/common/config"
	"github.com/pydio/cells/v5/common/crypto"
	"github.com/pydio/cells/v5/common/utils/configx"
	"github.com/pydio/cells/v5/common/utils/kv"
)

const (
	memScheme = "mem"
)

func init() {
	config.DefaultURLMux().Register(memScheme, &MemOpener{})
}

type MemOpener struct{}

func (o *MemOpener) Open(ctx context.Context, urlstr string) (config.Store, error) {

	u, err := url.Parse(urlstr)
	if err != nil {
		return nil, err
	}

	var opts []configx.Option

	if master := u.Query().Get("masterKey"); master != "" {
		enc, err := crypto.NewVaultCipher(master)
		if err != nil {
			return nil, err
		}
		opts = append(opts, configx.WithEncrypt(enc), configx.WithDecrypt(enc))
	}

	store := kv.NewStore(opts...)

	return store, nil
}
