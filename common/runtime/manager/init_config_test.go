package manager

import (
	"context"
	"testing"

	"github.com/spf13/viper"

	"github.com/pydio/cells/v5/common"
	"github.com/pydio/cells/v5/common/config"
	"github.com/pydio/cells/v5/common/runtime"
	"github.com/pydio/cells/v5/common/utils/propagator"

	_ "github.com/pydio/cells/v5/common/config/etcd"
	_ "github.com/pydio/cells/v5/common/config/memory"
)

func TestInitConfigOAuthSecret(t *testing.T) {
	r := viper.New()
	r.Set(runtime.KeyConfig, "etcd://0.0.0.0:2379/config")
	r.Set("computedVaultURL", "mem://?masterKey=whatever")
	runtime.SetRuntime(r)

	ctx := context.Background()
	m := &manager{ctx: ctx}

	mainStorePool, _, _, err := m.initConfig(ctx)
	if err != nil {
		t.Fatalf("initConfig failed: %v", err)
	}

	ctx = propagator.With(ctx, config.ContextKey, mainStorePool)

	const expectedSecret = "test-oauth-secret"
	oauthWeb := common.ServiceWebNamespace_ + common.ServiceOAuth

	/*store, err := mainStorePool.Get(ctx)
	if err != nil {
		t.Fatalf("getting config store failed: %v", err)
	}
	if err := store.Val("services", oauthWeb, "secret").Set(expectedSecret); err != nil {
		t.Fatalf("setting OAuth secret failed: %v", err)
	}*/

	got := config.Get(ctx, "services", oauthWeb, "secret").String()
	if got != expectedSecret {
		t.Fatalf("unexpected OAuth secret: got %q, want %q", got, expectedSecret)
	}
}
