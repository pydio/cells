package config

import "testing"

func TestReplaceRemovesPropertiesMissingFromSnapshot(t *testing.T) {
	store := NewStore()
	if err := store.Set(map[string]any{
		"keep":   "old",
		"remove": "stale",
	}); err != nil {
		t.Fatal(err)
	}

	if err := Replace(store, map[string]any{"keep": "new"}); err != nil {
		t.Fatal(err)
	}
	if got := store.Val("keep").String(); got != "new" {
		t.Fatalf("expected replacement value, got %q", got)
	}
	if got := store.Val("remove").Get(); got != nil {
		t.Fatalf("expected missing property to be removed, got %#v", got)
	}
}
