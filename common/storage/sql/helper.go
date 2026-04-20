/*
 * Copyright (c) 2019-2021. Abstrium SAS <team (at) pydio.com>
 * This file is part of Pydio Cells.
 *
 * Pydio Cells is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * Pydio Cells is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with Pydio Cells.  If not, see <http://www.gnu.org/licenses/>.
 *
 * The latest code can be found at <https://pydio.com>.
 */

package sql

import (
	"context"
	"database/sql"
	"reflect"
	"strings"
	"time"

	"gorm.io/gorm"
	"gorm.io/gorm/schema"

	"github.com/pydio/cells/v5/common/proto/tree"
	"github.com/pydio/cells/v5/common/telemetry/log"
)

type OrderedUpdate struct {
	Key   string
	Value interface{}
}

type Helper interface {
	Concat(...string) string
	Hash(...string) string
	ParentMPath(levelKey string, mpathes ...string) string
	HashParent(nameKey string, levelKey string, mpathes ...string) string
	ApplyOrderedUpdates(db *gorm.DB, tableName string, sets []OrderedUpdate, wheres []sql.NamedArg) (int64, error)
	MPathOrdering(...string) string
	MPathOrderingLastInteger(...string) string
	FirstAvailableSlot(tableName string, mpath *tree.MPath, levelKey string, mpathes ...string) (string, []any, int64, bool)
}

// TableNameFromModel computes table name from model using standard GORM strategy
func TableNameFromModel(db *gorm.DB, model any) string {
	value := reflect.ValueOf(model)
	if value.Kind() == reflect.Ptr && value.IsNil() {
		value = reflect.New(value.Type().Elem())
	}
	modelType := reflect.Indirect(value).Type()

	tableName := db.NamingStrategy.TableName(modelType.Name())
	modelValue := reflect.New(modelType)
	if tabler, ok := modelValue.Interface().(schema.Tabler); ok {
		tableName = tabler.TableName()
	}
	if tabler, ok := modelValue.Interface().(schema.TablerWithNamer); ok {
		tableName = tabler.TableName(db.NamingStrategy)
	}
	return tableName
}

// QuoteTo is a shortcut to db.QuoteTo
func QuoteTo(db *gorm.DB, s string) string {
	buf := &strings.Builder{}
	db.QuoteTo(buf, s)
	return buf.String()
}

// WithTxRetry runs fn inside a transaction and retries automatically
// on transient SQL errors like deadlocks or serialization failures.
// It works across MySQL, Postgres, and SQLite.
func WithTxRetry(ctx context.Context, db *gorm.DB, maxRetries int, retryMsg string, fn func(tx *gorm.DB) error) error {
	var err error
	baseDelay := 25 * time.Millisecond

	for attempt := 1; attempt <= maxRetries; attempt++ {
		err = db.WithContext(ctx).Transaction(func(tx *gorm.DB) error {
			return fn(tx)
		})

		if err == nil {
			return nil
		}

		lower := strings.ToLower(err.Error())
		retryable := strings.Contains(lower, "deadlock") ||
			strings.Contains(lower, "40001") || // SQLSTATE serialization
			strings.Contains(lower, "database is locked") ||
			strings.Contains(lower, "busy")

		if retryable && attempt < maxRetries {
			// exponential backoff with small jitter
			time.Sleep(baseDelay * time.Duration(1<<uint(attempt-1)))
			log.Logger(ctx).Warn("Retrying transaction after deadlock: " + retryMsg)
			continue
		}

		return err
	}

	return err
}
