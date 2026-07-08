package bleve

import (
	"encoding/json"
	"testing"

	blevelib "github.com/blevesearch/bleve/v2"

	"github.com/pydio/cells/v5/common/proto/tree"
)

func TestBuildQuerySortSizeUsesNumericSizeOnly(t *testing.T) {
	codec := &Codec{}

	got, _, err := codec.BuildQuery(&tree.Query{}, 0, 0, tree.MetaSortSize, false)
	if err != nil {
		t.Fatal(err)
	}
	assertBleveSortEquals(t, got, `["Size"]`)

	got, _, err = codec.BuildQuery(&tree.Query{}, 0, 0, tree.MetaSortSize, true)
	if err != nil {
		t.Fatal(err)
	}
	assertBleveSortEquals(t, got, `["-Size"]`)
}

func assertBleveSortEquals(t *testing.T, got interface{}, want string) {
	t.Helper()

	request, ok := got.(*blevelib.SearchRequest)
	if !ok {
		t.Fatalf("expected *bleve.SearchRequest, got %T", got)
	}
	payload, err := json.Marshal(request.Sort)
	if err != nil {
		t.Fatal(err)
	}
	if string(payload) != want {
		t.Fatalf("unexpected sort\nwant: %s\n got: %s", want, payload)
	}
}
