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

// Package sql provides tools and DAOs for speaking SQL as well as managing tables migrations
package sql

import (
	"context"
	"database/sql"
	"fmt"
	"os"
	"strings"
	"sync"
	"sync/atomic"
	"time"

	"github.com/fatih/structs"
	"github.com/pydio/cells/v4/common/registry"
	"github.com/pydio/cells/v4/common/registry/util"

	"github.com/pydio/cells/v4/common/dao"
	"github.com/pydio/cells/v4/common/utils/configx"
)

var (
	DefaultConnectionTimeout = 30 * time.Second
	LongConnectionTimeout    = 10 * time.Minute
	ErrNoRows                = sql.ErrNoRows
)

func init() {
	if dc := os.Getenv("CELLS_SQL_DEFAULT_CONN"); dc != "" {
		if ddc, e := time.ParseDuration(dc); e == nil {
			DefaultConnectionTimeout = ddc
		}
	}

	if dc := os.Getenv("CELLS_SQL_LONG_CONN"); dc != "" {
		if ddc, e := time.ParseDuration(dc); e == nil {
			LongConnectionTimeout = ddc
		}
	}

}

// DAO interface definition
type DAO interface {
	dao.DAO

	DB() *sql.DB
	Version() (string, error)
	Prepare(string, interface{}) error
	GetStmt(string, ...interface{}) (Stmt, error)
	GetStmtWithArgs(string, ...interface{}) (Stmt, []interface{}, error)
	UseExclusion()
	Lock()
	Unlock()

	// Helper functions for expressions that can differ from one dao to another
	Concat(...string) string
	Hash(...string) string
	HashParent(string, ...string) string
}

type Stmt interface {
	Close() error
	GetSQLStmt() *sql.Stmt
	Exec(...interface{}) (sql.Result, error)
	ExecContext(context.Context, ...interface{}) (sql.Result, error)
	Query(...interface{}) (*sql.Rows, error)
	LongQuery(...interface{}) (*sql.Rows, context.CancelFunc, error)
	QueryContext(context.Context, ...interface{}) (*sql.Rows, error)
	QueryRow(...interface{}) *sql.Row
	QueryRowContext(context.Context, ...interface{}) *sql.Row
}

// Handler for the main functions of the DAO
type Handler struct {
	dao.DAO
	helper Helper

	stmts         map[string]string
	ifuncs        map[string]func(DAO, ...interface{}) string // More generic version than func(DAO, ...string) below
	funcs         map[string]func(DAO, ...string) string      // Queries that need to be run before we get a statement
	funcsWithArgs map[string]func(DAO, ...string) (string, []interface{})

	prepared     map[string]Stmt
	preparedLock *sync.RWMutex

	mu       atomic.Value
	replacer *strings.Replacer

	runtime context.Context
}

func NewDAO(ctx context.Context, driver string, dsn string, prefix string) (dao.DAO, error) {
	conn, err := dao.NewConn(ctx, driver, dsn)
	if err != nil {
		return nil, err
	}
	helper, err := newHelper(driver)
	if err != nil {
		return nil, err
	}
	// Special case for sqliteHelper, we use a mutex to simulate locking as sqliteHelper's locking is not quite up to the task
	var mu atomic.Value
	if driver == "sqlite3" {
		mu.Store(&sync.Mutex{})
	}
	return &Handler{
		DAO:           dao.AbstractDAO(conn, driver, dsn, prefix),
		helper:        helper,
		stmts:         make(map[string]string),
		ifuncs:        make(map[string]func(DAO, ...interface{}) string),
		funcs:         make(map[string]func(DAO, ...string) string),
		funcsWithArgs: make(map[string]func(DAO, ...string) (string, []interface{})),
		prepared:      make(map[string]Stmt),
		preparedLock:  new(sync.RWMutex),
		replacer:      strings.NewReplacer("%%PREFIX%%", prefix, "%PREFIX%", prefix),
		mu:            mu,
		runtime:       ctx,
	}, nil
}

func (h *Handler) Init(ctx context.Context, c configx.Values) error {
	return nil
}

func (h *Handler) Stats() map[string]interface{} {
	return structs.Map(h.DB().Stats())
}

func (h *Handler) WatchStatus() (registry.StatusWatcher, error) {

	//w := util.NewIntervalStatusWatcher(h, 30*time.Second, func() map[string]interface{} {
	//	return h.Stats()
	//})

	w := util.NewIntervalStatusWatcher(h, 30*time.Second, func() (registry.Item, bool) {
		h.DB().Ping()
		return nil, false
	})
	return w, nil
}

func (h *Handler) As(i interface{}) bool {
	if ss, ok := i.(*registry.StatusReporter); ok {
		*ss = h
		return true
	}
	return h.DAO.As(i)
}

// DB returns the sql DB object
func (h *Handler) DB() *sql.DB {
	if c, e := h.GetConn(h.runtime); e == nil && c != nil {
		return c.(*sql.DB)
	}
	return nil
}

// Version returns mysql version
func (h *Handler) Version() (string, error) {
	// Here we check the version of mysql and the default charset
	var version string
	err := h.DB().QueryRow("SELECT VERSION()").Scan(&version)
	switch {
	case err == sql.ErrNoRows:
		return "", fmt.Errorf("Could not retrieve mysql version")
	case err != nil:
		return "", err
	}

	return version, nil
}

// Prepare the statements that can be used by the DAO
func (h *Handler) Prepare(key string, query interface{}) error {
	switch v := query.(type) {
	case func(DAO, ...interface{}) string:
		h.ifuncs[key] = v
	case func(DAO, ...string) string:
		h.funcs[key] = v
	case func(DAO, ...string) (string, []interface{}):
		h.funcsWithArgs[key] = v
	case string:
		v = h.replacer.Replace(v)
		h.stmts[key] = v
	}

	return nil
}

func (h *Handler) addStmt(query string) (Stmt, error) {
	stmt, err := h.DB().Prepare(query)
	if err != nil {
		return nil, err
	}

	stmtWt := &stmtWithTimeout{stmt}

	if h.Driver() == "sqlite3" {
		// We don't keep statements open with sqlite3
		return stmtWt, nil
	}

	h.preparedLock.Lock()
	defer h.preparedLock.Unlock()

	h.prepared[query] = stmtWt
	return stmtWt, nil
}

func (h *Handler) readStmt(query string) Stmt {
	h.preparedLock.RLock()
	defer h.preparedLock.RUnlock()

	if stmt, ok := h.prepared[query]; ok {
		return stmt
	}

	return nil
}

func (h *Handler) getStmt(query string) (Stmt, error) {
	fmt.Println(query)
	if stmt := h.readStmt(query); stmt != nil {
		return stmt, nil
	}

	return h.addStmt(query)
}

// GetStmt returns a list of all statements used by the dao
func (h *Handler) GetStmt(key string, args ...interface{}) (Stmt, error) {

	if v, ok := h.stmts[key]; ok {
		return h.getStmt(v)
	}
	if v, ok := h.ifuncs[key]; ok {
		query := v(h, args...)
		query = h.replacer.Replace(query)
		return h.getStmt(query)
	}
	if v, ok := h.funcs[key]; ok {
		var sArgs []string
		for _, s := range args {
			sArgs = append(sArgs, fmt.Sprintf("%v", s))
		}
		query := v(h, sArgs...)
		query = h.replacer.Replace(query)

		return h.getStmt(query)
	}
	return nil, fmt.Errorf("cannot find statement for key %s", key)
}

// GetStmtWithArgs returns a list of all statements used by the dao
func (h *Handler) GetStmtWithArgs(key string, params ...interface{}) (Stmt, []interface{}, error) {
	if v, ok := h.funcsWithArgs[key]; ok {
		var sParams []string
		for _, s := range params {
			sParams = append(sParams, fmt.Sprintf("%v", s))
		}
		query, args := v(h, sParams...)
		query = h.replacer.Replace(query)
		stmt, err := h.getStmt(query)
		return stmt, args, err
	}

	return nil, nil, fmt.Errorf("cannot find query for " + key)
}

func (h *Handler) UseExclusion() {
}

func (h *Handler) Lock() {
	if current, ok := h.mu.Load().(*sync.Mutex); ok {
		current.Lock()
	}
}

func (h *Handler) Unlock() {
	if current, ok := h.mu.Load().(*sync.Mutex); ok {
		current.Unlock()
	}
}

func (h *Handler) Concat(s ...string) string {
	return h.helper.Concat(s...)
}

func (h *Handler) Hash(s ...string) string {
	return h.helper.Hash(s...)
}

func (h *Handler) HashParent(name string, mpath ...string) string {
	return h.helper.HashParent(name, mpath...)
}

type stmtWithTimeout struct {
	*sql.Stmt
}

func (s *stmtWithTimeout) Close() error {
	return s.Stmt.Close()
}

func (s *stmtWithTimeout) GetSQLStmt() *sql.Stmt {
	return s.Stmt
}

func (s *stmtWithTimeout) Exec(args ...interface{}) (sql.Result, error) {
	ctx, _ := context.WithTimeout(context.Background(), DefaultConnectionTimeout)
	return s.Stmt.ExecContext(ctx, args...)
}

func (s *stmtWithTimeout) Query(args ...interface{}) (*sql.Rows, error) {
	ctx, _ := context.WithTimeout(context.Background(), DefaultConnectionTimeout)
	return s.Stmt.QueryContext(ctx, args...)
}

func (s *stmtWithTimeout) LongQuery(args ...interface{}) (*sql.Rows, context.CancelFunc, error) {
	ctx, ca := context.WithTimeout(context.Background(), LongConnectionTimeout)
	rows, e := s.Stmt.QueryContext(ctx, args...)
	return rows, ca, e
}

func (s *stmtWithTimeout) QueryRow(args ...interface{}) *sql.Row {
	ctx, _ := context.WithTimeout(context.Background(), DefaultConnectionTimeout)
	return s.Stmt.QueryRowContext(ctx, args...)
}
