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

import "github.com/pydio/cells/v4/common/proto/registry"

type Convertible interface {
	As(interface{}) bool
}

// Item is the main interface for registry items
type Item interface {
	Name() string
	ID() string
	Metadata() map[string]string
	As(interface{}) bool
}

func ItemsAs[T any](ii []Item) (converted []T) {
	for _, it := range ii {
		var ty T
		it.As(&ty)
		converted = append(converted, ty)
	}
	return
}

type StatusReporter interface {
	WatchStatus() (StatusWatcher, error)
}

type StatusWatcher interface {
	Next() (Item, error)
	Stop()
}

type Node interface {
	Item
	Hostname() string
	IPs() []string
	AdvertiseIP() string
}

// Server represents a running server
type Server interface {
	Item
	Server()
}

// Service represents an instantiated service in the registry
type Service interface {
	Item

	Version() string
	Tags() []string

	Start(oo ...RegisterOption) error
	Stop(oo ...RegisterOption) error

	ServerScheme() string
}

// Dao stores a DAO in the registry
type Dao interface {
	Item

	Driver() string
	DSN() string
}

// Edge links two vertices together
type Edge interface {
	Item

	Vertices() []string
}

type Endpoint interface {
	Item

	Handler() any
}

// Generic is the simplest Item implementation
type Generic interface {
	Item

	Type() registry.ItemType
}

type RichItem[T any] struct {
	id   string
	name string
	meta map[string]string

	item T
}

func (r *RichItem[T]) ID() string {
	return r.id
}

func (r *RichItem[T]) Name() string {
	return r.name
}

func (r *RichItem[T]) Metadata() map[string]string {
	return r.meta
}

func (r *RichItem[T]) As(t any) bool {
	if v, ok := t.(*T); ok {
		*v = r.item
		return true
	}

	if convertible, ok := any(r.item).(Convertible); ok {
		return convertible.As(t)
	}
	return false
}

func NewRichItem[T any](id string, name string, base T) Item {
	return &RichItem[T]{
		item: base,
		id:   id,
		name: name,
	}
}
