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

package redis

import (
	"net/url"

	"github.com/go-redis/redis/v8"
)

var (
	clients = make(map[string]*redis.Client)
)

func NewClient(u *url.URL) *redis.Client {
	str := u.User.String() + "@" + u.Host
	cli, ok := clients[str]
	if ok {
		return cli
	}

	pwd, _ := u.User.Password()
	cli = redis.NewClient(&redis.Options{
		Addr:     u.Host,
		Username: u.User.Username(),
		Password: pwd,
	})

	clients[str] = cli
	return cli
}
