package etcd

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"os"
	"testing"
	"time"

	clientv3 "go.etcd.io/etcd/client/v3"

	"github.com/pydio/cells/v5/common/config"
	"github.com/pydio/cells/v5/common/proto/install"
)

func openTestStore(t *testing.T) (context.Context, string, config.Store) {
	t.Helper()

	etcdHost := os.Getenv("ETCD_SERVER_ADDR")
	if etcdHost == "" {
		t.Skip("ETCD_SERVER_ADDR is not set")
	}

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	prefix := fmt.Sprintf("cells-config-save-test-%d", time.Now().UnixNano())
	client, err := clientv3.New(clientv3.Config{Endpoints: []string{etcdHost}})
	if err != nil {
		cancel()
		t.Fatal(err)
	}
	t.Cleanup(func() {
		cleanupCtx, cleanupCancel := context.WithTimeout(context.Background(), time.Second)
		defer cleanupCancel()
		_, _ = client.Delete(cleanupCtx, prefix, clientv3.WithPrefix())
		_ = client.Close()
		cancel()
	})

	store, err := config.OpenStore(ctx, "etcd://"+etcdHost+"/"+prefix)
	if err != nil {
		t.Fatal(err)
	}
	t.Cleanup(func() { _ = store.Close(context.Background()) })
	return ctx, "etcd://" + etcdHost + "/" + prefix, store
}

func waitForCondition(t *testing.T, condition func() bool, message string) {
	t.Helper()
	deadline := time.Now().Add(5 * time.Second)
	for time.Now().Before(deadline) {
		if condition() {
			return
		}
		time.Sleep(10 * time.Millisecond)
	}
	t.Fatal(message)
}

func TestSaveIsVisibleToImmediatelyReopenedStore(t *testing.T) {
	ctx, storeURL, writer := openTestStore(t)
	if err := writer.Val("databases", "main", "driver").Set("sql"); err != nil {
		t.Fatal(err)
	}
	if err := writer.Val("databases", "main", "dsn").Set("mysql://cells"); err != nil {
		t.Fatal(err)
	}
	if err := writer.Save("test", "persist configuration"); err != nil {
		t.Fatal(err)
	}
	reader, err := config.OpenStore(ctx, storeURL)
	if err != nil {
		t.Fatal(err)
	}
	defer reader.Close(context.Background())
	if got := reader.Val("databases", "main", "driver").String(); got != "sql" {
		t.Fatalf("configuration was not visible after Save: got driver %q", got)
	}
	if got := reader.Val("databases", "main", "dsn").String(); got != "mysql://cells" {
		t.Fatalf("configuration was not visible after Save: got DSN %q", got)
	}
}

func TestNamespaceUsesSeparatePhysicalKey(t *testing.T) {
	ctx, storeURL, _ := openTestStore(t)
	configURL := storeURL + "/config"
	vaultURL := configURL + "?namespace=vault&masterKey=whatever"
	mainStore, err := config.OpenStore(ctx, configURL)
	if err != nil {
		t.Fatal(err)
	}
	defer mainStore.Close(context.Background())
	vaultStore, err := config.OpenStore(ctx, vaultURL)
	if err != nil {
		t.Fatal(err)
	}
	defer vaultStore.Close(context.Background())

	if err := mainStore.Val("defaults", "marker").Set("config"); err != nil {
		t.Fatal(err)
	}
	if err := vaultStore.Val("secret-id").Set("encrypted-secret"); err != nil {
		t.Fatal(err)
	}
	combined := config.NewVault(vaultStore, mainStore)
	if err := combined.Save("test", "save vault and config"); err != nil {
		t.Fatal(err)
	}

	mainReader, err := config.OpenStore(ctx, configURL)
	if err != nil {
		t.Fatal(err)
	}
	defer mainReader.Close(context.Background())
	vaultReader, err := config.OpenStore(ctx, vaultURL)
	if err != nil {
		t.Fatal(err)
	}
	defer vaultReader.Close(context.Background())

	if got := mainReader.Val("defaults", "marker").String(); got != "config" {
		t.Fatalf("expected config snapshot, got %q", got)
	}
	if got := mainReader.Val("secret-id").Get(); got != nil {
		t.Fatalf("vault value leaked into config snapshot: %#v", got)
	}
	if got := vaultReader.Val("secret-id").String(); got != "encrypted-secret" {
		t.Fatalf("expected vault snapshot, got %q", got)
	}
	if got := vaultReader.Val("defaults").Get(); got != nil {
		t.Fatalf("config value leaked into vault snapshot: %#v", got)
	}
}

func TestOwnSaveEventDoesNotMergeOldSampleIntoNewSnapshot(t *testing.T) {
	ctx, storeURL, writer := openTestStore(t)

	sample := map[string]any{"defaults": map[string]any{"sites": []any{
		map[string]any{
			"Binds":     []any{"0.0.0.0:8080"},
			"TLSConfig": map[string]any{"SelfSigned": map[string]any{}},
		},
	}}}
	if err := writer.Set(sample); err != nil {
		t.Fatal(err)
	}
	if err := writer.Save("test", "sample"); err != nil {
		t.Fatal(err)
	}

	proxySites := []*install.ProxyConfig{
		{Binds: []string{"0.0.0.0:8080"}},
		{Binds: []string{"0.0.0.0:8081"}},
	}
	if err := writer.Val("defaults", "sites").Set(proxySites); err != nil {
		t.Fatal(err)
	}
	var customSites any
	if err := json.Unmarshal([]byte(`[
		{"Binds":["0.0.0.0:8080"],"ReverseProxyURL":"https://cluster.pydiocells.com"},
		{"Binds":["0.0.0.0:8081"],"ReverseProxyURL":"https://admin.pydiocells.com"}
	]`), &customSites); err != nil {
		t.Fatal(err)
	}
	if err := writer.Val("defaults", "sites").Set(customSites); err != nil {
		t.Fatal(err)
	}
	if err := writer.Save("test", "custom sites"); err != nil {
		t.Fatal(err)
	}

	reader, err := config.OpenStore(ctx, storeURL)
	if err != nil {
		t.Fatal(err)
	}
	defer reader.Close(context.Background())
	if got := reader.Val("defaults", "sites", "0", "TLSConfig").Get(); got != nil {
		t.Fatalf("expected TLSConfig to stay removed, got %#v", got)
	}
}

func TestCleanStoreReplacesRemoteSnapshot(t *testing.T) {
	ctx, storeURL, writer := openTestStore(t)
	if err := writer.Set(map[string]any{"keep": "value", "remove": "stale"}); err != nil {
		t.Fatal(err)
	}
	if err := writer.Save("test", "initial snapshot"); err != nil {
		t.Fatal(err)
	}

	reader, err := config.OpenStore(ctx, storeURL)
	if err != nil {
		t.Fatal(err)
	}
	defer reader.Close(context.Background())

	if err := writer.Val("remove").Del(); err != nil {
		t.Fatal(err)
	}
	if err := writer.Save("test", "remove property"); err != nil {
		t.Fatal(err)
	}

	waitForCondition(t, func() bool {
		return reader.Val("remove").Get() == nil
	}, "remote property was not removed from clean reader")
	if got := reader.Val("keep").String(); got != "value" {
		t.Fatalf("expected retained value, got %q", got)
	}
}

func TestDirtyStorePreservesLocalChangesAndReportsConflict(t *testing.T) {
	ctx, storeURL, seed := openTestStore(t)
	if err := seed.Set(map[string]any{"base": "value"}); err != nil {
		t.Fatal(err)
	}
	if err := seed.Save("test", "seed"); err != nil {
		t.Fatal(err)
	}

	local, err := config.OpenStore(ctx, storeURL)
	if err != nil {
		t.Fatal(err)
	}
	defer local.Close(context.Background())
	remote, err := config.OpenStore(ctx, storeURL)
	if err != nil {
		t.Fatal(err)
	}
	defer remote.Close(context.Background())

	if err := local.Val("local").Set("unsaved"); err != nil {
		t.Fatal(err)
	}
	if err := remote.Val("remote").Set("saved"); err != nil {
		t.Fatal(err)
	}
	if err := remote.Save("test", "external update"); err != nil {
		t.Fatal(err)
	}

	internal := local.(*etcdStore)
	waitForCondition(t, func() bool {
		internal.mu.Lock()
		defer internal.mu.Unlock()
		return internal.pendingRemote != nil
	}, "dirty store did not retain the pending remote snapshot")

	if got := local.Val("local").String(); got != "unsaved" {
		t.Fatalf("expected unsaved local value to be preserved, got %q", got)
	}
	if got := local.Val("remote").Get(); got != nil {
		t.Fatalf("expected remote update not to merge into dirty store, got %#v", got)
	}
	if err := local.Save("test", "conflicting update"); !errors.Is(err, config.ErrConfigConflict) {
		t.Fatalf("expected configuration conflict, got %v", err)
	}
}
