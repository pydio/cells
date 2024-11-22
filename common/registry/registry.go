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
	"sync"

	pb "github.com/pydio/cells/v5/common/proto/registry"
)

type Registry interface {
	RawRegistry
	RegisterEdge(item1, item2, edgeLabel string, metadata map[string]string, oo ...RegisterOption) (Edge, error)
	ListAdjacentItems(options ...AdjacentItemOption) (items []Item)
}

type AdjacentItemOption func(options *AdjacentItemOptions)

type AdjacentItemOptions struct {
	edgeItems   []Item
	sourceItems []Item
	targetItems []Item

	edgeOptions   []Option
	sourceOptions []Option
	targetOptions []Option
}

func WithAdjacentEdgeItems(items []Item) AdjacentItemOption {
	return func(o *AdjacentItemOptions) {
		o.edgeItems = items
	}
}

func WithAdjacentSourceItems(items []Item) AdjacentItemOption {
	return func(o *AdjacentItemOptions) {
		o.sourceItems = items
	}
}

func WithAdjacentTargetItems(items []Item) AdjacentItemOption {
	return func(o *AdjacentItemOptions) {
		o.targetItems = items
	}
}

func WithAdjacentEdgeOptions(opts ...Option) AdjacentItemOption {
	return func(o *AdjacentItemOptions) {
		o.edgeOptions = opts
	}
}

func WithAdjacentSourceOptions(opts ...Option) AdjacentItemOption {
	return func(o *AdjacentItemOptions) {
		o.sourceOptions = opts
	}
}

func WithAdjacentTargetOptions(opts ...Option) AdjacentItemOption {
	return func(o *AdjacentItemOptions) {
		o.targetOptions = opts
	}
}

type RawRegistry interface {
	Start(Item) error
	Stop(Item) error
	Register(Item, ...RegisterOption) error
	Deregister(Item, ...RegisterOption) error
	Get(string, ...Option) (Item, error)
	List(...Option) ([]Item, error)
	Watch(...Option) (Watcher, error)
	NewLocker(name string) sync.Locker

	Close() error
	Done() <-chan struct{}

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
