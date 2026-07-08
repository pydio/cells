package bleve

import (
	"encoding/json"
	"strings"
	"testing"

	blevelib "github.com/blevesearch/bleve/v2"

	"github.com/pydio/cells/v5/common/proto/tree"
)

func TestBuildQuerySortSizeGroupsFoldersFirst(t *testing.T) {
	codec := &Codec{}

	got, _, err := codec.BuildQuery(&tree.Query{}, 0, 0, tree.MetaSortSize, false)
	if err != nil {
		t.Fatal(err)
	}
	assertBleveSortContains(t, got, `"NodeType"`, `"Size"`)

	got, _, err = codec.BuildQuery(&tree.Query{}, 0, 0, tree.MetaSortSize, true)
	if err != nil {
		t.Fatal(err)
	}
	assertBleveSortContains(t, got, `"NodeType"`, `"-Size"`)
}

func assertBleveSortContains(t *testing.T, got interface{}, parts ...string) {
	t.Helper()

	request, ok := got.(*blevelib.SearchRequest)
	if !ok {
		t.Fatalf("expected *bleve.SearchRequest, got %T", got)
	}
	payload, err := json.Marshal(request.Sort)
	if err != nil {
		t.Fatal(err)
	}
	jsonSort := string(payload)
	for _, part := range parts {
		if !strings.Contains(jsonSort, part) {
			t.Fatalf("sort %s does not contain %s", jsonSort, part)
		}
	}
}
