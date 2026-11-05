package rule_test

import (
	"testing"

	. "github.com/smartystreets/goconvey/convey"
	"golang.org/x/tools/go/analysis/analysistest"

	"github.com/pydio/cells/v5/tools/conveylint/rule"
)

func TestAnalyzer(t *testing.T) {
	Convey("Reports tests without a GoConvey call", t, func() {
		analysistest.Run(t, analysistest.TestData(), rule.Analyzer, "example")
	})
}
