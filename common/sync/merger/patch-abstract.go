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
	"sync"
	"time"

	"github.com/pydio/cells/common/log"

	"go.uber.org/zap/zapcore"

	"github.com/pydio/cells/common/proto/tree"
	"github.com/pydio/cells/common/sync/model"
)

type AbstractPatch struct {
	uuid    string
	options PatchOptions
	source  model.PathSyncSource
	target  model.PathSyncTarget
	mTime   time.Time

	sessionProviderContext context.Context
	sessionSilent          bool

	lockSessionProviderContext context.Context
	lockSession                string

	skipFilterToTarget bool
	postFilter         []func() error

	statusChan chan model.Status
	doneChan   chan interface{}
	cmd        *model.Command
	closing    bool
	closeLock  *sync.Mutex
	patchError error
}

func (b *AbstractPatch) GetUUID() string {
	return b.uuid
}

func (b *AbstractPatch) SetUUID(u string) {
	b.uuid = u
}

func (b *AbstractPatch) GetStamp() time.Time {
	return b.mTime
}

func (b *AbstractPatch) Stamp(t time.Time) {
	b.mTime = t
}

func (b *AbstractPatch) SetupChannels(status chan model.Status, done chan interface{}, cmd *model.Command) {
	b.statusChan = status
	b.doneChan = done
	b.cmd = cmd
	if b.closeLock == nil {
		b.closeLock = &sync.Mutex{}
	}
	// This may be a second processing
	b.closing = false
}

func (b *AbstractPatch) SetPatchError(e error) error {
	b.Status(model.NewProcessingStatus(e.Error()).SetError(e))
	return e
}

func (b *AbstractPatch) Status(s model.Status) {
	b.mTime = time.Now()
	if s.IsError() {
		b.patchError = s.Error()
	}
	if b.statusChan != nil {
		go func() {
			defer func() {
				recover()
			}()
			b.closeLock.Lock()
			c := b.closing
			b.closeLock.Unlock()
			if !c {
				b.statusChan <- s
			}
		}()
	}
}

func (b *AbstractPatch) Done(info interface{}) {
	b.mTime = time.Now()
	if b.doneChan != nil {
		b.closeLock.Lock()
		b.closing = true
		b.closeLock.Unlock()
		b.doneChan <- info
	}
}

// Set a global error status on this patch
func (b *AbstractPatch) SetError(e error) {
	b.patchError = e
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

func (b *AbstractPatch) SetLockSessionData(providerContext context.Context, lockSession string) {
	b.lockSessionProviderContext = providerContext
	b.lockSession = lockSession
}

func (b *AbstractPatch) SetSessionData(providerContext context.Context, silentSession bool) {
	b.sessionProviderContext = providerContext
	b.sessionSilent = silentSession
}

func (b *AbstractPatch) StartSession(rootNode *tree.Node) (*tree.IndexationSession, error) {
	if sessionProvider, ok := b.Target().(model.SessionProvider); ok && b.sessionProviderContext != nil {
		return sessionProvider.StartSession(b.sessionProviderContext, rootNode, b.sessionSilent)
	} else {
		return &tree.IndexationSession{Uuid: "fake-session", Description: "Noop Session"}, nil
	}
}

func (b *AbstractPatch) FlushSession(sessionUuid string) error {
	if sessionProvider, ok := b.Target().(model.SessionProvider); ok && b.sessionProviderContext != nil {
		return sessionProvider.FlushSession(b.sessionProviderContext, sessionUuid)
	}
	return nil
}

func (b *AbstractPatch) FinishSession(sessionUuid string) (err error) {
	if sessionProvider, ok := b.Target().(model.SessionProvider); ok && b.sessionProviderContext != nil {
		err = sessionProvider.FinishSession(b.sessionProviderContext, sessionUuid)
	}
	if lockBranchProvider, ok := b.Target().(model.LockBranchProvider); ok && b.lockSession != "" {
		log.Logger(b.lockSessionProviderContext).Info("Unlocking branch with session " + b.lockSession)
		err = lockBranchProvider.UnlockBranch(b.lockSessionProviderContext, b.lockSession)
	}
	return
}

func (b *AbstractPatch) HasTransfers() bool {
	_, ok1 := model.AsDataSyncSource(b.Source())
	_, ok2 := model.AsDataSyncTarget(b.Target())
	return ok1 && ok2
}

func (b *AbstractPatch) SkipFilterToTarget(skip bool) {
	b.skipFilterToTarget = skip
}

// PostFilter gets or sets a callback to be triggered after filtering
func (b *AbstractPatch) PostFilter(f ...func() error) []func() error {
	if len(f) > 0 {
		b.postFilter = append(b.postFilter, f...)
	}
	return b.postFilter
}

func (b *AbstractPatch) zapSource() zapcore.Field {
	return model.ZapEndpoint("source", b.Source())
}

func (b *AbstractPatch) zapTarget() zapcore.Field {
	return model.ZapEndpoint("target", b.Target())
}
