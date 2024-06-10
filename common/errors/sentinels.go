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

package errors

import (
	"slices"

	"gitlab.com/tozd/go/errors"
)

var (
	leafErrors []*leafError
	reversed   []*leafError
)

type Leaf interface {
	error
	Name() string
	Err() error
	Parent() error
}

func RegisterBaseSentinel(parent error, name string) error {
	for _, n := range leafErrors {
		if n.name == name {
			panic("duplicate register base for error: " + n.name)
		}
	}
	err := errors.BaseWrap(parent, name)
	leafErrors = append(leafErrors, &leafError{name, err, parent})
	return err
}

func ByName(name string) error {
	for _, n := range leafErrors {
		if n.name == name {
			return n.err
		}
	}
	return nil
}

func AsLeafs(er error) (ee []Leaf) {
	parents := make(map[error]bool)

	if reversed == nil {
		reversed = make([]*leafError, len(leafErrors))
		copy(reversed, leafErrors)
		slices.Reverse(reversed)
	}
	for _, n := range reversed {
		if Is(er, n.err) {
			if _, o := parents[n.err]; !o {
				ee = append(ee, n)
			}
			parents[n.parent] = true
		}
	}
	return
}

type leafError struct {
	name   string
	err    error
	parent error
}

func (l *leafError) Name() string {
	return l.name
}

func (l *leafError) Error() string {
	return l.err.Error()
}

func (l *leafError) Parent() error {
	return l.parent
}

func (l *leafError) Err() error {
	return l.err
}
