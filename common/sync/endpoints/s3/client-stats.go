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

package s3

import (
	"context"
	"sync"
	"time"

	"go.uber.org/zap"

	"github.com/pydio/cells/v4/common/log"
	"github.com/pydio/cells/v4/common/proto/tree"
)

type input struct {
	path string
	info *fileInfo
}

type statBatcher struct {
	batchCtx context.Context
	c        *Client
	pending  []*input
	size     int
	walker   func(path string, info *fileInfo, node tree.N) error
}

func (b *statBatcher) push(n *input) error {
	b.pending = append(b.pending, n)
	if len(b.pending) >= b.size {
		return b.flush()
	}
	return nil
}

func (b *statBatcher) flush() error {
	if len(b.pending) == 0 {
		return nil
	}

	results := make([]*tree.Node, len(b.pending))

	process := b.pending
	b.pending = b.pending[0:0]
	wg := &sync.WaitGroup{}
	wg.Add(len(process))
	t := time.Now()
	log.Logger(b.batchCtx).Debug("Sending LoadNodes in parallel", zap.Int("n", b.size))
	for i, in := range process {
		go func(idx int, input *input) {
			defer wg.Done()
			if tN, e := b.c.loadNode(b.batchCtx, input.path, !input.info.isDir); e == nil {
				results[idx] = tN
			} else {
				results[idx] = nil
			}
		}(i, in)
	}
	wg.Wait()
	log.Logger(b.batchCtx).Debug("Finished sending LoadNodes in parallel", zap.Duration("d", time.Since(t)))
	for i, n := range results {
		if n == nil {
			continue
		}
		e := b.walker(process[i].path, process[i].info, n)
		if e != nil {
			return e
		}
	}
	return nil
}
