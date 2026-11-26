package restv2

import (
	"context"
	"errors"
	"testing"

	cellserrors "github.com/pydio/cells/v5/common/errors"
	"github.com/pydio/cells/v5/common/proto/tree"
)

type fakeCreateCheckRecovery struct {
	retry bool
	err   error
	calls int
	path  string
}

func (f *fakeCreateCheckRecovery) WaitForWorkspace(_ context.Context, path string) (bool, error) {
	f.calls++
	f.path = path
	return f.retry, f.err
}

func TestNewHandlerUsesOptionalCreateCheckRecoveryProvider(t *testing.T) {
	previousFactory := CreateCheckRecoveryProviderFactory
	defer func() { CreateCheckRecoveryProviderFactory = previousFactory }()

	recovery := &fakeCreateCheckRecovery{retry: true}
	CreateCheckRecoveryProviderFactory = func() CreateCheckRecovery { return recovery }

	handler := NewHandler()
	if handler.CreateCheckRecovery != recovery {
		t.Fatal("NewHandler() did not use the configured recovery provider")
	}
}

func TestResolveCreateCheckPathRecovery(t *testing.T) {
	workspaceErr := cellserrors.WithStack(cellserrors.WorkspaceNotFound)
	path := "b470baed-cf48-444b-892a-40c2761eb957@wire.example/file.txt"

	t.Run("retry uses fresh access list and preserves missing leaf", func(t *testing.T) {
		recovery := &fakeCreateCheckRecovery{retry: true}
		var lookupContexts []context.Context
		lookup := func(ctx context.Context) (*tree.Node, error) {
			lookupContexts = append(lookupContexts, ctx)
			if len(lookupContexts) == 1 {
				return nil, workspaceErr
			}
			return nil, cellserrors.NodeNotFound
		}

		_, _, err := resolveCreateCheckPath(context.Background(), path, lookup, recovery)

		if !cellserrors.Is(err, cellserrors.NodeNotFound) {
			t.Fatalf("resolveCreateCheckPath() error = %v, want NodeNotFound", err)
		}
		if recovery.calls != 1 || recovery.path != path {
			t.Fatalf("recovery calls/path = %d/%q", recovery.calls, recovery.path)
		}
		if len(lookupContexts) != 2 || lookupContexts[0] == lookupContexts[1] {
			t.Fatalf("lookup contexts = %v, want original then fresh context", lookupContexts)
		}
	})

	t.Run("ready workspace keeps the normal lookup", func(t *testing.T) {
		recovery := &fakeCreateCheckRecovery{retry: true}
		node := &tree.Node{Uuid: "existing-node"}
		lookup := func(context.Context) (*tree.Node, error) { return node, nil }

		_, actual, err := resolveCreateCheckPath(context.Background(), path, lookup, recovery)

		if err != nil || actual != node {
			t.Fatalf("resolveCreateCheckPath() = (%v, %v), want existing node and nil", actual, err)
		}
		if recovery.calls != 0 {
			t.Fatalf("recovery calls = %d, want 0", recovery.calls)
		}
	})

	t.Run("missing or denied workspace preserves original error", func(t *testing.T) {
		recovery := &fakeCreateCheckRecovery{}
		lookup := func(context.Context) (*tree.Node, error) { return nil, workspaceErr }

		_, _, err := resolveCreateCheckPath(context.Background(), path, lookup, recovery)

		if !cellserrors.Is(err, cellserrors.WorkspaceNotFound) {
			t.Fatalf("resolveCreateCheckPath() error = %v, want WorkspaceNotFound", err)
		}
		if recovery.calls != 1 {
			t.Fatalf("recovery calls = %d, want 1", recovery.calls)
		}
	})

	t.Run("pending timeout or failure is returned", func(t *testing.T) {
		unavailable := cellserrors.WithMessage(cellserrors.StatusServiceUnavailable, "provisioning did not complete")
		recovery := &fakeCreateCheckRecovery{err: unavailable}
		lookup := func(context.Context) (*tree.Node, error) { return nil, workspaceErr }

		_, _, err := resolveCreateCheckPath(context.Background(), path, lookup, recovery)

		if !cellserrors.Is(err, cellserrors.StatusServiceUnavailable) {
			t.Fatalf("resolveCreateCheckPath() error = %v, want service-unavailable", err)
		}
	})

	t.Run("missing leaf is not recovered", func(t *testing.T) {
		recovery := &fakeCreateCheckRecovery{retry: true}
		lookup := func(context.Context) (*tree.Node, error) { return nil, cellserrors.NodeNotFound }

		_, _, err := resolveCreateCheckPath(context.Background(), path, lookup, recovery)

		if !cellserrors.Is(err, cellserrors.NodeNotFound) {
			t.Fatalf("resolveCreateCheckPath() error = %v, want NodeNotFound", err)
		}
		if recovery.calls != 0 {
			t.Fatalf("recovery calls = %d, want 0", recovery.calls)
		}
	})

	t.Run("other lookup errors are not recovered", func(t *testing.T) {
		recovery := &fakeCreateCheckRecovery{retry: true}
		lookupErr := errors.New("tree lookup failed")
		lookup := func(context.Context) (*tree.Node, error) { return nil, lookupErr }

		_, _, err := resolveCreateCheckPath(context.Background(), path, lookup, recovery)

		if !errors.Is(err, lookupErr) {
			t.Fatalf("resolveCreateCheckPath() error = %v, want original lookup error", err)
		}
		if recovery.calls != 0 {
			t.Fatalf("recovery calls = %d, want 0", recovery.calls)
		}
	})
}
