//go:build (!386 && ignore) || !arm
// +build !386,ignore !arm

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

package models

import (
	"github.com/yvasiyarov/php_session_decoder/php_serialize"

	"github.com/pydio/cells/v5/common/errors"
	json "github.com/pydio/cells/v5/common/utils/jsonx"
)

type phpMeta map[string]interface{}

type phpUsers map[string]phpMeta

type phpNodes map[string]phpUsers

type phpLocalMeta map[string]phpNodes

type PhpUserMeta struct {
	NodeName string
	UserName string
	Meta     map[string]interface{}
}

func UserMetasFromPhpData(serializedData []byte) (metas []*PhpUserMeta, outErr error) {

	defer func() {
		if e := recover(); e != nil {
			outErr = e.(error)
		}
	}()

	decoder := php_serialize.NewUnSerializer(string(serializedData))

	if phpValue, err := decoder.Decode(); err == nil {
		m := phpValueToMapString(phpValue)
		if ms, ok := m.(map[string]interface{}); ok {
			metas, outErr = Map2LocalMeta(ms)
		} else {
			outErr = errors.New("cannot cast phpValue")
		}
	} else {
		outErr = err
	}

	return
}

func Map2LocalMeta(m map[string]interface{}) (out []*PhpUserMeta, e error) {

	j, e := json.Marshal(m)
	if e != nil {
		return nil, e
	}

	var localMeta phpLocalMeta
	e = json.Unmarshal(j, &localMeta)
	if e != nil {
		return nil, e
	}

	for path, nodes := range localMeta {
		for _, users := range nodes {
			for plugin, metas := range users {
				if plugin == "users_meta" {
					out = append(out, &PhpUserMeta{
						NodeName: path,
						Meta:     metas,
					})
				}
			}
		}
	}

	return
}

func phpValueToMapString(obj interface{}) interface{} {
	out := make(map[string]interface{})
	if arr, ok := obj.(php_serialize.PhpArray); ok {
		for k, v := range arr {
			key := k.(string)
			out[key] = phpValueToMapString(v)
		}
		return out
	} else {
		return obj
	}
}
