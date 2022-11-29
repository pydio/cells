/*
 * Copyright (c) 2018-2022. Abstrium SAS <team (at) pydio.com>
 * This file is part of Pydio Cells.
 *
 * Pydio Cells is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * Pydio Cells is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with Pydio Cells.  If not, see <http://www.gnu.org/licenses/>.
 *
 * The latest code can be found at <https://pydio.com>.
 */

package prometheus

import (
	"context"
	"fmt"
	"net/http"
	"os"
	"path/filepath"
	"time"

	tally "github.com/uber-go/tally/v4"
	"github.com/uber-go/tally/v4/prometheus"

	pb "github.com/pydio/cells/v4/common/proto/registry"
	"github.com/pydio/cells/v4/common/registry"
	"github.com/pydio/cells/v4/common/runtime"
	servercontext "github.com/pydio/cells/v4/common/server/context"
	"github.com/pydio/cells/v4/common/service/metrics"
	json "github.com/pydio/cells/v4/common/utils/jsonx"
)

var (
	watcher  registry.Watcher
	canceler context.CancelFunc
)

type Handler struct {
	r prometheus.Reporter
}

func NewHandler() *Handler {
	r := prometheus.NewReporter(prometheus.Options{})
	options := tally.ScopeOptions{
		Prefix:         "cells",
		Tags:           map[string]string{},
		CachedReporter: r,
		Separator:      prometheus.DefaultSeparator,
	}
	metrics.RegisterRootScope(options)
	return &Handler{r: r}
}

func (h *Handler) HTTPHandler() http.Handler {
	return h.r.HTTPHandler()
}

func GetFileName(serviceName string) string {
	return filepath.Join("$ServiceDir", "prom_clients.json")
}

func WatchTargets(ctx context.Context, serviceName string) error {

	d, e := runtime.ServiceDataDir(serviceName)
	if e != nil {
		return e
	}
	file := filepath.Join(d, "prom_clients.json")

	if !runtime.MetricsEnabled() {
		empty, _ := json.Marshal([]interface{}{})
		return os.WriteFile(file, empty, 0755)
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
				if d, e := ProcessesAsTargets(ctx, reg, false).ToJson(); e == nil {
					_ = os.WriteFile(file, d, 0755)
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
	if watcher, err = reg.Watch(registry.WithType(pb.ItemType_SERVER)); err != nil {
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
