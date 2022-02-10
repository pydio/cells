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

// Package BoltDB provides tools for using Bolt as a standard persistence layer for services
package boltdb

import (
	"fmt"
	"os"
	"path/filepath"
	"strings"
	"time"

	bolt "go.etcd.io/bbolt"

	"github.com/pydio/cells/v4/common/dao"
	"github.com/pydio/cells/v4/common/utils/configx"
)

const Driver = "boltdb"

func init() {
	dao.RegisterDAODriver(Driver, NewDAO, func(driver, dsn string) dao.ConnDriver {
		return &boltdb{}
	})
}

// DAO defines the functions specific to the boltdb dao
type DAO interface {
	dao.DAO
	DB() *bolt.DB
	Compact(opts map[string]interface{}) (int64, int64, error)
}

// Handler for the main functions of the DAO
type Handler struct {
	dao.DAO
}

// NewDAO creates a new handler for the boltdb dao
func NewDAO(driver string, dsn string, prefix string) (dao.DAO, error) {
	conn, err := dao.NewConn(driver, dsn)
	if err != nil {
		return nil, err
	}
	return &Handler{
		DAO: dao.NewDAO(conn, driver, prefix),
	}, nil
}

// Init initialises the handler
func (h *Handler) Init(configx.Values) error {
	return nil
}

// DB returns the bolt DB object
func (h *Handler) DB() *bolt.DB {
	if h == nil {
		return nil
	}

	if conn := h.GetConn(); conn != nil {
		return conn.(*bolt.DB)
	}
	return nil
}

// Compact makes a copy of the current DB and replace it as a connection
func (h *Handler) Compact(opts map[string]interface{}) (old int64, new int64, err error) {
	db := h.DB()
	p := db.Path()
	if st, e := os.Stat(p); e == nil {
		old = st.Size()
	}
	dir, base := filepath.Split(p)
	ext := filepath.Ext(base)
	base = strings.TrimSuffix(base, ext)

	copyPath := filepath.Join(dir, base+"-compact-copy"+ext)
	copyDB, e := bolt.Open(copyPath, 0600, &bolt.Options{Timeout: 5 * time.Second})
	if e != nil {
		return 0, 0, e
	}
	if e := copyDB.Update(func(txW *bolt.Tx) error {
		return db.View(func(txR *bolt.Tx) error {
			return txR.ForEach(func(name []byte, b *bolt.Bucket) error {
				bW, e := txW.CreateBucketIfNotExists(name)
				if e != nil {
					return e
				}
				return copyValuesOrBucket(bW, b)
			})
		})
	}); e != nil {
		copyDB.Close()
		os.Remove(copyPath)
		return 0, 0, e
	}
	copyDB.Close()

	if e := h.CloseConn(); e != nil {
		return 0, 0, e
	}
	bakPath := filepath.Join(dir, fmt.Sprintf("%s-%d%s", base, time.Now().Unix(), ext))
	if er := os.Rename(p, bakPath); er != nil {
		return 0, 0, er
	}
	if er := os.Rename(copyPath, p); er != nil {
		return 0, 0, er
	}
	if copyDB, e = bolt.Open(p, 0600, &bolt.Options{Timeout: 5 * time.Second}); e != nil {
		return 0, 0, e
	}
	h.SetConn(copyDB)
	if opts != nil {
		if clear, ok := opts["ClearBackup"]; ok {
			if c, o := clear.(bool); o && c {
				if er := os.Remove(bakPath); er != nil {
					err = er
				}
			}
		}
	}
	if st, e := os.Stat(p); e == nil {
		new = st.Size()
	}
	return
}

func copyValuesOrBucket(bW, bR *bolt.Bucket) error {
	return bR.ForEach(func(k, v []byte) error {
		if v == nil {
			newBW, e := bW.CreateBucketIfNotExists(k)
			if e != nil {
				return e
			}
			newBR := bR.Bucket(k)
			newBW.SetSequence(newBR.Sequence())
			return copyValuesOrBucket(newBW, newBR)
		} else {
			return bW.Put(k, v)
		}
	})
}
