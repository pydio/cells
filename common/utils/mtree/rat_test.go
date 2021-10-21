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
	"fmt"
	"runtime"
	"testing"

	"github.com/smartystreets/goconvey/convey"
)

var (
	mockRat = NewRat()
)

func init() {
	// 48 / 17 corresponds to the node 2.4.2 in materialized path
	mockRat.SetFrac64(48, 17)
}

func TestRat(t *testing.T) {

	convey.Convey("Test SetMPath", t, func() {
		r := NewRat()
		r.SetMPath(2, 4, 2)

		convey.So(r, convey.ShouldResemble, mockRat)
	})

	convey.Convey("Test SetMPath", t, func() {
		rp1 := NewRat()
		rp1.SetMPath(1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 1)
		PrintMemUsage("After first node")

		rp2 := NewRat()
		rp2.SetMPath(1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 2)
		PrintMemUsage("After second node")

		rc1 := NewRat()
		rc1.SetMPath(1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 1, 1)
		PrintMemUsage("After third node")

		cmp1 := rc1.Cmp(rp1.Rat)
		cmp2 := rc1.Cmp(rp2.Rat)

		convey.So(rp1, convey.ShouldNotResemble, rc1)
		convey.So(cmp1, convey.ShouldEqual, 1)
		convey.So(cmp2, convey.ShouldEqual, -1)
	})

	PrintMemUsage("Before GC")
	runtime.GC()
	PrintMemUsage("After GC")
}

// PrintMemUsage outputs the current, total and OS memory being used. As well as the number
// of garage collection cycles completed.
func PrintMemUsage(title string) {
	var m runtime.MemStats
	runtime.ReadMemStats(&m)
	// For info on each, see: https://golang.org/pkg/runtime/#MemStats
	fmt.Println(title)
	fmt.Printf("Alloc = %v KiB", bToKb(m.Alloc))
	fmt.Printf("\tTotalAlloc = %v KiB", bToKb(m.TotalAlloc))
	fmt.Printf("\tSys = %v KiB", bToKb(m.Sys))
	fmt.Printf("\tNumGC = %v\n", m.NumGC)
}

func bToKb(b uint64) uint64 {
	return b / 1024
	// return b / 1024 / 1024
}
