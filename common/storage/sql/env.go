package sql

import (
	"os"
	"time"

	"github.com/pydio/cells/v5/common/runtime"
)

var (
	DefaultConnectionTimeout = 30 * time.Second
	LongConnectionTimeout    = 10 * time.Minute
)

func init() {
	runtime.RegisterEnvVariable("CELLS_SQL_DEFAULT_CONN", "30s", "Default SQL connection timeout")
	runtime.RegisterEnvVariable("CELLS_SQL_LONG_CONN", "10m", "Default SQL long connections timeout (for reading big tables)")

	if dc := os.Getenv("CELLS_SQL_DEFAULT_CONN"); dc != "" {
		if ddc, e := time.ParseDuration(dc); e == nil {
			DefaultConnectionTimeout = ddc
		}
	}

	if dc := os.Getenv("CELLS_SQL_LONG_CONN"); dc != "" {
		if ddc, e := time.ParseDuration(dc); e == nil {
			LongConnectionTimeout = ddc
		}
	}
}
