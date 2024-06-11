/*
 * Copyright (c) 2019-2022. Abstrium SAS <team (at) pydio.com>
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
	"github.com/pydio/cells/v4/common/telemetry/log"
	"strings"
	"time"
)

var defaultMaxRetries = 3

type RetryTxOpts struct {
	*sql.TxOptions
	MaxRetries int
}

// RetryTxOnDeadlock creates a transaction and automatically retries it *if error is '1213: Deadlock found'*
func RetryTxOnDeadlock(ctx context.Context, db *sql.DB, opts *RetryTxOpts, f func(context.Context, *sql.Tx) error) error {

	var erTx error
	attempt := 0
	if opts.MaxRetries == 0 {
		opts.MaxRetries = defaultMaxRetries
	}

	for {
		tx, er := db.BeginTx(ctx, opts.TxOptions)
		if er != nil {
			return er
		}
		if erTx = f(ctx, tx); erTx == nil {
			return tx.Commit()
		} else if strings.Contains(erTx.Error(), "Error 1213: Deadlock found when trying to get lock") && attempt <= opts.MaxRetries {
			log.Logger(ctx).Warn("Deadlock found when trying to apply transaction, rollback and retry in 500ms")
			_ = tx.Rollback()
			<-time.After(time.Duration(100*(attempt+1)) * time.Millisecond)
			attempt++
			continue
		} else {
			_ = tx.Rollback()
			return erTx
		}
	}

}
