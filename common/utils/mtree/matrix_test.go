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
	"testing"

	"github.com/smartystreets/goconvey/convey"
)

var (
	mockMatrix *Matrix
)

func init() {

	// | 65 82 | matrix corresponds to the node 2.4.3 in materialized path
	// | 23 29 |
	mockMatrix = &Matrix{
		{big.NewInt(65), big.NewInt(82)},
		{big.NewInt(23), big.NewInt(29)},
	}
}

func TestMatrix(t *testing.T) {

	convey.Convey("Test creation of a matrix", t, func() {
		m := NewMatrix(big.NewInt(65), big.NewInt(82), big.NewInt(23), big.NewInt(29))

		convey.So(m, convey.ShouldResemble, mockMatrix)
	})

	convey.Convey("Test creation of a matrix from materialised path", t, func() {
		f := NewFractionFromMaterializedPath(2, 4, 3)
		sf := NewFractionFromMaterializedPath(2, 4, 4)

		m := NewMatrix(f.Num(), sf.Num(), f.Den(), sf.Den())

		convey.So(m, convey.ShouldResemble, mockMatrix)
	})

	convey.Convey("Test multiplication of two matrices 1", t, func() {
		pf := NewFractionFromMaterializedPath(2, 4)
		spf := NewFractionFromMaterializedPath(2, 5)

		f := invert(NewFractionFromMaterializedPath(3))
		sf := invert(NewFractionFromMaterializedPath(4))

		m1 := NewMatrix(pf.Num(), spf.Num(), pf.Den(), spf.Den())
		m2 := NewMatrix(f.Num(), sf.Num(), f.Den(), sf.Den())

		// So we multiply the matrix of the materialized path 2.4 by 3
		// And it should give us the result of 2.4.3
		m := multiply(m1, m2)
		convey.So(m, convey.ShouldResemble, mockMatrix)
	})

	convey.Convey("Test multiplication of two matrices 2", t, func() {
		pf := NewFractionFromMaterializedPath(2)
		spf := NewFractionFromMaterializedPath(3)

		f := invert(NewFractionFromMaterializedPath(4, 3))
		sf := invert(NewFractionFromMaterializedPath(4, 4))

		m1 := NewMatrix(pf.Num(), spf.Num(), pf.Den(), spf.Den())
		m2 := NewMatrix(f.Num(), sf.Num(), f.Den(), sf.Den())

		newf := NewFractionFromMaterializedPath(2, 4, 3)
		newspf := NewFractionFromMaterializedPath(2, 4, 4)

		// So we multiply the matrix of the materialized path 2 by 4.3
		// And it should give us the result of 2.4.3
		m := multiply(m1, m2)
		convey.So(m, convey.ShouldResemble, NewMatrix(newf.Num(), newspf.Num(), newf.Den(), newspf.Den()))
	})

	convey.Convey("Test multiplication of two matrices 3", t, func() {
		pf := NewFractionFromMaterializedPath(2, 4, 1, 10)
		spf := NewFractionFromMaterializedPath(2, 4, 1, 11)

		f := invert(NewFractionFromMaterializedPath(3, 4, 15, 1, 3))
		sf := invert(NewFractionFromMaterializedPath(3, 4, 15, 1, 4))

		m1 := NewMatrix(pf.Num(), spf.Num(), pf.Den(), spf.Den())
		m2 := NewMatrix(f.Num(), sf.Num(), f.Den(), sf.Den())

		newf := NewFractionFromMaterializedPath(2, 4, 1, 10, 3, 4, 15, 1, 3)
		newspf := NewFractionFromMaterializedPath(2, 4, 1, 10, 3, 4, 15, 1, 4)

		// So we multiply the matrix of the materialized path 2.4.1.10 by 3.4.15.1.3
		// And it should give us the result of 2.4.1.10.3.4.15.1.3
		m := multiply(m1, m2)
		convey.So(m, convey.ShouldResemble, NewMatrix(newf.Num(), newspf.Num(), newf.Den(), newspf.Den()))
	})

	convey.Convey("Test moving subtree", t, func() {
		// We want to move everything in 1.6.5 to 2.4.3

		// First we retrieve the parent matrices
		pff := NewFractionFromMaterializedPath(1, 6)
		pfsf := NewFractionFromMaterializedPath(1, 7)

		ptf := NewFractionFromMaterializedPath(2, 4)
		ptsf := NewFractionFromMaterializedPath(2, 5)

		mpf := NewMatrix(pff.Num(), pfsf.Num(), pff.Den(), pfsf.Den())
		mpt := NewMatrix(ptf.Num(), ptsf.Num(), ptf.Den(), ptsf.Den())

		// ---------------------
		// Testing with Root
		// ---------------------
		ff := NewFractionFromMaterializedPath(1, 6, 5)
		fsf := NewFractionFromMaterializedPath(1, 6, 6)
		mf := NewMatrix(ff.Num(), fsf.Num(), ff.Den(), fsf.Den())

		mt := MoveSubtree(mpf, big.NewInt(3), mpt, big.NewInt(5), mf)

		// Checking
		convey.So(mt, convey.ShouldResemble, mockMatrix)

		// ----------------------------------
		// Testing 3.1.10 path inside 1.6.5
		// ----------------------------------
		ff = NewFractionFromMaterializedPath(1, 6, 5, 3, 1, 10)
		fsf = NewFractionFromMaterializedPath(1, 6, 5, 3, 1, 11)
		mf = NewMatrix(ff.Num(), fsf.Num(), ff.Den(), fsf.Den())

		mt = MoveSubtree(mpf, big.NewInt(3), mpt, big.NewInt(5), mf)

		// Checking
		tf := NewFractionFromMaterializedPath(2, 4, 3, 3, 1, 10)
		tsf := NewFractionFromMaterializedPath(2, 4, 3, 3, 1, 11)

		convey.So(mt, convey.ShouldResemble, NewMatrix(tf.Num(), tsf.Num(), tf.Den(), tsf.Den()))

	})
}
