package mtree

import (
	"math/big"
	"testing"

	"github.com/smartystreets/goconvey/convey"
)

var (
	mockFloat *Float
)

func init() {
	// 48 / 17 corresponds to the node 2.4.2 in materialized path
	mockFloat = NewFloat()
	mockFloat.SetRat(big.NewRat(48, 17))

}

func TestFloat(t *testing.T) {

	convey.Convey("Test SetRat", t, func() {
		f := NewFloat()
		f.SetRat(mockRat.Rat)

		convey.So(f, convey.ShouldResemble, mockFloat)
	})

	convey.Convey("Small test", t, func() {
		rp1 := new(Rat)
		rp1.SetMPath(1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 1)

		rp2 := new(Rat)
		rp2.SetMPath(1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 2)

		rc1 := new(Rat)
		rc1.SetMPath(1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 1, 100000000000000)

		rc2 := new(Rat)
		rc2.SetMPath(1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 1, 100000000000001)

		fp1, fp2, fc1, fc2 := NewFloat(), NewFloat(), NewFloat(), NewFloat()
		fp1.SetRat(rp1.Rat)
		fp2.SetRat(rp2.Rat)
		fc1.SetRat(rc1.Rat)
		fc2.SetRat(rc2.Rat)
	})

	convey.Convey("Test Float Comparison", t, func() {
		rp1 := new(Rat)
		rp1.SetMPath(1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 1)

		rp2 := new(Rat)
		rp2.SetMPath(1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 2)

		rc1 := new(Rat)
		rc1.SetMPath(1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 1, 1)

		fp1, fp2, fc1 := NewFloat(), NewFloat(), NewFloat()
		fp1.SetRat(rp1.Rat)
		fp2.SetRat(rp2.Rat)
		fc1.SetRat(rc1.Rat)

		cmp1 := fc1.Cmp(fp1.Float)
		cmp2 := fc1.Cmp(fp2.Float)

		convey.So(fp1, convey.ShouldNotResemble, fc1)
		convey.So(cmp1, convey.ShouldEqual, 1)
		convey.So(cmp2, convey.ShouldEqual, -1)
	})

	convey.Convey("Test Float Comparison - Even bigger", t, func() {
		rp1 := new(Rat)
		rp1.SetMPath(200, 200, 200, 200, 200, 200, 200, 200, 200, 200, 200, 200, 200, 200, 200, 200, 200, 200, 200, 200, 200, 200, 200, 200, 200, 200, 200, 200, 200, 200, 200, 200, 200, 200, 200, 200, 200, 200, 200, 1)

		rp2 := new(Rat)
		rp2.SetMPath(200, 200, 200, 200, 200, 200, 200, 200, 200, 200, 200, 200, 200, 200, 200, 200, 200, 200, 200, 200, 200, 200, 200, 200, 200, 200, 200, 200, 200, 200, 200, 200, 200, 200, 200, 200, 200, 200, 200, 2)

		rc1 := new(Rat)
		rc1.SetMPath(200, 200, 200, 200, 200, 200, 200, 200, 200, 200, 200, 200, 200, 200, 200, 200, 200, 200, 200, 200, 200, 200, 200, 200, 200, 200, 200, 200, 200, 200, 200, 200, 200, 200, 200, 200, 200, 200, 200, 1, 1)

		// Resetting precision to support the big rat
		fp1, fp2, fc1 := NewFloat(), NewFloat(), NewFloat()
		fp1.SetPrec(1024)
		fp2.SetPrec(1024)
		fc1.SetPrec(1024)
		fp1.SetRat(rp1.Rat)
		fp2.SetRat(rp2.Rat)
		fc1.SetRat(rc1.Rat)

		cmp1 := fc1.Cmp(fp1.Float)
		cmp2 := fc1.Cmp(fp2.Float)

		convey.So(fp1, convey.ShouldNotResemble, fc1)
		convey.So(cmp1, convey.ShouldEqual, 1)
		convey.So(cmp2, convey.ShouldEqual, -1)
	})
}
