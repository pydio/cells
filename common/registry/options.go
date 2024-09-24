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

type Option func(*Options)

type Options struct {
	Context  context.Context
	FailFast bool
	Actions  []pb.ActionType
	IDs      []string
	Names    []string
	Types    []pb.ItemType
	Filters  []func(item Item) bool
}

func WithFailFast() Option {
	return func(options *Options) {
		options.FailFast = true
	}
}

func WithContext(ctx context.Context) Option {
	return func(o *Options) {
		o.Context = ctx
	}
}

func WithAction(a pb.ActionType) Option {
	return func(o *Options) {
		o.Actions = append(o.Actions, a)
	}
}

func WithID(id string) Option {
	return func(o *Options) {
		o.IDs = append(o.IDs, id)
	}
}

func WithName(n string) Option {
	return func(o *Options) {
		o.Names = append(o.Names, n)
	}
}

func WithType(t pb.ItemType) Option {
	return func(o *Options) {
		o.Types = append(o.Types, t)
	}
}

func WithFilter(f func(Item) bool) Option {
	return func(o *Options) {
		o.Filters = append(o.Filters, f)
	}
}

func WithMeta(name, value string) Option {
	return func(o *Options) {
		o.Filters = append(o.Filters, func(item Item) bool {
			mm := item.Metadata()
			val, has := mm[name]
			if !has {
				return false
			}
			if len(value) > 0 && val != value {
				return false
			}
			return true
		})
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

// ActionsMatch checks if an Action filter matches input
func (o *Options) ActionsMatch(eventAction pb.ActionType) bool {
	// no filter
	if len(o.Actions) == 0 {
		return true
	}

	// at least one matches
	for _, a := range o.Actions {
		if o.actionOneMatches(eventAction, a) {
			return true
		}
	}
	return false

}

func (o *Options) actionOneMatches(event, filter pb.ActionType) bool {
	// FULL_LIST : specific action only
	if filter == pb.ActionType_FULL_LIST && event != pb.ActionType_FULL_LIST {
		return false
	}

	// FULL_DIFF : skip diff and full_list
	if filter == pb.ActionType_FULL_DIFF && event < pb.ActionType_CREATE {
		return false
	}

	// Specific Action: checking action matches
	if filter >= pb.ActionType_CREATE && event != filter {
		return false
	}
	return true
}

func (o *Options) filterItems(items ...Item) []Item {
	var ret []Item
	for _, item := range items {
		if len(o.IDs) > 0 {
			foundID := false
			for _, id := range o.IDs {
				if id == item.ID() {
					foundID = true
					break
				}
			}
			if !foundID {
				continue
			}
		}

		if len(o.Names) > 0 {
			foundName := false
			for _, name := range o.Names {
				if name == item.Name() {
					foundName = true
					break
				}
			}
			if !foundName {
				continue
			}
		}

		if len(o.Types) > 0 {
			foundType := false
		L:
			for _, itemType := range o.Types {
				switch itemType {
				case pb.ItemType_NODE:
					var node Node
					if item.As(&node) {
						foundType = true
						break L
					}
				case pb.ItemType_SERVICE:
					var service Service
					if item.As(&service) {
						foundType = true
						break L
					}
				case pb.ItemType_SERVER:
					var node Server
					if item.As(&node) {
						foundType = true
						break L
					}
				case pb.ItemType_DAO:
					var dao Dao
					if item.As(&dao) {
						foundType = true
						break L
					}
				case pb.ItemType_EDGE:
					var edge Edge
					if item.As(&edge) {
						foundType = true
						break L
					}
				case pb.ItemType_GENERIC, pb.ItemType_ADDRESS, pb.ItemType_TAG, pb.ItemType_ENDPOINT:
					var generic Generic
					if item.As(&generic) &&
						(itemType == pb.ItemType_GENERIC || itemType == generic.Type()) {
						foundType = true
						break L
					}
				}
			}

			if len(o.Types) > 0 && !foundType {
				continue
			}
		}

		if len(o.Filters) > 0 {
			foundFilter := true
			for _, filter := range o.Filters {
				if !filter(item) {
					foundFilter = false
					break
				}
			}

			if !foundFilter {
				continue
			}
		}

		ret = append(ret, item)
	}

	return ret
}

type RegisterOptions struct {
	Context        context.Context
	Edges          []registerEdge
	Watch          interface{}
	FailFast       bool
	DeregisterFull bool
}

type RegisterOption func(options *RegisterOptions)

type registerEdge struct {
	Id    string
	Label string
	Meta  map[string]string
}

func WithContextR(ctx context.Context) RegisterOption {
	return func(o *RegisterOptions) {
		o.Context = ctx
	}
}

func WithEdgeTo(id, label string, meta map[string]string) RegisterOption {
	return func(options *RegisterOptions) {
		if meta == nil {
			meta = make(map[string]string)
		}
		options.Edges = append(options.Edges, registerEdge{
			Id:    id,
			Label: label,
			Meta:  meta,
		})
	}
}

func WithWatch(wi StatusReporter) RegisterOption {
	return func(options *RegisterOptions) {
		options.Watch = wi
	}
}

func WithRegisterFailFast() RegisterOption {
	return func(options *RegisterOptions) {
		options.FailFast = true
	}
}

func WithDeregisterFull() RegisterOption {
	return func(options *RegisterOptions) {
		options.DeregisterFull = true
	}
}
