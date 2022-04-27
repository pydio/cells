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

// Item is the main interface for registry items
type Item interface {
	Name() string
	ID() string
	Metadata() map[string]string
	As(interface{}) bool
}

// Server represents a running server
type Server interface {
	Item

	Address() []string
	Endpoints() []string
}

// Service represents an instantiated service in the registry
type Service interface {
	Item

	Version() string
	Tags() []string

	Start() error
	Stop() error

	IsGeneric() bool
	IsGRPC() bool
	IsREST() bool
}

// Dao stores a DAO in the registry
type Dao interface {
	Item

	Driver() string
	Dsn() string
}

// Edge links two vertices together
type Edge interface {
	Item

	Vertices() []string
}

// Generic is the simplest Item implementation
type Generic interface {
	Item

	Generic()
}
