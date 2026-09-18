package service

import (
	"context"
	"errors"
	"testing"
)

func TestApplyMigrationsStopsAtFailedMigration(t *testing.T) {
	var applied []string
	failure := errors.New("dependency unavailable")
	migrations := []*Migration{
		{TargetVersion: ValidVersion("1.0.0"), Up: func(context.Context) error {
			applied = append(applied, "1.0.0")
			return nil
		}},
		{TargetVersion: ValidVersion("2.0.0"), Up: func(context.Context) error {
			applied = append(applied, "2.0.0")
			return failure
		}},
		{TargetVersion: ValidVersion("3.0.0"), Up: func(context.Context) error {
			applied = append(applied, "3.0.0")
			return nil
		}},
	}

	current := ValidVersion("0.1.0")
	target := ValidVersion("3.0.0")
	version, err := applyMigrations(context.Background(), current, target, migrations)
	if !errors.Is(err, failure) {
		t.Fatalf("expected migration failure, got %v", err)
	}
	if version == nil || version.String() != "1.0.0" {
		t.Fatalf("expected last successful version 1.0.0, got %v", version)
	}
	if got := len(applied); got != 2 || applied[1] != "2.0.0" {
		t.Fatalf("expected migration execution to stop at failure, got %v", applied)
	}
}
