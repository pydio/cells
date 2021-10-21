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

import "math/big"

type Matrix [][]*big.Int

func NewMatrix(m00 *big.Int, m01 *big.Int, m10 *big.Int, m11 *big.Int) *Matrix {
	return &Matrix{
		{m00, m01},
		{m10, m11},
	}
}

func (m Matrix) GetA11() *big.Int {
	return m[0][0]
}

func (m Matrix) GetA12() *big.Int {
	return m[1][0]
}

func (m Matrix) GetA21() *big.Int {
	return m[0][1]
}

func (m Matrix) GetA22() *big.Int {
	return m[1][1]
}

func multiply(m1 *Matrix, m2 *Matrix) *Matrix {

	var mul1, mul2, add1, add2, add3, add4 big.Int

	return NewMatrix(
		add1.Add(mul1.Mul(m1.GetA11(), m2.GetA11()), mul2.Mul(m1.GetA21(), m2.GetA12())),
		add2.Add(mul1.Mul(m1.GetA11(), m2.GetA21()), mul2.Mul(m1.GetA21(), m2.GetA22())),
		add3.Add(mul1.Mul(m1.GetA12(), m2.GetA11()), mul2.Mul(m1.GetA22(), m2.GetA12())),
		add4.Add(mul1.Mul(m1.GetA12(), m2.GetA21()), mul2.Mul(m1.GetA22(), m2.GetA22())),
	)
}

func invertMatrix(m1 *Matrix) *Matrix {

	var neg1, neg2 big.Int

	return NewMatrix(
		neg1.Neg(m1.GetA22()),
		m1.GetA21(),
		m1.GetA12(),
		neg2.Neg(m1.GetA11()),
	)
}

func MoveSubtree(p0 *Matrix, m *big.Int, p1 *Matrix, n *big.Int, M *Matrix) *Matrix {
	var sub big.Int
	return multiply(multiply(multiply(p1, NewMatrix(one, fraczero, sub.Sub(m, n), one)), invertMatrix(p0)), M)
}
