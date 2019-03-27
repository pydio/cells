package metrics

import (
	"io"
	"time"

	"github.com/spf13/cobra"
	"github.com/uber-go/tally"
)

var (
	scope = tally.NoopScope

	closer        io.Closer
	port          int
	startExposure []func()
)

func RegisterRootScope(s tally.ScopeOptions, exposedPort int) {
	scope, closer = tally.NewRootScope(s, 1*time.Second)
	port = exposedPort
}

func RegisterOnStartExposure(runFunc func()) {
	startExposure = append(startExposure, runFunc)
}

func Init() {
	if len(startExposure) > 0 {
		cobra.OnInitialize(func() {
			for _, f := range startExposure {
				f()
			}
		})
	}
}

func Close() {
	port = 0
	if closer != nil {
		closer.Close()
	}
}

func GetExposedPort() int {
	return port
}

func GetMetrics() tally.Scope {
	return scope
}

func GetMetricsForService(serviceName string) tally.Scope {
	return scope.Tagged(map[string]string{
		"service": serviceName,
	})
}
