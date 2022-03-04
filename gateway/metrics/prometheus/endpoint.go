package prometheus

import (
	"context"
	"fmt"
	"io/ioutil"
	"net/http"
	"net/http/pprof"
	"os"
	"path/filepath"
	"sync"
	"time"

	tally "github.com/uber-go/tally/v4"
	"github.com/uber-go/tally/v4/prometheus"

	"github.com/pydio/cells/v4/common/config"
	"github.com/pydio/cells/v4/common/registry"
	"github.com/pydio/cells/v4/common/runtime"
	servercontext "github.com/pydio/cells/v4/common/server/context"
	"github.com/pydio/cells/v4/common/service/metrics"
	json "github.com/pydio/cells/v4/common/utils/jsonx"
	"github.com/pydio/cells/v4/common/utils/net"
)

var (
	watcher  registry.Watcher
	canceler context.CancelFunc
	once     sync.Once
)

func init() {
	metrics.RegisterOnStartExposure(exposeMetrics)
}

func exposeMetrics() {
	once.Do(func() {
		if runtime.MetricsEnabled() {
			r := prometheus.NewReporter(prometheus.Options{})
			options := tally.ScopeOptions{
				Prefix:         "cells",
				Tags:           map[string]string{},
				CachedReporter: r,
				Separator:      prometheus.DefaultSeparator,
			}
			port := net.GetAvailablePort()
			metrics.RegisterRootScope(options, port)
			go func() {
				defer metrics.Close()
				http.Handle("/metrics", r.HTTPHandler())
				if runtime.PprofEnabled() {
					fmt.Printf("Exposing debug profiles for process %d on port %d\n", os.Getpid(), port)
					http.Handle("/debug", pprof.Handler("debug"))
				}
				_ = http.ListenAndServe(fmt.Sprintf(":%v", port), nil)
				select {}
			}()
		}
	})
}

func GetFileName(serviceName string) string {
	return filepath.Join("$ServiceDir", "prom_clients.json")
}

func WatchTargets(ctx context.Context, serviceName string) error {

	d, e := config.ServiceDataDir(serviceName)
	if e != nil {
		return e
	}
	file := filepath.Join(d, "prom_clients.json")

	if !runtime.MetricsEnabled() {
		empty, _ := json.Marshal([]interface{}{})
		return ioutil.WriteFile(file, empty, 0755)
	}
	reg := servercontext.GetRegistry(ctx)
	if reg == nil {
		return fmt.Errorf("cannot find registry in context")
	}

	ctx, cancel := context.WithCancel(context.Background())
	canceler = cancel
	trigger := make(chan bool)
	timer := time.NewTimer(3 * time.Second)
	go func() {
		for {
			select {
			case <-timer.C:
				if d, e := ProcessesAsTargets(ctx, reg).ToJson(); e == nil {
					_ = ioutil.WriteFile(file, d, 0755)
				}
			case <-trigger:
				timer.Reset(3 * time.Second)
			case <-ctx.Done():
				return
			}
		}
	}()

	// Monitor prometheus clients from registry and update target file accordingly

	var err error
	if watcher, err = reg.Watch(); err != nil {
		return err
	}
	go func() {
		for {
			result, err := watcher.Next()
			if result != nil && err == nil {
				trigger <- true
			}
		}
	}()

	return nil
}

func StopWatchingTargets() {
	if watcher != nil {
		watcher.Stop()
	}
	if canceler != nil {
		canceler()
	}
}
