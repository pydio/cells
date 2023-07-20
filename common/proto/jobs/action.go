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
	"fmt"
	"path"
	"strings"
	"sync"
	"time"

	"go.uber.org/zap"
	"go.uber.org/zap/zapcore"
	"google.golang.org/protobuf/proto"

	"github.com/pydio/cells/v4/common"
	"github.com/pydio/cells/v4/common/log"
	"github.com/pydio/cells/v4/common/proto/idm"
	"github.com/pydio/cells/v4/common/proto/object"
	"github.com/pydio/cells/v4/common/proto/tree"
	servicecontext "github.com/pydio/cells/v4/common/service/context"
	"github.com/pydio/cells/v4/common/service/context/metadata"
)

const (
	IndexedContextKey = "chainIndex"
)

func (a *Action) ToMessages(startMessage *ActionMessage, ctx context.Context, output, failedFilter chan *ActionMessage, errors chan error, done chan bool) {

	ff := a.getFilters()
	startMessage, excluded, pass := a.ApplyFilters(ctx, ff, startMessage)
	if !pass {
		if excluded != nil {
			failedFilter <- excluded
		} else {
			failedFilter <- startMessage
		}
		done <- true
		return
	}
	if excluded != nil {
		failedFilter <- excluded
	}
	if a.HasSelectors() {
		var ll []string
		for _, sel := range a.getSelectors() {
			ll = append(ll, "\""+sel.SelectorLabel()+"\"")
		}
		_, ct := a.BuildTaskActionPath(ctx, "")
		log.TasksLogger(ct).Info("Launching " + strings.Join(ll, ", "))
		a.FanToNext(ctx, 0, startMessage, output, errors, done)
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

func (a *Action) getFilters() (ff []InputFilter) {
	if a.NodesFilter != nil {
		ff = append(ff, a.NodesFilter)
	}
	if a.IdmFilter != nil {
		ff = append(ff, a.IdmFilter)
	}
	if a.DataSourceFilter != nil {
		ff = append(ff, a.DataSourceFilter)
	}
	if a.TriggerFilter != nil {
		ff = append(ff, a.TriggerFilter)
	}
	if a.ActionOutputFilter != nil {
		ff = append(ff, a.ActionOutputFilter)
	}
	if a.ContextMetaFilter != nil {
		ff = append(ff, a.ContextMetaFilter)
	}
	return
}

func (a *Action) ApplyFilters(ctx context.Context, ff []InputFilter, input *ActionMessage) (output *ActionMessage, excluded *ActionMessage, passThrough bool) {
	passThrough = true
	output = input
	for _, f := range ff {
		logger := log.TasksLogger(a.debugLogContext(ctx, true, f))
		output, excluded, passThrough = f.Filter(ctx, output.Clone())
		if !passThrough {
			if excluded != nil {
				logger.Debug("Filter may break to", zap.Object("FAIL", excluded))
			} else {
				logger.Debug("Filter breaks here")
			}
			return
		}
		logger.Debug("ZAPS", zap.Object("PASS", output))
	}
	return
}

func (a *Action) FanToNext(ctx context.Context, index int, input *ActionMessage, output chan *ActionMessage, errors chan error, done chan bool) {

	selectors := a.getSelectors()
	if index < len(selectors)-1 {
		// Make an intermediary pipes for output/done
		nextOut := make(chan *ActionMessage)
		nextDone := make(chan bool, 1)
		go func() {
			for {
				select {
				case message := <-nextOut:
					go a.FanToNext(ctx, index+1, message.Clone(), output, errors, done)
				case <-nextDone:
					close(nextOut)
					close(nextDone)
					return
				}
			}
		}()
		if selectors[index].MultipleSelection() {
			go a.CollectSelector(ctx, selectors[index], input, nextOut, nextDone, errors)
		} else {
			go a.FanOutSelector(ctx, selectors[index], input, nextOut, nextDone, errors)
		}
	} else {
		if selectors[index].MultipleSelection() {
			a.CollectSelector(ctx, selectors[index], input, output, done, errors)
		} else {
			a.FanOutSelector(ctx, selectors[index], input, output, done, errors)
		}
	}

}

func (a *Action) FanOutSelector(ctx context.Context, selector InputSelector, input *ActionMessage, output chan *ActionMessage, done chan bool, errors chan error) {

	// If multiple selectors, we have to apply them sequentially
	wire := make(chan interface{})
	selectDone := make(chan bool, 1)
	var timeoutCancel context.CancelFunc
	logger := log.TasksLogger(a.debugLogContext(ctx, false, selector))
	logger.Debug("ZAPS", zap.Object("Input", input))
	if selector.GetClearInput() {
		input = selector.ApplyClearInput(input)
	}
	go func() {
		var count = 0
		for {
			select {
			case obj := <-wire:
				if er, o := obj.(error); o {
					errors <- er
					break
				}
				if nodeP, o := obj.(*tree.Node); o {
					input = input.WithNode(nodeP.Clone())
				} else if userP, oU := obj.(*idm.User); oU {
					input = input.WithUser(proto.Clone(userP).(*idm.User))
				} else if roleP, oR := obj.(*idm.Role); oR {
					input = input.WithRole(proto.Clone(roleP).(*idm.Role))
				} else if wsP, oW := obj.(*idm.Workspace); oW {
					input = input.WithWorkspace(proto.Clone(wsP).(*idm.Workspace))
				} else if aclP, oA := obj.(*idm.ACL); oA {
					input = input.WithAcl(proto.Clone(aclP).(*idm.ACL))
				} else if dsP, oD := obj.(*object.DataSource); oD {
					input = input.WithDataSource(proto.Clone(dsP).(*object.DataSource))
				} else {
					break
				}
				count++
				output <- input
			case <-selectDone:
				close(wire)
				close(selectDone)
				done <- true
				if timeoutCancel != nil {
					timeoutCancel()
				}
				if count > 0 {
					logger.Debug(fmt.Sprintf("Sent %d objects (to separate actions)", count))
				} else {
					logger.Debug("Empty Query Result")
				}
				return
			}
		}
	}()
	go func() {
		if selector.GetTimeout() != "" {
			if d, e := time.ParseDuration(selector.GetTimeout()); e == nil {
				ctx, timeoutCancel = context.WithTimeout(ctx, d)
			}
		}
		err := selector.Select(ctx, input, wire, selectDone)
		if err != nil {
			errors <- err
		}
	}()

}

func (a *Action) CollectSelector(ctx context.Context, selector InputSelector, input *ActionMessage, output chan *ActionMessage, done chan bool, errors chan error) {

	// If multiple selectors, we have to apply them sequentially
	var nodes []*tree.Node
	var users []*idm.User
	var roles []*idm.Role
	var workspaces []*idm.Workspace
	var acls []*idm.ACL
	var dss []*object.DataSource

	logger := log.TasksLogger(a.debugLogContext(ctx, false, selector))
	logger.Debug("ZAPS", zap.Object("Input", input))
	if selector.GetClearInput() {
		input = selector.ApplyClearInput(input)
	}
	var timeoutCancel context.CancelFunc
	wire := make(chan interface{})
	selectDone := make(chan bool, 1)
	wg := &sync.WaitGroup{}
	wg.Add(1)
	go func() {
		defer wg.Done()
		for {
			select {
			case obj := <-wire:
				if err, o := obj.(error); o {
					errors <- err
					break
				}
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
				if timeoutCancel != nil {
					timeoutCancel()
				}
				return
			}
		}
	}()
	go func() {
		if selector.GetTimeout() != "" {
			if d, e := time.ParseDuration(selector.GetTimeout()); e == nil {
				ctx, timeoutCancel = context.WithTimeout(ctx, d)
			}
		}
		if er := selector.Select(ctx, input, wire, selectDone); er != nil {
			errors <- er
		}
	}()
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
	count := len(nodes) + len(roles) + len(workspaces) + len(acls) + len(users) + len(dss)
	if count > 0 {
		logger.Debug(fmt.Sprintf("Sent %d objects as a collection", count))
	} else {
		logger.Debug("Empty Query Result")
	}
	output <- input
	done <- true
}

func (a *Action) BuildTaskActionPath(ctx context.Context, suffix string, indexTag ...int) (string, context.Context) {
	pPath := "ROOT"
	var tags []string
	if mm, ok := metadata.FromContextRead(ctx); ok {
		if p, o := mm[servicecontext.ContextMetaTaskActionPath]; o {
			pPath = p
		}
		if t, o := mm[servicecontext.ContextMetaTaskActionTags]; o {
			tags = strings.Split(t, ",")
		}
	}
	chainIndex := 0
	if civ := ctx.Value(IndexedContextKey); civ != nil {
		chainIndex = civ.(int)
	}
	var sx string
	if len(suffix) > 0 {
		sx = suffix
	}
	id := ""
	if a != nil { // Maybe nil if parent runnable is ROOT
		id = a.ID
	}
	newPath := path.Join(pPath, fmt.Sprintf("%s$%d%s", id, chainIndex, sx))
	newMeta := map[string]string{
		servicecontext.ContextMetaTaskActionPath: newPath,
	}
	if len(indexTag) > 0 && indexTag[0] > 0 {
		tags = append(tags, fmt.Sprintf("%s:%d", newPath, indexTag[0]))
		newMeta[servicecontext.ContextMetaTaskActionTags] = strings.Join(tags, ",")
	}
	ctx = metadata.WithAdditionalMetadata(ctx, newMeta)
	return newPath, ctx
}

/* LOGGING SUPPORT */

func (a *Action) debugLogContext(ctx context.Context, filter bool, obj interface{}) context.Context {

	var suffix string
	if filter {
		filterID := obj.(InputFilter).FilterID()
		suffix = "$" + filterID
	} else {
		selectorID := obj.(InputSelector).SelectorID()
		suffix = "$" + selectorID
	}
	_, ct := a.BuildTaskActionPath(ctx, suffix)
	return ct

}

func (a *Action) MarshalLogObject(encoder zapcore.ObjectEncoder) error {
	encoder.AddString("ID", a.ID)
	_ = encoder.AddReflected("Parameters", a.Parameters)
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
