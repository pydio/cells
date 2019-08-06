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
	"math"
	"path"
	"sort"
	"strings"

	"github.com/pydio/cells/common/proto/tree"
	"github.com/pydio/cells/common/utils/mtree"
	"go.uber.org/zap/zapcore"
)

const (
	maxUint = ^uint(0)
	maxInt  = int(maxUint >> 1)
)

type Move struct {
	deleteOp Operation
	createOp Operation
	dbNode   *tree.Node
}

// ByAge implements sort.Interface based on the Age field.
type bySourceDeep []*Move

func (a bySourceDeep) Len() int { return len(a) }
func (a bySourceDeep) folderDepth(m *Move) int {
	return len(strings.Split(strings.Trim(m.deleteOp.GetRefPath(), "/"), "/"))
}
func (a bySourceDeep) Less(i, j int) bool {
	return a.folderDepth(a[i]) > a.folderDepth(a[j])
}
func (a bySourceDeep) Swap(i, j int) {
	a[i], a[j] = a[j], a[i]
}

func (m *Move) MarshalLogObject(encoder zapcore.ObjectEncoder) error {
	if m == nil {
		return nil
	}
	encoder.AddString("From", m.deleteOp.GetRefPath())
	encoder.AddString("To", m.createOp.GetRefPath())
	encoder.AddObject("DbNode", m.dbNode)
	return nil
}

func (m *Move) Closeness() int {
	sep := "/"
	left := m.deleteOp.GetRefPath()
	right := m.createOp.GetRefPath()
	if left == right {
		return maxInt
	}
	pref := mtree.CommonPrefix(sep[0], left, right)
	prefFactor := len(strings.Split(pref, sep))
	// Overall path similarity
	lParts := strings.Split(left, sep)
	rParts := strings.Split(right, sep)
	max := math.Max(float64(len(lParts)), float64(len(rParts)))
	dist := 1
	for i := 0; i < int(max); i++ {
		pL, pR := "", ""
		if i < len(lParts) {
			pL = lParts[i]
		}
		if i < len(rParts) {
			pR = rParts[i]
		}
		if pL == pR {
			dist += 5
		}
	}
	return dist * prefFactor
}

func (m *Move) SameBase() bool {
	return path.Base(m.deleteOp.GetRefPath()) == path.Base(m.createOp.GetRefPath())
}

func sortClosestMoves(possibleMoves []*Move) (moves []*Move) {

	// Dedup by source
	greatestSource := make(map[string]*Move)
	targets := make(map[string]bool)
	sort.Sort(bySourceDeep(possibleMoves))
	for _, m := range possibleMoves {
		source := m.deleteOp.GetRefPath()
		for _, m2 := range possibleMoves {
			byT, ok := greatestSource[source]
			source2 := m2.deleteOp.GetRefPath()
			target2 := m2.createOp.GetRefPath()
			if source2 != source {
				continue
			}
			if _, alreadyUsed := targets[target2]; alreadyUsed {
				continue
			}
			if !ok || m2.Closeness() > byT.Closeness() || m2.SameBase() && !byT.SameBase() {
				greatestSource[source] = m2
			}
		}
		if m, ok := greatestSource[source]; ok {
			targets[m.createOp.GetRefPath()] = true
		}
	}

	// Dedup by target
	greatestTarget := make(map[string]*Move)
	for _, m := range greatestSource {
		byT, ok := greatestTarget[m.createOp.GetRefPath()]
		if !ok || m.Closeness() > byT.Closeness() {
			greatestTarget[m.createOp.GetRefPath()] = m
		}
	}

	for _, m := range greatestTarget {
		moves = append(moves, m)
	}

	return
}
