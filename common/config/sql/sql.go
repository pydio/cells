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
	"bytes"
	"errors"

	migrate "github.com/rubenv/sql-migrate"

	"github.com/pydio/cells/v4/common/dao"
	"github.com/pydio/cells/v4/common/sql"
	"github.com/pydio/cells/v4/common/utils/configx"
	json "github.com/pydio/cells/v4/common/utils/jsonx"
	"github.com/pydio/cells/v4/common/utils/statics"
)

type SQL struct {
	dao      dao.DAO
	config   configx.Values
	watchers []*receiver
}

func New(driver string, dsn string, prefix string) (configx.Entrypoint, error) {
	var d dao.DAO
	switch driver {
	case "mysql":
		c, er := sql.NewDAO(driver, dsn, prefix)
		if er != nil {
			return nil, er
		}
		d = NewDAO(c)
	case "sqlite3":
		c, er := sql.NewDAO(driver, dsn, prefix)
		if er != nil {
			return nil, er
		}
		d = NewDAO(c)
	}

	dc := configx.New()
	if er := dc.Val("prepare").Set(true); er != nil {
		return nil, er
	}

	if er := d.Init(dc); er != nil {
		return nil, er
	}

	return &SQL{
		dao: d,
	}, nil
}

// Init handler for the SQL DAO
func (s *SQL) Init(options configx.Values) error {

	migrations := &sql.FSMigrationSource{
		Box:         statics.AsFS(migrationsFS, "migrations"),
		Dir:         "./" + s.dao.Driver(),
		TablePrefix: s.dao.Prefix(),
	}

	sqldao := s.dao.(sql.DAO)

	_, err := sql.ExecMigration(sqldao.DB(), s.dao.Driver(), migrations, migrate.Up, s.dao.Prefix())
	if err != nil {
		return err
	}

	// Preparing the db statements
	if options.Val("prepare").Default(true).Bool() {
		for key, query := range queries {
			if err := sqldao.Prepare(key, query); err != nil {
				return err
			}
		}
	}

	return nil
}

func (s *SQL) Val(path ...string) configx.Values {
	if s.config == nil {
		s.Get()
	}
	return &wrappedConfig{s.config.Val(path...), s}
}

func (s *SQL) Get() configx.Value {
	dao := s.dao.(DAO)

	v := configx.New(configx.WithJSON())

	b, err := dao.Get()
	if err != nil {
		v.Set(map[string]interface{}{})
	}

	v.Set(b)

	s.config = v

	return v
}

func (s *SQL) Set(data interface{}) error {
	dao := s.dao.(DAO)

	b, err := json.Marshal(data)
	if err != nil {
		return err
	}

	if err := dao.Set(b); err != nil {
		return err
	}

	v := configx.New(configx.WithJSON())
	v.Set(b)

	s.config = v

	s.update()

	return nil
}

func (s *SQL) update() {
	for _, w := range s.watchers {
		v := s.Val(w.path...).Bytes()
		select {
		case w.updates <- v:
		default:
		}
	}
}

func (s *SQL) Del() error {
	return s.Set(nil)
}

func (s *SQL) Save(ctxUser, ctxMessage string) error {
	return nil
}

func (s *SQL) Watch(path ...string) (configx.Receiver, error) {
	r := &receiver{
		exit:    make(chan bool),
		path:    path,
		value:   s.Val(path...).Bytes(),
		updates: make(chan []byte),
	}

	s.watchers = append(s.watchers, r)

	return r, nil
}

type receiver struct {
	exit    chan bool
	path    []string
	value   []byte
	updates chan []byte
}

func (r *receiver) Next() (configx.Values, error) {
	for {
		select {
		case <-r.exit:
			return nil, errors.New("watcher stopped")
		case v := <-r.updates:
			if len(r.value) == 0 && len(v) == 0 {
				continue
			}

			if bytes.Equal(r.value, v) {
				continue
			}

			r.value = v

			ret := configx.New(configx.WithJSON())
			if err := ret.Set(v); err != nil {
				return nil, err
			}
			return ret, nil
		}
	}
}

func (r *receiver) Stop() {
	select {
	case <-r.exit:
	default:
		close(r.exit)
	}
}

type wrappedConfig struct {
	configx.Values
	s *SQL
}

func (w *wrappedConfig) Set(val interface{}) error {
	err := w.Values.Set(val)
	if err != nil {
		return err
	}

	return w.s.Set(w.Values.Val("#").Map())
}
