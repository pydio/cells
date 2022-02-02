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

package viper

import (
	"strings"
	"time"

	"github.com/spf13/viper"

	"github.com/pydio/cells/v4/common/utils/configx"
)

type mem struct {
	viper *viper.Viper
}

func New(v *viper.Viper) configx.Entrypoint {
	return &mem{
		v,
	}
}

func (m *mem) Val(path ...string) configx.Values {
	return &values{
		m.viper,
		configx.StringToKeys(path...),
	}
}

func (m *mem) Get() configx.Value {
	m.Val("")
	return nil
}

func (m *mem) Set(data interface{}) error {
	m.viper.Set("", data)
	return nil
}

func (m *mem) Del() error {
	m.viper.Set("", nil)
	return nil
}

func (m *mem) Save(ctxUser, ctxMessage string) error {
	return nil
}

func (m *mem) Watch(path ...string) (configx.Receiver, error) {
	return nil, nil
}

type values struct {
	viper *viper.Viper
	path  []string
}

func (v *values) Get() configx.Value {
	return v
}
func (v *values) Set(data interface{}) error {
	v.viper.Set(strings.Join(v.path, "."), data)

	return nil
}
func (v *values) Del() error {
	v.viper.Set(strings.Join(v.path, "."), nil)

	return nil
}
func (v *values) Val(path ...string) configx.Values {
	return &values{
		v.viper,
		append(v.path, path...),
	}
}
func (v *values) Default(i interface{}) configx.Value {
	return v
}
func (v *values) Bool() bool {
	return v.viper.GetBool(strings.Join(v.path, "."))
}
func (v *values) Int() int {
	return v.viper.GetInt(strings.Join(v.path, "."))
}
func (v *values) Int64() int64 {
	return v.viper.GetInt64(strings.Join(v.path, "."))
}
func (v *values) Bytes() []byte {
	return []byte(v.viper.GetString(strings.Join(v.path, ".")))
}
func (v *values) Duration() time.Duration {
	return v.viper.GetDuration(strings.Join(v.path, "."))
}
func (v *values) String() string {
	return v.viper.GetString(strings.Join(v.path, "."))
}
func (v *values) StringMap() map[string]string {
	return v.viper.GetStringMapString(strings.Join(v.path, "."))
}
func (v *values) StringArray() []string {
	return v.viper.GetStringSlice(strings.Join(v.path, "."))
}
func (v *values) Slice() []interface{} {
	return v.viper.Get(strings.Join(v.path, ".")).([]interface{})
}
func (v *values) Map() map[string]interface{} {
	return v.viper.GetStringMap(strings.Join(v.path, "."))
}
func (v *values) Scan(i interface{}) error {
	ii := v.viper.Get(strings.Join(v.path, "."))

	i = ii

	return nil
}

/*
type receiver struct {
	w config.Watcher
}

func (r *receiver) Next() (configx.Values, error) {
	v, err := r.w.Next()
	if err != nil {
		return nil, err
	}

	var i interface{}
	if err := v.Scan(&i); err != nil {
		return nil, err
	}

	vv := configx.NewFrom(i)

	return vv, nil
}

func (r *receiver) Stop() {
	r.w.Stop()
}*/
