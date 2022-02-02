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
	"bytes"
	"fmt"
	"github.com/fsnotify/fsnotify"
	"github.com/spf13/viper"
	"testing"
	// . "github.com/smartystreets/goconvey/convey"
)

var (
	data []byte
)

func TestConfig(t *testing.T) {
	v := viper.New()
	v.SetConfigType("JSON")

	c := New(v)

	var jsonExample = `{
		"host": {
		"address": "localhost",
			"ports": [
				5799,
				6029
			]
		},
		"datastore": {
			"metric": {
				"host": "127.0.0.1",
				"port": 3099
			},
			"warehouse": {
				"host": "198.0.0.1",
				"port": 2112
			}
		}
    }`

	v.ReadConfig(bytes.NewBuffer([]byte(jsonExample)))
	v.OnConfigChange(func(e fsnotify.Event) {
		fmt.Println("Change is ? ", e)
	})

	addr := c.Val("host/address")
	fmt.Println(addr.String())

	addr.Set("0.0.0.0")

	fmt.Println(addr.String())
}
