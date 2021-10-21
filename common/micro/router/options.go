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

package router

import (
	"github.com/micro/go-api"
	microrouter "github.com/micro/go-api/router"
	"github.com/micro/go-micro/cmd"
	"github.com/micro/go-micro/registry"
)

func newOptions(opts ...microrouter.Option) microrouter.Options {
	options := microrouter.Options{
		Namespace: "go.micro.api",
		Handler:   api.Default,
		Registry:  *cmd.DefaultOptions().Registry,
	}

	for _, o := range opts {
		o(&options)
	}

	return options
}

func WithHandler(h api.Handler) microrouter.Option {
	return func(o *microrouter.Options) {
		o.Handler = h
	}
}

func WithNamespace(ns string) microrouter.Option {
	return func(o *microrouter.Options) {
		o.Namespace = ns
	}
}

func WithRegistry(r registry.Registry) microrouter.Option {
	return func(o *microrouter.Options) {
		o.Registry = r
	}
}
