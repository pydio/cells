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

// Package bleve provides tools for using Bolt as a standard persistence layer for services.
package bleve

import (
	"context"
	"fmt"
	"github.com/pydio/cells/v4/common/conn"
	"github.com/pydio/cells/v4/common/registry/util"
	"net/url"
	"strconv"
	"strings"

	"github.com/pydio/cells/v4/common/dao"
	"github.com/pydio/cells/v4/common/utils/configx"
)

const Driver = "bleve"

const DefaultRotationSize = int64(200 * 1024 * 1024)
const DefaultBatchSize = 2000

type BleveConfig struct {
	BlevePath    string
	MappingName  string
	RotationSize int64
	BatchSize    int64
}

func init() {
	dao.RegisterDAODriver(Driver, NewDAO, func(ctx context.Context, driver, dsn string) conn.Conn {
		mgr, ok := dao.GetManager(ctx)
		if !ok {
			//return nil, errors.New("manager not found")
			return nil
		}

		conf, err := DSNToConfig(dsn)
		if err != nil {
			return nil
		}
		conf.Val("scheme").Set(driver)

		myconn, err := mgr.GetConnection(conf)
		if err != nil {
			return nil
		}

		m := map[string]string{}
		addrItem := util.CreateAddress(myconn.Addr(), m)
		mgr.GetRegistry().Register(addrItem)

		return myconn
	})
	dao.RegisterIndexerDriver(Driver, NewIndexer)
}

// DAO defines the functions specific to the boltdb dao
type DAO interface {
	dao.DAO
	BleveConfig(context.Context) (*BleveConfig, error)
}

// Handler for the main functions of the DAO
type Handler struct {
	config *BleveConfig
	dao.DAO
}

// NewDAO creates a new handler for the boltdb dao
func NewDAO(ctx context.Context, driver string, dsn string, prefix string, c conn.Conn) (dao.DAO, error) {
	b := &BleveConfig{
		BlevePath:    dsn,
		MappingName:  "docs",
		RotationSize: DefaultRotationSize,
		BatchSize:    DefaultBatchSize,
	}
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

	return &Handler{
		config: b,
		DAO:    dao.AbstractDAO(c, driver, dsn, prefix),
	}, nil
}

// Init initialises the handler
func (h *Handler) Init(context.Context, configx.Values) error {
	return nil
}

// BleveConfig returns the folder to lookup for bleve index
func (h *Handler) BleveConfig(ctx context.Context) (*BleveConfig, error) {
	if h == nil {
		return nil, fmt.Errorf("uninitialized handler")
	}

	return h.config, nil
}

// LocalAccess overrides DAO
func (h *Handler) LocalAccess() bool {
	return true
}
