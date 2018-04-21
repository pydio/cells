/*
 * Copyright (c) 2018. Abstrium SAS <team (at) pydio.com>
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
	"github.com/pydio/cells/common/proto/tree"
)

func (a *Action) ToMessages(startMessage ActionMessage, c client.Client, ctx context.Context, output chan ActionMessage, done chan bool) {

	startMessage = a.ApplyFilters(startMessage)
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
	selectors := []InputSelector{}
	if a.NodesSelector != nil {
		selectors = append(selectors, a.NodesSelector)
	}
	if a.UsersSelector != nil {
		selectors = append(selectors, a.UsersSelector)
	}
	return selectors
}

func (a *Action) ApplyFilters(input ActionMessage) ActionMessage {
	if a.NodesFilter != nil {
		input = a.NodesFilter.Filter(input)
	}
	if a.UsersFilter != nil {
		input = a.UsersFilter.Filter(input)
	}
	if a.SourceFilter != nil {
		input = a.SourceFilter.Filter(input)
	}
	return input
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
	outputType := ""
	if _, ok := selector.(*NodesSelector); ok {
		outputType = "node"
	} else if _, ok := selector.(*UsersSelector); ok {
		outputType = "user"
	}
	wire := make(chan interface{})
	selectDone := make(chan bool, 1)
	go func() {
		for {
			select {
			case object := <-wire:
				if outputType == "node" {
					nodeP := object.(*tree.Node)
					node := tree.Node(*nodeP)
					input = input.WithNode(&node)
					output <- input
				} else if outputType == "user" {
					userP := object.(*idm.User)
					user := idm.User(*userP)
					input = input.WithUser(&user)
					output <- input
				}
			case <-selectDone:
				close(wire)
				close(selectDone)
				done <- true
				return
			}
		}
	}()
	go selector.Select(cl, ctx, wire, selectDone)

}

func (a *Action) CollectSelector(cl client.Client, ctx context.Context, selector InputSelector, input ActionMessage, output chan ActionMessage, done chan bool) {

	// If multiple selectors, we have to apply them sequentially
	outputType := ""
	nodes := []*tree.Node{}
	users := []*idm.User{}
	if _, ok := selector.(*NodesSelector); ok {
		outputType = "node"
	} else if _, ok := selector.(*UsersSelector); ok {
		outputType = "user"
	}
	wire := make(chan interface{})
	selectDone := make(chan bool, 1)
	wg := &sync.WaitGroup{}
	wg.Add(1)
	go func() {
		defer wg.Done()
		for {
			select {
			case object := <-wire:
				if outputType == "node" {
					nodeP := object.(*tree.Node)
					nodes = append(nodes, nodeP)
				} else if outputType == "user" {
					userP := object.(*idm.User)
					users = append(users, userP)
				}
			case <-selectDone:
				close(wire)
				close(selectDone)
				return
			}
		}
	}()
	go selector.Select(cl, ctx, wire, selectDone)
	wg.Wait()

	if outputType == "node" {
		input = input.WithNodes(nodes...)
	} else if outputType == "user" {
		input = input.WithUsers(users...)
	}
	output <- input
	done <- true
}

/* LOGGING SUPPORT */

// Zap simply returns a zapcore.Field object populated with this Action under a standard key
func (a *Action) Zap() zapcore.Field {
	return zap.Any(common.KEY_ACTION, a)
}

// ZapId simply calls zap.String() with ActionId standard key and this Action id
func (a *Action) ZapId() zapcore.Field {
	return zap.String(common.KEY_ACTION_ID, a.GetID())
}
