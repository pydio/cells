package nodes

import (
	"fmt"
	"sync"
	"testing"

	"github.com/pydio/cells/v5/common/errors"
)

func TestCopyMoveChildrenResult(t *testing.T) {
	t.Run("forbidden concurrent child preserves progress and fails", func(t *testing.T) {
		var result copyMoveChildrenResult
		var wg sync.WaitGroup
		wg.Add(2)
		go func() {
			defer wg.Done()
			result.record(nil)
		}()
		go func() {
			defer wg.Done()
			result.record(errors.StatusForbidden)
		}()
		wg.Wait()

		if result.childrenMoved != 1 {
			t.Fatalf("childrenMoved = %d, want 1", result.childrenMoved)
		}
		if !Is403(result.firstError()) {
			t.Fatalf("firstError = %v, want forbidden", result.firstError())
		}
	})

	t.Run("forbidden last child fails without discarding prior progress", func(t *testing.T) {
		var result copyMoveChildrenResult
		result.record(nil)                                                         // A permitted sibling was moved first.
		result.record(fmt.Errorf("%w: secret-child-path", errors.StatusForbidden)) // The designated last child was denied.

		if result.childrenMoved != 1 {
			t.Fatalf("childrenMoved = %d, want 1", result.childrenMoved)
		}
		if result.firstError() != errors.StatusForbidden {
			t.Fatalf("firstError = %v, want generic forbidden error", result.firstError())
		}
	})

	t.Run("all children succeed", func(t *testing.T) {
		var result copyMoveChildrenResult
		result.record(nil)
		result.record(nil)

		if result.childrenMoved != 2 {
			t.Fatalf("childrenMoved = %d, want 2", result.childrenMoved)
		}
		if err := result.firstError(); err != nil {
			t.Fatalf("firstError = %v, want nil", err)
		}
	})
}
