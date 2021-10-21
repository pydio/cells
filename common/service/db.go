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

	micro "github.com/micro/go-micro"
	"github.com/micro/go-micro/client"
	"github.com/micro/go-micro/server"
	"go.uber.org/zap"

	"github.com/pydio/cells/common/dao"
	"github.com/pydio/cells/common/log"
	servicecontext "github.com/pydio/cells/common/service/context"
)

func newDBProvider(service micro.Service) error {
	var options []micro.Option

	// Starting DB Connection for the service
	options = append(options, micro.BeforeStart(func() error {
		ctx := service.Options().Context
		cfg := servicecontext.GetConfig(ctx)

		d := servicecontext.GetDAO(ctx)

		if d == nil {
			return nil
		}

		if err := d.Init(cfg); err != nil {
			log.Logger(ctx).Error("Failed to init DB provider", zap.Error(err))
			return err
		}

		options = append(options, micro.WrapClient(NewDAOClientWrapper(d)))
		options = append(options, micro.WrapHandler(NewDAOHandlerWrapper(d)))
		options = append(options, micro.WrapSubscriber(NewDAOSubscriberWrapper(d)))

		service.Init(options...)

		return nil
	}))

	service.Init(options...)

	return nil
}

type daoWrapper struct {
	dao dao.DAO
	client.Client
}

func (c *daoWrapper) Call(ctx context.Context, req client.Request, rsp interface{}, opts ...client.CallOption) error {
	ctx = servicecontext.WithDAO(ctx, c.dao)
	return c.Client.Call(ctx, req, rsp, opts...)
}

// NewDAOClientWrapper wraps a db connection so it can be accessed by subsequent client wrappers.
func NewDAOClientWrapper(v dao.DAO) client.Wrapper {
	return func(c client.Client) client.Client {
		return &daoWrapper{v, c}
	}
}

// NewDAOHandlerWrapper wraps a db connection within the handler so it can be accessed by the handler itself.
func NewDAOHandlerWrapper(val dao.DAO) server.HandlerWrapper {
	return func(h server.HandlerFunc) server.HandlerFunc {
		return func(ctx context.Context, req server.Request, rsp interface{}) error {
			ctx = servicecontext.WithDAO(ctx, val)
			e := h(ctx, req, rsp)
			e2, filtered := dao.FilterDAOErrors(e)
			if filtered {
				log.Logger(ctx).Error("Filtered Error", zap.Error(e))
			}
			return e2
		}
	}
}

// NewDAOSubscriberWrapper wraps a db connection for each subscriber
func NewDAOSubscriberWrapper(val dao.DAO) server.SubscriberWrapper {
	return func(subscriberFunc server.SubscriberFunc) server.SubscriberFunc {
		return func(ctx context.Context, msg server.Publication) error {
			ctx = servicecontext.WithDAO(ctx, val)
			return subscriberFunc(ctx, msg)
		}
	}
}
