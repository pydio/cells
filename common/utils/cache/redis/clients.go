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
	"context"
	"crypto/tls"
	"github.com/pydio/cells/v4/common/log"
	"github.com/pydio/cells/v4/common/utils/std"
	"go.uber.org/zap"
	"net/url"
	"time"

	"github.com/go-redis/redis/v8"
)

var (
	clients = make(map[string]*redis.Client)
)

func NewClient(ctx context.Context, u *url.URL, tc *tls.Config) (*redis.Client, error) {
	str := u.Redacted()
	cli, ok := clients[str]
	if ok {
		return cli, nil
	}

	pwd, _ := u.User.Password()
	oo := &redis.Options{
		Addr:     u.Host,
		Username: u.User.Username(),
		Password: pwd,
	}
	if tc != nil {
		oo.TLSConfig = tc
	}
	cli = redis.NewClient(oo)

	if err := std.Retry(ctx, func() error {
		if err := cli.Ping(ctx).Err(); err != nil {
			log.Logger(ctx).Warn("[redis] connection unavailable, retrying in 10s...", zap.Error(err))
			return err
		}

		return nil
	}, 10*time.Second, 10*time.Minute); err != nil {
		return nil, err
	}

	clients[str] = cli
	return cli, nil
}
