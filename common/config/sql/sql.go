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
	"context"
	"errors"
	"fmt"
	"net/url"
	"os"
	"strconv"
	"strings"
	"time"

	"gorm.io/gorm"

	"github.com/pydio/cells/v5/common/config"
	"github.com/pydio/cells/v5/common/utils/configx"
	json "github.com/pydio/cells/v5/common/utils/jsonx"
	"github.com/pydio/cells/v5/common/utils/openurl"
)

var (
	schemes          = []string{"mysql", "sqlite3"}
	errClosedChannel = errors.New("channel is closed")
)

type URLOpener struct{}

const timeout = 500 * time.Millisecond

func init() {
	o := &URLOpener{}
	for _, scheme := range schemes {
		config.DefaultURLMux().Register(scheme, o)
	}
}

func (o *URLOpener) Open(ctx context.Context, urlstr string) (config.Store, error) {
	u, err := url.Parse(urlstr)
	if err != nil {
		return nil, err
	}

	var opts []configx.Option

	encode := u.Query().Get("encode")
	switch encode {
	case "string":
		opts = append(opts, configx.WithString())
	case "yaml":
		opts = append(opts, configx.WithYAML())
	case "json":
		opts = append(opts, configx.WithJSON())
	default:
		opts = append(opts, configx.WithJSON())
	}

	if data := u.Query().Get("data"); data != "" {
		//unescapedData, err := url.QueryUnescape(data)
		//if err != nil {
		//	return nil, err
		//}
		opts = append(opts, configx.WithInitData([]byte(data)))
	}

	driver := u.Scheme
	dsn := u.Host
	prefix := u.Query().Get("prefix")

	switch u.Scheme {
	case "mysql":
		driver, dsn, prefix = openurl.URLToDSN(u)
	}

	store, err := New(ctx, driver, dsn, prefix)
	if err != nil {
		fmt.Println("And the error is ? ", err)
	}

	envPrefix := u.Query().Get("env")
	if envPrefix != "" {
		env := os.Environ()
		for _, v := range env {
			if strings.HasPrefix(v, envPrefix) {
				vv := strings.SplitN(v, "=", 2)
				if len(vv) == 2 {
					k := strings.TrimPrefix(vv[0], envPrefix)
					k = strings.ReplaceAll(k, "_", "/")
					k = strings.ToLower(k)

					var m map[string]interface{}
					msg, err := strconv.Unquote(vv[1])
					if err != nil {
						msg = vv[1]
					}

					json.Unmarshal([]byte(msg), &m)
					store.Val(k).Set(m)
				}
			}
		}
	}

	return store, nil
}

type SQL struct {
	dao      DAO
	config   configx.Values
	watchers []*receiver
}

func New(ctx context.Context, driver string, dsn string, prefix string) (config.Store, error) {
	var db *gorm.DB

	//o, er := storage.Get(ctx, &db)
	//if o && er != nil {
	//	return nil, er
	//}

	d := NewDAO(db)

	return &SQL{
		dao: d,
	}, nil
}

func (s *SQL) Context(ctx context.Context) configx.Values {
	return s.config.Context(ctx)
}

func (s *SQL) Options() *configx.Options {
	return s.config.Options()
}

func (s *SQL) Key() []string {
	return s.config.Key()
}

func (s *SQL) Default(def any) configx.Values {
	return s.config.Default(def)
}

func (s *SQL) Val(path ...string) configx.Values {
	if s.config == nil {
		s.Get()
	}
	return &wrappedConfig{s.config.Val(path...), s}
}

func (s *SQL) Get(option ...configx.WalkOption) any {
	dao := s.dao.(DAO)

	v := configx.New(configx.WithJSON())

	b, err := dao.Get(context.TODO())
	if err != nil {
		v.Set(map[string]interface{}{})
	}

	v.Set(b)

	s.config = v

	return v.Get(option...)
}

func (s *SQL) Set(value interface{}) error {
	dao := s.dao.(DAO)

	b, err := json.Marshal(value)
	if err != nil {
		return err
	}

	if err := dao.Set(context.TODO(), b); err != nil {
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

func (s *SQL) Watch(oo ...configx.WatchOption) (configx.Receiver, error) {
	opts := &configx.WatchOptions{}
	for _, o := range oo {
		o(opts)
	}
	r := &receiver{
		exit:    make(chan bool),
		path:    opts.Path,
		value:   s.Val(opts.Path...).Bytes(),
		updates: make(chan []byte),
	}

	s.watchers = append(s.watchers, r)

	return r, nil
}

func (s *SQL) As(out any) bool { return false }

func (s *SQL) Close(_ context.Context) error {
	return nil
}

func (s *SQL) Done() <-chan struct{} {
	// Never returns
	return nil
}

func (s *SQL) Lock() {
}

func (s *SQL) Unlock() {
}

type receiver struct {
	exit    chan bool
	path    []string
	value   []byte
	updates chan []byte
}

func (r *receiver) Next() (interface{}, error) {
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

func (w *wrappedConfig) Set(value interface{}) error {
	err := w.Values.Set(value)
	if err != nil {
		return err
	}

	return w.s.Set(w.Values.Val("#").Map())
}
