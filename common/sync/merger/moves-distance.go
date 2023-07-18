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

package merger

import (
	"github.com/pydio/cells/v4/common/proto/tree"
	"math"
	"path"
	"sort"
	"strings"

	"github.com/pydio/cells/v4/common/utils/mtree"
	"go.uber.org/zap/zapcore"
)

const (
	maxUint = ^uint(0)
	maxInt  = int(maxUint >> 1)
)

type Move struct {
	deleteOp Operation
	createOp Operation
	dbNode   tree.N

	source     string
	target     string
	depth      int
	similarity int
}

func (m *Move) folderDepth() int {
	return len(strings.Split(strings.Trim(m.source, "/"), "/"))
}

func (m *Move) prepare() {
	m.source = m.deleteOp.GetRefPath()
	m.target = m.createOp.GetRefPath()
	m.depth = m.folderDepth()
	m.similarity = m.closeness()
}

func (m *Move) closeness() int {
	sep := "/"
	if m.source == m.target {
		return maxInt
	}
	pref := mtree.CommonPrefix(sep[0], m.source, m.target)
	prefFactor := len(strings.Split(pref, sep))
	// Overall path similarity
	lParts := strings.Split(m.source, sep)
	rParts := strings.Split(m.target, sep)
	reverseStringSlice(lParts)
	reverseStringSlice(rParts)

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

func (m *Move) MarshalLogObject(encoder zapcore.ObjectEncoder) error {
	if m == nil {
		return nil
	}
	encoder.AddString("From", m.deleteOp.GetRefPath())
	encoder.AddString("To", m.createOp.GetRefPath())
	return encoder.AddObject("DbNode", m.dbNode.AsProto())
}

func (m *Move) SameBase() bool {
	return path.Base(m.deleteOp.GetRefPath()) == path.Base(m.createOp.GetRefPath())
}

// sortClosestMoves currently has an exponential complexity
// it should be rewritten as moving tons of files with similar eTag
// will inflate cpu/memory usage very quickly
func sortClosestMoves(possibleMoves []*Move) (moves []*Move) {

	l := len(possibleMoves)
	bySources := make(map[string][]*Move)
	for _, m := range possibleMoves {
		m.prepare()
		bySources[m.source] = append(bySources[m.source], m)
	}
	for _, mm := range bySources {
		sort.Slice(mm, func(i, j int) bool {
			return mm[i].depth > mm[j].depth
		})
	}

	// Dedup by source
	greatestSource := make(map[string]*Move, l)
	targets := make(map[string]struct{}, l)
	sort.Slice(possibleMoves, func(i, j int) bool {
		return possibleMoves[i].depth > possibleMoves[j].depth
	})
	for _, m := range possibleMoves {
		var pickedTarget string
		for _, m2 := range bySources[m.source] {
			if _, alreadyUsed := targets[m2.target]; alreadyUsed {
				continue
			}
			byT, ok := greatestSource[m.source]
			if !ok || m2.similarity > byT.similarity {
				greatestSource[m.source] = m2
				pickedTarget = m2.target
			}
		}
		if len(pickedTarget) > 0 {
			targets[pickedTarget] = struct{}{}
		}
	}

	// Dedup by target
	greatestTarget := make(map[string]*Move, l)
	for _, m := range greatestSource {
		byT, ok := greatestTarget[m.target]
		if !ok || m.similarity > byT.similarity {
			greatestTarget[m.target] = m
		}
	}

	for _, m := range greatestTarget {
		moves = append(moves, m)
	}

	return
}

func reverseStringSlice(ss []string) {
	last := len(ss) - 1
	for i := 0; i < len(ss)/2; i++ {
		ss[i], ss[last-i] = ss[last-i], ss[i]
	}
}
