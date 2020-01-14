// +build go1.10

package packages

import (
	"reflect"
	"time"

	"github.com/mattn/anko/env"
)

func timeGo110() {
	env.Packages["time"]["LoadLocationFromTZData"] = reflect.ValueOf(time.LoadLocationFromTZData)
}
