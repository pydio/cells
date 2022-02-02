package log

import (
	"fmt"
	. "github.com/smartystreets/goconvey/convey"
	"regexp"
	"strings"
	"testing"
	"time"
)

func TestSetDynamicDebugLevels(t *testing.T) {
	Convey("Test DynamicDebugLevels in/out", t, func() {
		SetDynamicDebugLevels(false, true, "service.name")
		SetDynamicDebugLevels(false, true, "service.name")
		So(dynamicDebug, ShouldHaveLength, 1)
		SetDynamicDebugLevels(false, true, "service.name2")
		So(dynamicDebug, ShouldHaveLength, 2)
		So(ddRegexp, ShouldHaveLength, 2)
		SetDynamicDebugLevels(false, false, "service.name")
		So(dynamicDebug, ShouldHaveLength, 1)
		SetDynamicDebugLevels(true, false)
		So(dynamicDebug, ShouldHaveLength, 0)
	})
}

func TestCaddyLogLine(t *testing.T) {
	lines := []string{
		`2022/01/31 12:04:59.064	WARN	admin	admin endpoint disabled`,
		`2022/01/31 12:04:59.064	INFO	tls.cache.maintenance	started background certificate maintenance	{"cache": "0xc0079e2540"}`,
		`2022/01/31 12:04:59.066	WARN	tls	stapling OCSP	{"error": "no OCSP stapling for [kubernetes.docker.internal local.pydio local.pydio.com localhost localhost localpydio.com sub1.pydio sub2.pydio 127.0.0.1 192.168.0.21]: no OCSP server specified in certificate"}`,
		`2022/01/31 12:04:59.067	INFO	tls	cleaning storage unit	{"description": "FileStorage:/Users/charles/Library/Application Support/Pydio/cells/caddy"}`,
		`2022/01/31 12:04:59.067	INFO	autosaved config (load with --resume flag)	{"file": "/Users/charles/Library/Application Support/Pydio/cells/caddy/autosave.json"}`,
		`2022/01/31 12:04:59.069	INFO	tls	finished cleaning storage units`,
	}
	caddyInternals := regexp.MustCompile("^(?P<log_date>[^\t]+)\t(?P<log_level>WARN|INFO)\t(?P<log_name>[^\t]+)\t(?P<log_message>[^\t]+)(\t)?(?P<log_fields>[^\t]+)$")
	for _, l := range lines {
		parsed := caddyInternals.FindStringSubmatch(l)
		if len(parsed) > 0 {
			if _, e := time.Parse("2006/01/02 15:04:05.000", parsed[1]); e == nil {
				fmt.Println("Got matches", parsed[2], strings.Join(parsed[3:], " "))
			}
		}
	}
}
