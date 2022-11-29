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

	"go.uber.org/zap"

	"github.com/pydio/cells/v4/common/log"
	pb "github.com/pydio/cells/v4/common/proto/registry"
	"github.com/pydio/cells/v4/common/registry"
	"github.com/pydio/cells/v4/common/runtime"
	json "github.com/pydio/cells/v4/common/utils/jsonx"
)

type targetGroup struct {
	Targets []string          `json:"targets"`
	Labels  map[string]string `json:"labels"`
}

type PromTargets struct {
	groups []*targetGroup
}

func ProcessesAsTargets(ctx context.Context, reg registry.Registry, includeCaddy bool) *PromTargets {

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
		if _, ok := processes[pid]; ok {
			continue // already registered
		}
		var host string
		if aa := reg.ListAdjacentItems(i, registry.WithType(pb.ItemType_ADDRESS)); len(aa) > 0 {
			host = aa[0].Name()
		}
		if host == "" {
			continue
		}
		tg := &targetGroup{
			Targets: []string{host},
			Labels: map[string]string{
				"job":      "cells",
				"pid":      pid,
				"instance": "main",
			},
		}
		if startTag := meta[runtime.NodeMetaStartTag]; startTag != "" {
			tg.Labels["instance"] = startTag
		}
		processes[pid] = tg
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
