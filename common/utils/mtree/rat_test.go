package mtree

import (
	"math/big"
	"testing"

	"github.com/smartystreets/goconvey/convey"
)

var (
	mockRat *Rat
)

func init() {

	// 48 / 17 corresponds to the node 2.4.2 in materialized path
	mockRat = NewRat()
	mockRat.Rat = big.NewRat(48, 17)
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

		rp2 := NewRat()
		rp2.SetMPath(1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 2)

		rc1 := NewRat()
		rc1.SetMPath(1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 1, 1)

		cmp1 := rc1.Cmp(rp1.Rat)
		cmp2 := rc1.Cmp(rp2.Rat)

		convey.So(rp1, convey.ShouldNotResemble, rc1)
		convey.So(cmp1, convey.ShouldEqual, 1)
		convey.So(cmp2, convey.ShouldEqual, -1)
	})

}
