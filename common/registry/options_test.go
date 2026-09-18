package registry

import (
	"context"
	"reflect"
	"testing"

	pb "github.com/pydio/cells/v5/common/proto/registry"
	"github.com/pydio/cells/v5/common/storage"
)

type testStorage struct{}

func (testStorage) Resolve(context.Context, ...map[string]interface{}) (string, error) {
	return "", nil
}
func (testStorage) Get(context.Context, ...map[string]interface{}) (any, error) { return nil, nil }
func (testStorage) ReturnType() reflect.Type                                    { return reflect.TypeOf((*string)(nil)) }

func TestFilterItemsStorage(t *testing.T) {
	var itemStorage storage.Storage = testStorage{}
	item := NewRichItem("storage-id", "storage", pb.ItemType_STORAGE, itemStorage)

	items := (&Options{}).filterItems(item)
	if len(items) != 1 {
		t.Fatalf("expected storage item to match ItemType_STORAGE, got %d items", len(items))
	}
}
