package mongo

import (
	"testing"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo/options"

	"github.com/pydio/cells/v5/common/proto/tree"
)

func TestBuildQueryOptionsSortSizeUsesNumericSizeOnly(t *testing.T) {
	codex := &Codex{}

	got, err := codex.BuildQueryOptions(nil, 0, 0, tree.MetaSortSize, false)
	if err != nil {
		t.Fatal(err)
	}
	assertMongoSort(t, got, bson.D{{Key: "size", Value: 1}})

	got, err = codex.BuildQueryOptions(nil, 0, 0, tree.MetaSortSize, true)
	if err != nil {
		t.Fatal(err)
	}
	assertMongoSort(t, got, bson.D{{Key: "size", Value: -1}})
}

func assertMongoSort(t *testing.T, got interface{}, want bson.D) {
	t.Helper()

	findOptions, ok := got.(*options.FindOptions)
	if !ok {
		t.Fatalf("expected *options.FindOptions, got %T", got)
	}
	if !sortsEqual(findOptions.Sort.(bson.D), want) {
		t.Fatalf("unexpected sort\nwant: %#v\n got: %#v", want, findOptions.Sort)
	}
}

func sortsEqual(a, b bson.D) bool {
	if len(a) != len(b) {
		return false
	}
	for i := range a {
		if a[i].Key != b[i].Key || a[i].Value != b[i].Value {
			return false
		}
	}
	return true
}
