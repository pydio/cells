package mtree

import (
	"math/big"
	"testing"

	"github.com/smartystreets/goconvey/convey"
)

var (
	mockFraction *Fraction
)

func init() {

	// 48 / 17 corresponds to the node 2.4.2 in materialized path
	mockFraction = &Fraction{
		big.NewInt(48),
		big.NewInt(17),
	}
}

func TestFraction(t *testing.T) {

	convey.Convey("Test New Fraction", t, func() {
		f := NewFraction(big.NewInt(48), big.NewInt(17))

		convey.So(f, convey.ShouldResemble, mockFraction)
	})

	convey.Convey("Test New Fraction from path", t, func() {
		f := NewFractionFromMaterializedPath(2, 4, 2)

		convey.So(f, convey.ShouldResemble, mockFraction)

	})

	convey.Convey("Test Revert Fraction to Path", t, func() {

		p := ToPath(mockFraction)

		convey.So(p, convey.ShouldResemble, "2.4.2")
	})

	convey.Convey("Test Revert Fraction to PathUInt", t, func() {

		p := ToPathUint(mockFraction)
		ref := []uint64{2, 4, 2}
		convey.So(p, convey.ShouldResemble, ref)
	})

	convey.Convey("Test Decimal Fraction", t, func() {

		d := mockFraction.Decimal()

		convey.So(d.FloatString(30), convey.ShouldResemble, "2.823529411764705882352941176471")
	})

	convey.Convey("Test bigint", t, func() {
		var i big.Int
		var j big.Int
		var diff big.Rat
		var float big.Float

		i.SetString("111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111211111111111111111111111111111111111111111111112111111111111111111111111111111111111111111111121111111111111111", 10)
		j.SetString("1111111111111111111111111111112111111111111111111111111111111111111111111111121111111111111111111111111111111111111111111111211111111111111111111111111111111111111111111112111111111111111111111111111111111111111111111121111111111111111111111111111111111111111111111211111111111111111111111111111111111111111111112111111111111111111111111111111111111111111111121111111111111111111111111111111111111111111111211111111111111111111111111111111111111111111112111111111111111111111111111111111111111111111121111111111111111111111111111111111111111111111211111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111", 10)

		diff.SetFrac(&i, &j)
		float.SetString(diff.FloatString(800))
	})
}
