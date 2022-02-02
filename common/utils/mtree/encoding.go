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

// Package mtree provides advanced tools for encoding tree paths in a material format
package mtree

import (
	"sync"

	"github.com/pydio/cells/v4/common/proto/tree"
)

// TreeNode definition
type TreeNode struct {
	*tree.Node
	mutex *sync.RWMutex
	MPath MPath
	//rat   *Rat
	//srat  *Rat
	Level int
}

// NewTreeNode wraps a node with its rational equivalent of the mpath
func NewTreeNode() *TreeNode {
	t := new(TreeNode)
	t.Node = new(tree.Node)
	t.MPath = MPath{}
	// t.rat = NewRat()
	// t.srat = NewRat()
	t.mutex = &sync.RWMutex{}

	return t
}

// SetMeta sets a meta using a lock
func (t *TreeNode) SetMeta(name string, value interface{}) {
	t.mutex.RLock()
	defer t.mutex.RUnlock()

	t.Node.MustSetMeta(name, value)
}

// GetMeta gets a meta from a meta store using the lock
func (t *TreeNode) GetMeta(name string, value interface{}) {
	t.mutex.Lock()
	defer t.mutex.Unlock()

	t.Node.GetMeta(name, value)
}

// SetName records the name of the node in the metastore (uses a lock)
func (t *TreeNode) SetName(name string) {
	t.SetMeta("name", name)
}

// Name from the metastore (uses a rwlock)
func (t *TreeNode) Name() string {
	var name string
	t.GetMeta("name", &name)
	return name
}

// Bytes encoding of the rational
// func (t *TreeNode) Bytes() []byte {
// 	b, _ := t.rat.GobEncode()

// 	return b
// }

// NV represents the numerator value of the rational
// func (t *TreeNode) NV() *big.Int {
// 	return t.rat.Num()
// }

// // DV represents the denominator value of the rational
// func (t *TreeNode) DV() *big.Int {
// 	return t.rat.Denom()
// }

// // SNV represents the numerator value of the node sibling
// func (t *TreeNode) SNV() *big.Int {
// 	return t.srat.Num()
// }

// // SDV represents the denominator value of the node sibling
// func (t *TreeNode) SDV() *big.Int {
// 	return t.srat.Denom()
// }

// SetMPath triggers the calculation of the rat representation and the sibling rat representation for the node
func (t *TreeNode) SetMPath(mpath ...uint64) {
	t.MPath = MPath(mpath)

	// smpath := t.MPath.Sibling()

	// t.rat.SetMPath(mpath...)
	// t.srat.SetMPath(smpath...)

	t.Level = len(mpath)
}

// SetRat triggers the calculation of the mpath based on the rational value given for the node
// func (t *TreeNode) SetRat(rat *Rat) {
// 	mpath := MPath{}

// 	for rat.Cmp(rat0.Rat) == 1 {
// 		f, _ := rat.Float64()
// 		i := int64(f)
// 		u := uint64(f)

// 		mpath = append(mpath, u)

// 		r := NewRat()
// 		r.SetFrac(big.NewInt(i), int1)

// 		rat.Sub(rat.Rat, r.Rat)

// 		if rat.Cmp(rat0.Rat) == 0 {
// 			break
// 		}

// 		rat.Inv(rat.Rat)
// 		rat.Sub(rat.Rat, rat1.Rat)
// 		rat.Inv(rat.Rat)
// 	}

// 	t.SetMPath(mpath...)
// }

// // SetBytes decodes the byte representation of the rat and applies it to the current node
// func (t *TreeNode) SetBytes(b []byte) {
// 	r := NewRat()
// 	r.GobDecode(b)

// 	t.SetRat(r)
// }
