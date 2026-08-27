package etcd_test

import (
	"context"
	"fmt"
	"os"
	"testing"
	"time"

	clientv3 "go.etcd.io/etcd/client/v3"

	"github.com/pydio/cells/v5/common/config"
	_ "github.com/pydio/cells/v5/common/config/etcd"
)

func TestSaveIsVisibleToImmediatelyReopenedStore(t *testing.T) {
	etcdHost := os.Getenv("ETCD_SERVER_ADDR")
	if etcdHost == "" {
		t.Skip("ETCD_SERVER_ADDR is not set")
	}

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	prefix := fmt.Sprintf("cells-config-save-test-%d", time.Now().UnixNano())
	client, err := clientv3.New(clientv3.Config{Endpoints: []string{etcdHost}})
	if err != nil {
		t.Fatal(err)
	}
	defer client.Close()
	defer func() {
		cleanupCtx, cleanupCancel := context.WithTimeout(context.Background(), time.Second)
		defer cleanupCancel()
		_, _ = client.Delete(cleanupCtx, prefix, clientv3.WithPrefix())
	}()

	writer, err := config.OpenStore(ctx, "etcd://"+etcdHost+"/"+prefix)
	if err != nil {
		t.Fatal(err)
	}
	if err := writer.Val("databases", "main", "driver").Set("sql"); err != nil {
		t.Fatal(err)
	}
	if err := writer.Val("databases", "main", "dsn").Set("mysql://cells"); err != nil {
		t.Fatal(err)
	}
	if err := writer.Save("test", "persist configuration"); err != nil {
		t.Fatal(err)
	}
	reader, err := config.OpenStore(ctx, "etcd://"+etcdHost+"/"+prefix)
	if err != nil {
		t.Fatal(err)
	}
	if got := reader.Val("databases", "main", "driver").String(); got != "sql" {
		t.Fatalf("configuration was not visible after Save: got driver %q", got)
	}
	if got := reader.Val("databases", "main", "dsn").String(); got != "mysql://cells" {
		t.Fatalf("configuration was not visible after Save: got DSN %q", got)
	}
}
