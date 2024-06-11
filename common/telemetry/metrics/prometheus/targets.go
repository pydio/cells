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
	"os"
	"strings"
	"time"

	"go.uber.org/zap"

	pb "github.com/pydio/cells/v4/common/proto/registry"
	"github.com/pydio/cells/v4/common/registry"
	"github.com/pydio/cells/v4/common/runtime"
	"github.com/pydio/cells/v4/common/telemetry/log"
	json "github.com/pydio/cells/v4/common/utils/jsonx"
	"github.com/pydio/cells/v4/common/utils/propagator"
)

// targetGroup is a serialization of target group
type targetGroup struct {
	Targets []string          `json:"targets"`
	Labels  map[string]string `json:"labels"`
}

// PromTargets is a serialization of Target Groups
type PromTargets struct {
	groups []*targetGroup
}

func processesAsTargets(ctx context.Context, reg registry.Registry, includeCaddy bool, replaceHost string) *PromTargets {

	t := &PromTargets{}
	ii, er := reg.List(registry.WithType(pb.ItemType_SERVER))
	if er != nil {
		return t
	}
	processes := make(map[string]*targetGroup)
	for _, i := range ii {
		if i.Name() != "http" && !(includeCaddy && i.Name() == "caddy") {
			continue
		}
		meta := i.Metadata()
		pid := meta[runtime.NodeMetaPID]
		// Retrieve parent node
		nn := reg.ListAdjacentItems(
			registry.WithAdjacentSourceItems([]registry.Item{i}),
			registry.WithAdjacentTargetOptions(registry.WithType(pb.ItemType_NODE)),
		)
		if len(nn) == 0 {
			continue
		}
		rootNodeID := nn[0].ID()
		if _, ok := processes[rootNodeID]; ok {
			continue // already registered
		}
		var host string
		if replaceHost == "" {
			if aa := reg.ListAdjacentItems(
				registry.WithAdjacentSourceItems([]registry.Item{i}),
				registry.WithAdjacentTargetOptions(registry.WithType(pb.ItemType_ADDRESS)),
			); len(aa) > 0 {
				host = aa[0].Name()
			}
			if host == "" {
				continue
			}
		} else {
			host = replaceHost
		}
		tg := &targetGroup{
			Targets: []string{host},
			Labels: map[string]string{
				"job":              "cells",
				"pid":              pid,
				"rootID":           rootNodeID,
				"instance":         "main",
				"__metrics_path__": "/metrics/" + rootNodeID,
			},
		}
		if startTag := meta[runtime.NodeMetaStartTag]; startTag != "" {
			tg.Labels["instance"] = startTag
		}
		processes[rootNodeID] = tg
	}
	for _, g := range processes {
		t.groups = append(t.groups, g)
	}
	log.Logger(ctx).Debug("Updating Prometheus Targets", zap.Int("targets", len(t.groups)))
	return t

}

func (p *PromTargets) ToJson() ([]byte, error) {
	return json.Marshal(p.groups)
}

var (
	watcher  registry.Watcher
	canceler context.CancelFunc
)

type metricsServer struct {
	ctx         context.Context
	serviceName string
	filePath    string
}

func (g *metricsServer) Start() error {
	return g.watchTargets(g.ctx, g.serviceName, g.filePath)
}

func (g *metricsServer) Stop() error {
	g.stopWatchingTargets()

	return nil
}

// NoAddress implements NonAddressable interface
func (g *metricsServer) NoAddress() string {
	return g.filePath
}

func (g *metricsServer) watchTargets(ctx context.Context, serviceName, filePath string) error {

	d, e := runtime.ServiceDataDir(serviceName)
	if e != nil {
		return e
	}
	file := strings.ReplaceAll(filePath, "{{.ServiceDataDir}}", d) //filepath.Join(d, "prom_clients.json")

	/*
		if !runtime.MetricsEnabled() {
			empty, _ := json.Marshal([]interface{}{})
			return os.WriteFile(file, empty, 0755)
		}
	*/
	var reg registry.Registry
	if !propagator.Get(ctx, registry.ContextKey, &reg) {
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
				if d, e := processesAsTargets(ctx, reg, false, "").ToJson(); e == nil {
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
		defer watcher.Stop()

		for {
			result, err := watcher.Next()
			if result != nil && err == nil {
				go func() {
					trigger <- true
				}()
			}
		}
	}()

	return nil
}

func (g *metricsServer) stopWatchingTargets() {
	if watcher != nil {
		watcher.Stop()
	}
	if canceler != nil {
		canceler()
	}
}
