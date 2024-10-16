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

import "github.com/pydio/cells/v4/common/proto/tree"

type Factory[T tree.ITreeNode] interface {
	Struct() T
	Slice() []T
	RootGroupProvider
}

type RootGroupProvider interface {
	RootGroup() string
}

type treeNodeFactory[T tree.ITreeNode] struct{}

func (*treeNodeFactory[T]) Struct() T {
	var t T
	tree.NewITreeNode(&t)
	return t
}

func (*treeNodeFactory[T]) Slice() []T {
	return []T{}
}

func (*treeNodeFactory[T]) RootGroup() string {
	var t T

	if r, ok := any(t).(RootGroupProvider); ok {
		return r.RootGroup()
	}

	return "ROOT"
}
