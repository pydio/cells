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

// Gob codec version. Permits backward-compatible changes to the encoding.
const floatGobVersion byte = 1

// Float type
type Float struct {
	*big.Float
}

// NewFloat returns a big Float with a 512 precision
func NewFloat() *Float {
	f := new(Float)
	f.Float = new(big.Float)

	f.SetPrec(512)

	return f
}

// Nat representation of a float
func (f *Float) Nat() Nat {
	nat := new(Nat)

	b, _ := f.GobEncode()

	*nat = nat.setBytes(b[10:])

	return Nat(*nat)
}
