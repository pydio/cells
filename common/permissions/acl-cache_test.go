package permissions

import (
	"context"
	"testing"
)

func TestWithFreshAccessListSkipsCachedList(t *testing.T) {
	ctx := context.Background()
	if hasFreshAccessList(ctx) {
		t.Fatal("fresh access list is enabled by default")
	}

	freshCtx := WithFreshAccessList(ctx)
	if !hasFreshAccessList(freshCtx) {
		t.Fatal("WithFreshAccessList() did not mark the request context")
	}
}
