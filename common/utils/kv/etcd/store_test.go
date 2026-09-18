package etcd

import (
	"context"
	"errors"
	"testing"

	clientv3 "go.etcd.io/etcd/client/v3"

	"github.com/pydio/cells/v5/common/utils/kv"
)

func TestLatestOperations(t *testing.T) {
	ops := []clientv3.Op{
		clientv3.OpPut("config/a", "old"),
		clientv3.OpPut("config/b", "value"),
		clientv3.OpPut("config/a", "new"),
	}

	got := latestOperations(ops)
	if len(got) != 2 {
		t.Fatalf("expected 2 operations, got %d", len(got))
	}
	if key := string(got[0].KeyBytes()); key != "config/b" {
		t.Fatalf("unexpected first key: %q", key)
	}
	if value := string(got[0].ValueBytes()); value != "value" {
		t.Fatalf("unexpected first value: %q", value)
	}
	if key := string(got[1].KeyBytes()); key != "config/a" {
		t.Fatalf("unexpected second key: %q", key)
	}
	if value := string(got[1].ValueBytes()); value != "new" {
		t.Fatalf("unexpected second value: %q", value)
	}
}

func TestNewStoreReturnsInitialLoadError(t *testing.T) {
	ctx, cancel := context.WithCancel(context.Background())
	cancel()

	client, err := clientv3.New(clientv3.Config{Endpoints: []string{"127.0.0.1:1"}})
	if err != nil {
		t.Fatal(err)
	}
	defer client.Close()

	_, err = NewStore(ctx, kv.NewStore().Val(), client, "config", -1)
	if !errors.Is(err, context.Canceled) {
		t.Fatalf("expected context cancellation, got %v", err)
	}
}

func TestSaveReturnsContextError(t *testing.T) {
	ctx, cancel := context.WithCancel(context.Background())
	cancel()

	store := &Store{
		ctx: ctx,
		ops: make(chan storeOp),
	}
	if err := store.Save("test", "test"); !errors.Is(err, context.Canceled) {
		t.Fatalf("expected context cancellation, got %v", err)
	}
}
