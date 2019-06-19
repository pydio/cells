/*
 * Copyright (c) 2019. Abstrium SAS <team (at) pydio.com>
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
package merger

import (
	"context"

	"github.com/pydio/cells/common/proto/tree"
	"github.com/pydio/cells/common/sync/model"
)

type AbstractPatch struct {
	uuid    string
	options PatchOptions
	source  model.PathSyncSource
	target  model.PathSyncTarget

	sessionProvider        model.SessionProvider
	sessionProviderContext context.Context
	sessionSilent          bool

	skipFilterToTarget bool

	statusChan chan ProcessStatus
	doneChan   chan interface{}
	cmd        *model.Command
	closing    bool
	patchError error
}

func (b *AbstractPatch) GetUUID() string {
	return b.uuid
}

func (b *AbstractPatch) SetSessionProvider(providerContext context.Context, provider model.SessionProvider, silentSession bool) {
	b.sessionProvider = provider
	b.sessionProviderContext = providerContext
	b.sessionSilent = silentSession
}

func (b *AbstractPatch) SetupChannels(status chan ProcessStatus, done chan interface{}, cmd *model.Command) {
	b.statusChan = status
	b.doneChan = done
	b.cmd = cmd
}

func (b *AbstractPatch) Status(s ProcessStatus) {
	if s.IsError {
		b.patchError = s.Error
	}
	if b.statusChan != nil {
		go func() {
			if !b.closing {
				b.statusChan <- s
			}
		}()
	}
}

func (b *AbstractPatch) Done(info interface{}) {
	b.closing = true
	if b.doneChan != nil {
		b.doneChan <- info
	}
}

// Set a global error status on this patch
func (b *AbstractPatch) SetError(e error) {
	b.patchError = e
}

// Check if this patch has a global error status
func (b *AbstractPatch) HasError() (error, bool) {
	return b.patchError, b.patchError != nil
}

func (b *AbstractPatch) Source(newSource ...model.PathSyncSource) model.PathSyncSource {
	if len(newSource) > 0 {
		b.source = newSource[0]
	}
	return b.source
}

func (b *AbstractPatch) Target(newTarget ...model.PathSyncTarget) model.PathSyncTarget {
	if len(newTarget) > 0 {
		b.target = newTarget[0]
	}
	return b.target
}

func (b *AbstractPatch) StartSessionProvider(rootNode *tree.Node) (*tree.IndexationSession, error) {
	if b.sessionProvider != nil {
		return b.sessionProvider.StartSession(b.sessionProviderContext, rootNode, b.sessionSilent)
	} else {
		return &tree.IndexationSession{Uuid: "fake-session", Description: "Noop Session"}, nil
	}
}

func (b *AbstractPatch) FlushSessionProvider(sessionUuid string) error {
	if b.sessionProvider != nil {
		return b.sessionProvider.FlushSession(b.sessionProviderContext, sessionUuid)
	}
	return nil
}

func (b *AbstractPatch) FinishSessionProvider(sessionUuid string) error {
	if b.sessionProvider != nil {
		return b.sessionProvider.FinishSession(b.sessionProviderContext, sessionUuid)
	}
	return nil
}

func (b *AbstractPatch) HasTransfers() bool {
	_, ok1 := model.AsDataSyncSource(b.Source())
	_, ok2 := model.AsDataSyncTarget(b.Target())
	return ok1 && ok2
}

func (b *AbstractPatch) SkipFilterToTarget(skip bool) {
	b.skipFilterToTarget = skip
}
