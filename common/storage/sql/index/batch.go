/*
 * Copyright (c) 2024. Abstrium SAS <team (at) pydio.com>
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

package index

import "github.com/pydio/cells/v5/common/proto/tree"

// BatchSend sql structure
type BatchSend struct {
	in  chan tree.ITreeNode
	out chan error
}

// NewBatchSend Creation of the channels
func NewBatchSend() *BatchSend {
	b := new(BatchSend)
	b.in = make(chan tree.ITreeNode)
	b.out = make(chan error, 1)

	return b
}

// Send a node to the batch
func (b *BatchSend) Send(arg interface{}) {
	if node, ok := arg.(tree.ITreeNode); ok {
		b.in <- node
	}
}

// Close the Batch
func (b *BatchSend) Close() error {
	close(b.in)

	err := <-b.out

	return err
}
