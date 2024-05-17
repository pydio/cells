//go:build exclude
// +build exclude

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

package bleve

import (
	"context"
	"net/url"
	"strconv"
	"strings"

	"github.com/pydio/cells/v4/common/dao"
)

const DefaultRotationSize = int64(200 * 1024 * 1024)

const DefaultBatchSize = 2000

type BleveConfig struct {
	BlevePath    string
	MappingName  string
	RotationSize int64
	BatchSize    int64
}

func (b *BleveConfig) Open(ctx context.Context, dsn string) (dao.Conn, error) {
	b.BlevePath = dsn
	b.MappingName = "docs"
	b.RotationSize = DefaultRotationSize
	b.BatchSize = DefaultBatchSize
	if strings.Contains(dsn, "?") {
		parts := strings.Split(dsn, "?")
		b.BlevePath = parts[0]
		if values, er := url.ParseQuery(parts[1]); er == nil {
			if rs := values.Get("rotationSize"); rs != "" {
				if prs, e := strconv.ParseInt(rs, 10, 64); e == nil {
					b.RotationSize = prs
				}
			}
			if bs := values.Get("batchSize"); bs != "" {
				if pbs, e := strconv.ParseInt(bs, 10, 64); e == nil {
					b.BatchSize = pbs
				}
			}
			if mn := values.Get("mapping"); mn != "" {
				b.MappingName = mn
			}
		}
	}
	return b, nil
}

func (b *BleveConfig) GetConn(ctx context.Context) (dao.Conn, error) {
	return b, nil
}

func (b *BleveConfig) SetMaxConnectionsForWeight(_ int) {}
