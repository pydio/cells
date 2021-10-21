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

package mtree

import (
	"math/big"
)

// Float type
type Rat struct {
	*big.Rat
}

var (
	int0 = big.NewInt(0)
	int1 = big.NewInt(1)
	rat0 = Rat{big.NewRat(0, 1)}
	rat1 = Rat{big.NewRat(1, 1)}
)

func NewRat() *Rat {
	r := new(Rat)
	r.Rat = new(big.Rat)

	return r
}

// SetMPath sets the value of the float based on the materialized path given
func (f *Rat) SetMPath(path ...uint64) *Rat {
	if len(path) == 0 {
		return f
	}

	f.Rat.SetFrac64(int64(path[len(path)-1]), 1)

	current := new(big.Rat)
	for i := len(path) - 2; i >= 0; i-- {
		current.SetFrac64(int64(path[i]), 1)
		f.Inv(f.Rat)
		f.Add(rat1.Rat, f.Rat)
		f.Inv(f.Rat)
		f.Add(current, f.Rat)
	}

	return f
}
