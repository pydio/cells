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

package sync

import (
	"context"
	"strings"
	"sync"

	microerr "github.com/micro/go-micro/errors"
	"github.com/pkg/errors"
	"github.com/pydio/cells/common/log"
	"github.com/pydio/cells/common/proto/tree"
	"go.uber.org/zap"
)

func version(t *tree.Node) *tree.ChangeLog {
	if t.Commits == nil || len(t.Commits) == 0 {
		return nil
	}

	return t.Commits[len(t.Commits)-1]
}

func wrapMicroErr(err error, msg string) error {
	emsg := strings.TrimRight(microerr.Parse(err.Error()).Detail, " <nil>")
	return errors.Wrap(errors.New(emsg), msg)
}

// Merger implements a one-way merge
type Merger struct {
	del   nodeSet
	abort context.CancelFunc

	Left  EndpointConfig
	Right EndpointConfig
}

// NewTwoWay creates a two-way merger
func NewTwoWay(Left, Right EndpointConfig) *Merger {
	return &Merger{
		del:   newVolatileSet(),
		Left:  Left,
		Right: Right,
	}
}

// OnLeftEvent is called when an event occurs on the left side
func (m *Merger) OnLeftEvent(ctx context.Context, event *tree.NodeChangeEvent) (err error) {
	log.Logger(ctx).Info("Received Left Event", zap.Any("e", event))

	switch event.GetType() {
	case tree.NodeChangeEvent_READ:
		return // we don't want to abort
	case tree.NodeChangeEvent_DELETE:
		m.del.Add(event.GetSource())
	default:
	}

	m.abort()
	return
}

// OnRightEvent is called when an event occurs on the right side
func (m *Merger) OnRightEvent(ctx context.Context, event *tree.NodeChangeEvent) (err error) {
	log.Logger(ctx).Info("Received Left Event", zap.Any("e", event))

	switch event.GetType() {
	case tree.NodeChangeEvent_READ:
		return // we don't want to abort
	case tree.NodeChangeEvent_DELETE:
		m.del.Add(event.GetSource())
	default:
	}

	m.abort()
	return
}

// Resync triggers a "hard" resync of two indices, in which the Router tree is
// traversed in a recursive, descendent fashion and synchronized with its
// counterpart.  It is useful for resolving out-of-sync indices due to missed
// events.  It is called by Handler.TriggerResync
func (m *Merger) Resync(ctx context.Context) (err error) {
	ctx, m.abort = context.WithCancel(ctx)

	var dt computeResolver = newDiffTree(m.del)
	if err = dt.Compute(ctx, m.Left, m.Right); err != nil {
		err = wrapMicroErr(err, "failed to compute diff")
	} else if err = dt.Resolve(ctx); err != nil {
		err = wrapMicroErr(err, "failed to resolve diff")
	}

	return
}

type nodeView interface {
	uuidGetter
	GetPath() string
	GetCommits() []*tree.ChangeLog
}

type mergeProcessor struct {
	*sync.Mutex
	diff          diffMergeView
	delSet        uuidContainer
	local, remote EndpointClient
}

func (p mergeProcessor) insertAction(n nodeView, f func(context.Context) error) {
	p.diff.Insert(n.GetPath(), newAction(n, f))
}

func (p mergeProcessor) Log(ctx context.Context, n *tree.Node) *zap.Logger {
	return log.Logger(ctx).With(
		zap.String("path", n.GetPath()),
		zap.String("UUID", n.GetUuid()),
		zap.String("etag", n.GetEtag()),
		zap.String("local", p.local.GetRootPath()),
		zap.String("remote", p.remote.GetRootPath()),
		zap.Bool("dir", !n.IsLeaf()),
	)
}

func (p mergeProcessor) TransferObject(ctx context.Context, src *tree.Node, srcEndpoint EndpointClient, target *tree.Node, targetEndpoint EndpointClient) error {

	// TODO 1 For the moment, srcEndpoint and targetEndpoint share the same underlying config, and the node
	// path is sufficient for the router to choose how to handle copy. In the future we have to handle network
	// transfer between two different storages (local fs vs. network client).

	// TODO 2 This may be added to a pool of tasks to concurrently transfer X files

	return getTransferClient().TransferObject(ctx, src, srcEndpoint, target, targetEndpoint)

}

func (p mergeProcessor) Process(n *tree.Node) {
	// Lock the mutex that's shared across mergeProcessors
	p.Lock()
	defer p.Unlock()

	var ok bool
	var u nodeView
	if u, ok = p.diff.Get(n.GetPath()); ok {

		// a corresponding node was found in the other endpoint

		if n.IsLeaf() { // it's a file
			cmp, err := cmpVersion(n, u)
			if err != nil {
				p.insertAction(n, func(ctx context.Context) error {
					return errors.Wrap(err, "conflict")
				})
			}

			switch cmp {
			case 1: // n > u
				p.insertAction(n, func(ctx context.Context) error {
					p.Log(ctx, n).Debug("TRANSFER LOCAL NODE TO REMOTE")
					return p.TransferObject(ctx, n, p.local, u.(*tree.Node), p.remote)
				})
			case 0: // nodes in sync; nothing to do.
				p.diff.Delete(n.GetPath())
			case -1: // u > n
				p.insertAction(n, func(ctx context.Context) error {
					p.Log(ctx, n).Debug("TRANSFER REMOTE NODE TO LOCAL")
					return p.TransferObject(ctx, u.(*tree.Node), p.remote, n, p.local)
				})
			}

		} else if vchain(n.GetCommits()).Head() != vchain(u.GetCommits()).Head() { // it's a directory
			p.insertAction(n, func(ctx context.Context) error {
				p.Log(ctx, n).Debug("recursing into subtree")
				return p.diff.ResolveSubtree(ctx, n.GetPath())
			})
		}

	} else {

		// no node at this path in the diff.  this is either because the other
		// EndpointClient hasn't searched this path yet, or because there's no
		// corresponding node.  if there's no corresponding node, the node may
		// have been deleted.

		if p.delSet.Contains(n) { // node was deleted
			p.insertAction(n, func(ctx context.Context) error {
				return p.local.DeleteNode(ctx, n)
			})
		} else {
			p.insertAction(n, func(ctx context.Context) error {
				// assume there's no corresponing node on the other side and
				// schedule a `CreateNode` operation on the remote endpoint.
				// If we later find a node, we'll replace it with the
				// appropriate action.
				if n.IsLeaf() {
					p.Log(ctx, n).Debug("TRANSFER LOCAL NODE TO REMOTE")
					return p.TransferObject(ctx, n, p.local, u.(*tree.Node), p.remote)
				} else {
					p.Log(ctx, n).Debug("CREATE FOLDER")
					return p.remote.CreateNode(ctx, n)
				}
			})
		}

	}
}
