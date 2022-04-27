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

package registry

import (
	"context"
	pb "github.com/pydio/cells/v4/common/proto/registry"
)

type Registry interface {
	Start(Item) error
	Stop(Item) error
	Register(Item) error
	Deregister(Item) error
	Get(string, ...Option) (Item, error)
	List(...Option) ([]Item, error)
	Watch(...Option) (Watcher, error)

	As(interface{}) bool
}

type Context interface {
	Context(context.Context)
}

type Watcher interface {
	Next() (Result, error)
	Stop()
}

type Result interface {
	Action() pb.ActionType
	Items() []Item
}

type registry struct {
	r Registry
}

func NewRegistry(r Registry) Registry {
	return &registry{r: r}
}

func (r *registry) Start(i Item) error {
	return r.r.Start(i)
}

func (r *registry) Stop(i Item) error {
	return r.r.Stop(i)
}

func (r *registry) Register(i Item) error {
	return r.r.Register(i)
}

func (r *registry) Deregister(i Item) error {
	return r.r.Deregister(i)
}

func (r *registry) Get(s string, opts ...Option) (Item, error) {
	return r.r.Get(s, opts...)
}

func (r *registry) List(opts ...Option) ([]Item, error) {
	return r.r.List(opts...)
}

func (r *registry) Watch(option ...Option) (Watcher, error) {
	return r.r.Watch(option...)
}

func (r *registry) As(i interface{}) bool {
	return r.r.As(i)
}
