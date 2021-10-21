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

package wrappers

import (
	"context"
	"fmt"

	"github.com/micro/go-micro/client"
)

func WithCallsLogger(c client.Client) client.Client {
	return &callsLogger{w: c}
}

type callsLogger struct {
	w client.Client
}

func (c *callsLogger) logRequest(callType string, req client.Request) {
	fmt.Printf("%s\t%s\t%s\n", callType, req.Service(), req.Method())
}

func (c *callsLogger) Init(option ...client.Option) error {
	return c.w.Init(option...)
}

func (c *callsLogger) Options() client.Options {
	return c.w.Options()
}

func (c *callsLogger) NewPublication(topic string, msg interface{}) client.Publication {
	return c.w.NewPublication(topic, msg)
}

func (c *callsLogger) NewRequest(service, method string, req interface{}, reqOpts ...client.RequestOption) client.Request {
	return c.w.NewRequest(service, method, req, reqOpts...)
}

func (c *callsLogger) NewProtoRequest(service, method string, req interface{}, reqOpts ...client.RequestOption) client.Request {
	return c.w.NewProtoRequest(service, method, req, reqOpts...)
}

func (c *callsLogger) NewJsonRequest(service, method string, req interface{}, reqOpts ...client.RequestOption) client.Request {
	return c.w.NewJsonRequest(service, method, req, reqOpts...)
}

func (c *callsLogger) Call(ctx context.Context, req client.Request, rsp interface{}, opts ...client.CallOption) error {
	c.logRequest("Call", req)
	return c.w.Call(ctx, req, rsp, opts...)
}

func (c *callsLogger) CallRemote(ctx context.Context, addr string, req client.Request, rsp interface{}, opts ...client.CallOption) error {
	return c.w.CallRemote(ctx, addr, req, rsp, opts...)
}

func (c *callsLogger) Stream(ctx context.Context, req client.Request, opts ...client.CallOption) (client.Streamer, error) {
	c.logRequest("Stream", req)
	return c.w.Stream(ctx, req, opts...)
}

func (c *callsLogger) StreamRemote(ctx context.Context, addr string, req client.Request, opts ...client.CallOption) (client.Streamer, error) {
	return c.w.StreamRemote(ctx, addr, req, opts...)
}

func (c *callsLogger) Publish(ctx context.Context, p client.Publication, opts ...client.PublishOption) error {
	return c.w.Publish(ctx, p, opts...)
}

func (c *callsLogger) String() string {
	return c.w.String()
}
