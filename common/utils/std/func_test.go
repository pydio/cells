package std

import (
	"context"
	"errors"
	"testing"
)

func TestRetryReturnsContextError(t *testing.T) {
	ctx, cancel := context.WithCancel(context.Background())
	cancel()

	err := Retry(ctx, func() error {
		return errors.New("dependency unavailable")
	})
	if !errors.Is(err, context.Canceled) {
		t.Fatalf("expected context cancellation, got %v", err)
	}
}
