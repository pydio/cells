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

package nodes

import (
	"context"

	"github.com/pydio/cells/v5/common/registry"
	"github.com/pydio/cells/v5/common/utils/openurl"
)

type Option func(options *RouterOptions)

type Adapter interface {
	Adapt(h Handler, options RouterOptions) Handler
}

// RouterOptions holds configuration flags to pass to a router constructor easily.
type RouterOptions struct {
	//Context context.Context

	CoreClient Handler

	AdminView     bool
	WatchRegistry bool
	Registry      registry.Registry

	LogReadEvents      bool
	BrowseVirtualNodes bool
	// AuditEvent flag turns audit logger ON for the corresponding router.
	AuditEvent       bool
	SynchronousCache bool
	SynchronousTasks bool
	HashesAsETags    bool
	PermanentPrefix  string

	UuidExternalPath bool

	Wrappers []Adapter
	Pool     *openurl.Pool[SourcesPool]
}

func WithContext(ctx context.Context) Option {
	return func(options *RouterOptions) {
		//options.Context = ctx
	}
}

func WithCore(h Handler) Option {
	return func(options *RouterOptions) {
		options.CoreClient = h
	}
}

func AsAdmin() Option {
	return func(o *RouterOptions) {
		o.AdminView = true
	}
}

func WithReadEventsLogging() Option {
	return func(o *RouterOptions) {
		o.LogReadEvents = true
	}
}

func WithAuditEventsLogging() Option {
	return func(o *RouterOptions) {
		o.AuditEvent = true
	}
}

func WithVirtualNodesBrowsing() Option {
	return func(o *RouterOptions) {
		o.BrowseVirtualNodes = true
	}
}

func WithSynchronousCaching() Option {
	return func(o *RouterOptions) {
		o.SynchronousCache = true
	}
}

func WithSynchronousTasks() Option {
	return func(o *RouterOptions) {
		o.SynchronousTasks = true
	}
}

func WithHashesAsETags() Option {
	return func(o *RouterOptions) {
		o.HashesAsETags = true
	}
}

func WithPermanentPrefix(p string) Option {
	return func(options *RouterOptions) {
		options.PermanentPrefix = p
	}
}

func WithWrapper(adapter Adapter) Option {
	return func(o *RouterOptions) {
		o.Wrappers = append(o.Wrappers, adapter)
	}
}
