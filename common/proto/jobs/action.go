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

package jobs

import (
	"context"
	"sync"

	"github.com/micro/go-micro/client"
	"go.uber.org/zap"
	"go.uber.org/zap/zapcore"

	"github.com/pydio/cells/common"
	"github.com/pydio/cells/common/proto/idm"
	"github.com/pydio/cells/common/proto/object"
	"github.com/pydio/cells/common/proto/tree"
)

func (a *Action) ToMessages(startMessage ActionMessage, c client.Client, ctx context.Context, output, failedFilter chan ActionMessage, done chan bool) {

	startMessage, excluded, pass := a.ApplyFilters(ctx, startMessage)
	if !pass {
		if excluded != nil {
			failedFilter <- *excluded
		} else {
			failedFilter <- startMessage
		}
		done <- true
		return
	}
	if excluded != nil {
		failedFilter <- *excluded
	}
	if a.HasSelectors() {
		a.ResolveSelectors(startMessage, c, ctx, output, done)
	} else {
		output <- startMessage
		done <- true
	}
}

func (a *Action) HasSelectors() bool {
	return len(a.getSelectors()) > 0
}

func (a *Action) getSelectors() []InputSelector {
	var selectors []InputSelector
	if a.NodesSelector != nil {
		selectors = append(selectors, a.NodesSelector)
	}
	if a.IdmSelector != nil {
		selectors = append(selectors, a.IdmSelector)
	}
	if a.UsersSelector != nil {
		selectors = append(selectors, a.UsersSelector)
	}
	if a.DataSourceSelector != nil {
		selectors = append(selectors, a.DataSourceSelector)
	}
	return selectors
}

func (a *Action) ApplyFilters(ctx context.Context, input ActionMessage) (output ActionMessage, excluded *ActionMessage, passThrough bool) {
	passThrough = true
	output = input
	if a.NodesFilter != nil {
		output, excluded, passThrough = a.NodesFilter.Filter(ctx, output)
		if !passThrough {
			return
		}
	}
	if a.IdmFilter != nil {
		output, excluded, passThrough = a.IdmFilter.Filter(ctx, output)
		if !passThrough {
			return
		}
	}
	if a.DataSourceFilter != nil {
		output, excluded, passThrough = a.DataSourceFilter.Filter(ctx, output)
		if !passThrough {
			return
		}
	}
	if a.TriggerFilter != nil {
		output, excluded, passThrough = a.TriggerFilter.Filter(ctx, output)
		if !passThrough {
			return
		}
	}
	if a.UsersFilter != nil {
		output, passThrough = a.UsersFilter.Filter(ctx, output)
		if !passThrough {
			return
		}
	}
	if a.ActionOutputFilter != nil {
		output, passThrough = a.ActionOutputFilter.Filter(ctx, output)
		if !passThrough {
			return
		}
	}
	if a.ContextMetaFilter != nil {
		output, passThrough = a.ContextMetaFilter.Filter(ctx, output)
		if !passThrough {
			return
		}
	}
	return
}

func (a *Action) ResolveSelectors(startMessage ActionMessage, cl client.Client, ctx context.Context, output chan ActionMessage, done chan bool) {

	a.FanToNext(cl, ctx, 0, startMessage, output, done)

}

func (a *Action) FanToNext(cl client.Client, ctx context.Context, index int, input ActionMessage, output chan ActionMessage, done chan bool) {

	selectors := a.getSelectors()
	if index < len(selectors)-1 {
		// Make a intermediary pipes for output/done
		nextOut := make(chan ActionMessage)
		nextDone := make(chan bool, 1)
		go func() {
			for {
				select {
				case message := <-nextOut:
					go a.FanToNext(cl, ctx, index+1, message, output, done)
				case <-nextDone:
					close(nextOut)
					close(nextDone)
					return
				}
			}
		}()
		if selectors[index].MultipleSelection() {
			go a.CollectSelector(cl, ctx, selectors[index], input, nextOut, nextDone)
		} else {
			go a.FanOutSelector(cl, ctx, selectors[index], input, nextOut, nextDone)
		}
	} else {
		if selectors[index].MultipleSelection() {
			a.CollectSelector(cl, ctx, selectors[index], input, output, done)
		} else {
			a.FanOutSelector(cl, ctx, selectors[index], input, output, done)
		}
	}

}

func (a *Action) FanOutSelector(cl client.Client, ctx context.Context, selector InputSelector, input ActionMessage, output chan ActionMessage, done chan bool) {

	// If multiple selectors, we have to apply them sequentially
	wire := make(chan interface{})
	selectDone := make(chan bool, 1)
	go func() {
		for {
			select {
			case obj := <-wire:
				if nodeP, o := obj.(*tree.Node); o {
					node := *nodeP // copy
					input = input.WithNode(&node)
				} else if userP, oU := obj.(*idm.User); oU {
					user := *userP
					input = input.WithUser(&user)
				} else if roleP, oR := obj.(*idm.Role); oR {
					role := *roleP
					input = input.WithRole(&role)
				} else if wsP, oW := obj.(*idm.Workspace); oW {
					ws := *wsP
					input = input.WithWorkspace(&ws)
				} else if aclP, oA := obj.(*idm.ACL); oA {
					acl := *aclP
					input = input.WithAcl(&acl)
				} else if dsP, oD := obj.(*object.DataSource); oD {
					ds := *dsP
					input = input.WithDataSource(&ds)
				}
				output <- input
			case <-selectDone:
				close(wire)
				close(selectDone)
				done <- true
				return
			}
		}
	}()
	go selector.Select(cl, ctx, input, wire, selectDone)

}

func (a *Action) CollectSelector(cl client.Client, ctx context.Context, selector InputSelector, input ActionMessage, output chan ActionMessage, done chan bool) {

	// If multiple selectors, we have to apply them sequentially
	var nodes []*tree.Node
	var users []*idm.User
	var roles []*idm.Role
	var workspaces []*idm.Workspace
	var acls []*idm.ACL
	var dss []*object.DataSource

	wire := make(chan interface{})
	selectDone := make(chan bool, 1)
	wg := &sync.WaitGroup{}
	wg.Add(1)
	go func() {
		defer wg.Done()
		for {
			select {
			case obj := <-wire:
				if node, o := obj.(*tree.Node); o {
					nodes = append(nodes, node)
				} else if user, oU := obj.(*idm.User); oU {
					users = append(users, user)
				} else if role, oR := obj.(*idm.Role); oR {
					roles = append(roles, role)
				} else if ws, oW := obj.(*idm.Workspace); oW {
					workspaces = append(workspaces, ws)
				} else if acl, oA := obj.(*idm.ACL); oA {
					acls = append(acls, acl)
				} else if ds, oD := obj.(*object.DataSource); oD {
					dss = append(dss, ds)
				}
			case <-selectDone:
				close(wire)
				close(selectDone)
				return
			}
		}
	}()
	go selector.Select(cl, ctx, input, wire, selectDone)
	wg.Wait()

	input = input.WithNodes(nodes...)
	input = input.WithRoles(roles...)
	input = input.WithWorkspaces(workspaces...)
	input = input.WithAcls(acls...)
	input = input.WithUsers(users...)
	input = input.WithDataSources(dss...)
	if len(nodes) == 0 && len(roles) == 0 && len(workspaces) == 0 && len(acls) == 0 && len(users) == 0 && len(dss) == 0 {
		done <- true
		return
	}
	output <- input
	done <- true
}

/* LOGGING SUPPORT */

func (a *Action) MarshalLogObject(encoder zapcore.ObjectEncoder) error {
	encoder.AddString("ID", a.ID)
	encoder.AddReflected("Parameters", a.Parameters)
	return nil
}

// Zap simply returns a zapcore.Field object populated with this Action under a standard key
func (a *Action) Zap() zapcore.Field {
	return zap.Object(common.KeyAction, a)
}

// ZapId simply calls zap.String() with ActionId standard key and this Action id
func (a *Action) ZapId() zapcore.Field {
	return zap.String(common.KeyActionId, a.GetID())
}
