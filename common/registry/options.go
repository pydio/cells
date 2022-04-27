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
	"regexp"
	"strings"

	pb "github.com/pydio/cells/v4/common/proto/registry"
)

const (
	ServiceMetaOverride = "service-override"
)

type Option func(*Options) error

type Options struct {
	Context context.Context
	Action  pb.ActionType
	Name    string
	Type    pb.ItemType
	Filter  func(item Item) bool
}

func WithAction(a pb.ActionType) Option {
	return func(o *Options) error {
		o.Action = a
		return nil
	}
}

func WithName(n string) Option {
	return func(o *Options) error {
		o.Name = n
		return nil
	}
}

func WithType(t pb.ItemType) Option {
	return func(o *Options) error {
		o.Type = t
		return nil
	}
}

func WithFilter(f func(Item) bool) Option {
	return func(o *Options) error {
		o.Filter = f
		return nil
	}
}

func WithMeta(name, value string) Option {
	return func(options *Options) error {
		options.Filter = func(item Item) bool {
			mm := item.Metadata()
			val, has := mm[name]
			if !has {
				return false
			}
			if len(value) > 0 && val != value {
				return false
			}
			return true
		}
		return nil
	}
}

func (o *Options) Matches(name, itemName string) bool {
	var start, end string
	if !strings.HasPrefix(name, "*") {
		start = "^"
	}
	if !strings.HasSuffix(name, "*") {
		end = "$"
	}
	name = strings.Trim(name, "*")
	res, _ := regexp.MatchString(start+name+end, itemName)
	return res
}
