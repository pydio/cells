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

import (
	"fmt"
	"strings"
)

type LostAndFound interface {
	fmt.Stringer
	IsDuplicate() bool
	IsLostParent() bool
	IsDir() bool

	GetUUIDs() []string
	MarkForDeletion([]string)
}

type lostFoundImpl struct {
	uuids     []string
	lostMPath string
	leaf      bool
}

func (l *lostFoundImpl) String() string {
	if l.IsDuplicate() {
		return "Duplicates : " + strings.Join(l.uuids, ", ")
	} else {
		return "Lost parent for node : " + l.uuids[0] + "(" + l.lostMPath + ")"
	}
}

func (l *lostFoundImpl) IsDir() bool {
	return l.leaf
}

func (l *lostFoundImpl) IsDuplicate() bool {
	return len(l.lostMPath) == 0
}

func (l *lostFoundImpl) IsLostParent() bool {
	return len(l.lostMPath) > 0
}

func (l *lostFoundImpl) GetUUIDs() []string {
	return l.uuids
}

func (l *lostFoundImpl) MarkForDeletion(uuids []string) {
	l.uuids = uuids
}
