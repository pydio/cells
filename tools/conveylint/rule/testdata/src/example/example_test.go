package example

import (
	"testing"

	cv "github.com/smartystreets/goconvey/convey"
)

func TestWithConvey(t *testing.T) {
	cv.Convey("works", t, func() {})
}

func TestWithoutConvey(t *testing.T) { // want "test must call GoConvey"
	t.Log("missing")
}

func TestWithOtherFunction(t *testing.T) { // want "test must call GoConvey"
	fake{}.Convey("not GoConvey")
}

type fake struct{}

func (fake) Convey(string) {}

func helper() {}
