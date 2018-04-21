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
	"sync"

	radix "github.com/armon/go-radix"
	"github.com/pkg/errors"
	"github.com/pydio/cells/common/proto/tree"
	"golang.org/x/sync/errgroup"
)

type computeResolver interface {
	Compute(ctx context.Context, left, right EndpointClient) error
	Resolve(context.Context) error
}

type diffMergeView interface {
	Insert(string, *idempotentAction)
	Delete(string)
	Get(string) (*idempotentAction, bool)
	ResolveSubtree(context.Context, string) error
}

// Resolver knows how to resolve out-of-sync nodes
type Resolver interface {
	Resolve(context.Context) error // NOTE:  MUST be idempotent
}

type commitGetter interface {
	GetCommits() []*tree.ChangeLog
}

type vchain []*tree.ChangeLog

func (v vchain) Head() *tree.ChangeLog { return v[len(v)-1] }

func (v vchain) Contains(l *tree.ChangeLog) (ok bool) {
	for _, val := range v {
		if val.Uuid == l.Uuid {
			ok = true
			break
		}
	}

	return
}

func cmpVersion(n, u commitGetter) (int, error) {
	var nc, uc vchain
	nc = n.GetCommits()
	uc = u.GetCommits()

	if nc.Head() == uc.Head() {
		return 0, nil
	}

	if nc.Contains(uc.Head()) {
		return 1, nil
	}

	if uc.Contains(nc.Head()) {
		return -1, nil
	}

	return 0, errors.New("disjoint version chains")
}

type idempotentAction struct {
	nodeView
	ran bool
	err error
	fn  func(context.Context) error
}

func newAction(n nodeView, f func(context.Context) error) *idempotentAction {
	return &idempotentAction{
		nodeView: n,
		fn:       f,
	}
}

func (a *idempotentAction) Resolve(ctx context.Context) error {

	if !a.ran {
		select {
		case <-ctx.Done():
			return errors.New("context expired")
		default:
			a.err = a.fn(ctx)
			a.ran = true
		}
	}

	return a.err

}

type diffTree struct {
	delSet uuidContainer
	tree   *radix.Tree
}

func (d *diffTree) Get(path string) (a *idempotentAction, ok bool) {
	var v interface{}
	if v, ok = d.tree.Get(path); ok {
		a = v.(*idempotentAction)
	}
	return
}

func (d *diffTree) Insert(path string, a *idempotentAction) {
	// We don't care about overwriting previous values.  In fact, it's expected.
	_, _ = d.tree.Insert(path, a)
}

func (d *diffTree) Delete(path string) {
	_, _ = d.tree.Delete(path)
}

func (d *diffTree) ResolveSubtree(ctx context.Context, path string) (err error) {
	d.tree.WalkPrefix(path, func(_ string, v interface{}) bool {
		if err = v.(*idempotentAction).Resolve(ctx); err != nil {
			return true
		}
		return false
	})
	return
}

func (d *diffTree) Compute(ctx context.Context, left, right EndpointClient) error {
	var lock sync.Mutex
	lp := mergeProcessor{diff: d, delSet: d.delSet, Mutex: &lock, local: left, remote: right}
	rp := mergeProcessor{diff: d, delSet: d.delSet, Mutex: &lock, local: right, remote: left}

	g, ctx := errgroup.WithContext(ctx)

	g.Go(func() (err error) {
		if err := mapTraversal(ctx, left, lp.Process); err != nil {
			err = errors.Wrap(err, "traverse left")
		}
		return
	})

	g.Go(func() (err error) {
		if err := mapTraversal(ctx, right, rp.Process); err != nil {
			err = errors.Wrap(err, "traverse right")
		}
		return
	})

	return g.Wait()
}

func (d *diffTree) Resolve(ctx context.Context) (err error) {
	d.tree.Walk(func(s string, v interface{}) bool {
		if err = v.(Resolver).Resolve(ctx); err != nil { // NOTE: resolve must be idempotent
			return true
		}
		return false
	})

	return
}

func newDiffTree(delSet uuidContainer) *diffTree {
	return &diffTree{
		delSet: delSet,
		tree:   radix.New(),
	}
}
