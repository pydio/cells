// Command conveylint runs the GoConvey test analyzer with go vet.
package main

import (
	"github.com/pydio/cells/v5/tools/conveylint/rule"
	"golang.org/x/tools/go/analysis/singlechecker"
)

func main() {
	singlechecker.Main(rule.Analyzer)
}
