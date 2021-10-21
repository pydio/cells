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

package service

import (
	"context"
	"time"

	micro "github.com/micro/go-micro"
	"github.com/micro/go-micro/client"
)

func backOffStraightAway(ctx context.Context, req client.Request, attempts int) (time.Duration, error) {
	return time.Duration(0), nil
}

type backoffWrapper struct {
	client.Client
}

func (c *backoffWrapper) Call(ctx context.Context, req client.Request, rsp interface{}, opts ...client.CallOption) error {

	opts = append(opts, client.WithBackoff(backOffStraightAway))

	return c.Client.Call(ctx, req, rsp, opts...)
}

// NewBackoffClientWrapper wraps a client with a backoff option
func NewBackoffClientWrapper() client.Wrapper {
	return func(c client.Client) client.Client {
		return &backoffWrapper{c}
	}
}

func newBackoffer(service micro.Service) {

	var options []micro.Option

	options = append(options, micro.WrapClient(NewBackoffClientWrapper()))

	service.Init(options...)
}
