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
	"sync"
	"time"

	"go.uber.org/zap"

	"github.com/pydio/cells/common/log"
	"github.com/pydio/cells/common/proto/tree"
)

type input struct {
	path string
	info *S3FileInfo
}

type statBatcher struct {
	c       *Client
	pending []*input
	size    int
	walker  func(path string, info *S3FileInfo, node *tree.Node)
}

func (b *statBatcher) push(n *input) {
	b.pending = append(b.pending, n)
	if len(b.pending) >= b.size {
		b.flush()
	}
}

func (b *statBatcher) flush() {
	if len(b.pending) == 0 {
		return
	}

	results := make([]*tree.Node, len(b.pending))

	process := b.pending
	b.pending = b.pending[0:0]
	wg := &sync.WaitGroup{}
	wg.Add(len(process))
	t := time.Now()
	log.Logger(b.c.globalContext).Debug("Sending Loadnodes in parallel", zap.Int("n", b.size))
	for i, in := range process {
		go func(idx int, input *input) {
			defer wg.Done()
			if tN, e := b.c.loadNode(b.c.globalContext, input.path, !input.info.isDir); e == nil {
				results[idx] = tN
			} else {
				results[idx] = nil
			}
		}(i, in)
	}
	wg.Wait()
	log.Logger(b.c.globalContext).Debug("Finished sending Loadnodes in parallel", zap.Duration("d", time.Since(t)))
	for i, n := range results {
		if n == nil {
			continue
		}
		b.walker(process[i].path, process[i].info, n)
	}

}
