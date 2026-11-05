package sql_test

import (
	"context"
	stderrors "errors"
	"testing"

	ssql "github.com/pydio/cells/v5/common/storage/sql"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

func TestWithTxRetryRetriesMySQLRecordChanged(t *testing.T) {
	db, err := gorm.Open(sqlite.Open("file:with-tx-retry?mode=memory&cache=shared"), &gorm.Config{})
	if err != nil {
		t.Fatal(err)
	}

	attempts := 0
	err = ssql.WithTxRetry(context.Background(), db, 3, "test record changed retry", func(*gorm.DB) error {
		attempts++
		if attempts < 3 {
			return stderrors.New("Error 1020 (HY000): Record has changed since last read; try restarting transaction")
		}
		return nil
	})
	if err != nil {
		t.Fatalf("WithTxRetry() error = %v", err)
	}
	if attempts != 3 {
		t.Fatalf("WithTxRetry() attempts = %d, want 3", attempts)
	}
}
