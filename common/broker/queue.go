/*
 * Copyright (c) 2023. Abstrium SAS <team (at) pydio.com>
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

package broker

import (
	"context"
	"net/url"
	"strings"
	"sync"

	"google.golang.org/protobuf/proto"

	"github.com/pydio/cells/v4/common/errors"
	"github.com/pydio/cells/v4/common/runtime/controller"
	"github.com/pydio/cells/v4/common/utils/openurl"
)

const (
	OpenerFuncKey = "opener"
	OpenerIDKey   = "openerID"
)

type URLOpener interface {
	OpenURL(ctx context.Context, u *url.URL) (AsyncQueue, error)
}

type Consumer func(...Message)

type OpenWrapper func(q AsyncQueue) (AsyncQueue, error)

type AsyncQueuePool openurl.Resolver[AsyncQueue]

type AsyncQueue interface {
	MessageQueue
	Push(ctx context.Context, msg proto.Message) error
}

// TypeWithContext composes a generic type and a context
type TypeWithContext[T any] struct {
	Original T
	Ctx      context.Context
}

func NewWrappedPool(rootURL string, wrapper func(w OpenWrapper) controller.Opener[AsyncQueuePool]) (AsyncQueuePool, error) {
	resURL := rootURL + "&opener={{ .openerID }}"
	if !strings.Contains(resURL, "?") {
		resURL = rootURL + "?opener={{ .openerID }}"
	}
	resolver, er := openurl.URLTemplate(resURL)
	if er != nil {
		return nil, er
	}
	return &openerPoolWrapper{
		url:       rootURL,
		resolver:  resolver,
		wrapper:   wrapper,
		pools:     make(map[string]controller.Opener[AsyncQueuePool]),
		poolsLock: &sync.Mutex{},
	}, nil
}

type openerPoolWrapper struct {
	wrapper   func(w OpenWrapper) controller.Opener[AsyncQueuePool]
	url       string
	resolver  openurl.Template
	pools     map[string]controller.Opener[AsyncQueuePool]
	poolsLock *sync.Mutex
}

func (opw *openerPoolWrapper) Get(ctx context.Context, data ...map[string]interface{}) (AsyncQueue, error) {
	if len(data) == 0 {
		return nil, errors.New("no resolution data provided")
	}
	var opId string
	var op OpenWrapper
	for _, m := range data {
		for k, v := range m {
			if k == OpenerIDKey {
				opId = v.(string)
			} else if k == OpenerFuncKey {
				op = v.(OpenWrapper)
			}
		}
	}
	if opId == "" {
		return nil, errors.New("provide an opener ID")
	}
	if op == nil {
		return nil, errors.New("provide an opener")
	}

	identifier, er := opw.resolver.Resolve(ctx, data...)
	if er != nil {
		return nil, er
	}

	opw.poolsLock.Lock()
	var poolOpener controller.Opener[AsyncQueuePool]
	if p, ok := opw.pools[identifier]; ok {
		poolOpener = p
	} else {
		poolOpener = opw.wrapper(op)
		opw.pools[identifier] = poolOpener
	}
	opw.poolsLock.Unlock()
	qp, _ := poolOpener(ctx, opw.url)

	return qp.Get(ctx, data...)

}

type pool struct {
	*openurl.Pool[AsyncQueue]
}

func (p *pool) Get(ctx context.Context, data ...map[string]interface{}) (AsyncQueue, error) {
	return p.Pool.Get(ctx, data...)
}

func MakeWrappedOpener(opener URLOpener) func(w OpenWrapper) controller.Opener[AsyncQueuePool] {
	return func(w OpenWrapper) controller.Opener[AsyncQueuePool] {
		return func(ctx context.Context, rawUrl string) (AsyncQueuePool, error) {
			p, err := openurl.OpenPool(context.Background(), []string{rawUrl}, func(ctx context.Context, dsn string) (AsyncQueue, error) {
				u, er := url.Parse(dsn)
				if er != nil {
					return nil, er
				}
				dq, e := opener.OpenURL(ctx, u)
				if e != nil {
					return nil, e
				}
				return w(dq)
			})

			if err != nil {
				return nil, err
			}

			return &pool{
				Pool: p,
			}, nil
		}
	}

}
