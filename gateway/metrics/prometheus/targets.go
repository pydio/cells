package prometheus

import (
	"context"
	"fmt"
	"github.com/pydio/cells/v4/common/log"
	pb "github.com/pydio/cells/v4/common/proto/registry"
	"github.com/pydio/cells/v4/common/registry"
	"github.com/pydio/cells/v4/common/server"
	json "github.com/pydio/cells/v4/common/utils/jsonx"
	"go.uber.org/zap"
)

type targetGroup struct {
	Targets []string          `json:"targets"`
	Labels  map[string]string `json:"labels"`
}

type PromTargets struct {
	groups []*targetGroup
}

func ProcessesAsTargets(ctx context.Context, reg registry.Registry) *PromTargets {

	t := &PromTargets{}
	ii, er := reg.List(registry.WithType(pb.ItemType_NODE))
	if er != nil {
		return t
	}
	processes := make(map[string]*targetGroup)
	for _, i := range ii {
		meta := i.Metadata()
		pid := meta[server.NodeMetaPID]
		if _, ok := processes[pid]; ok {
			continue // already registered
		}
		hostname := meta[server.NodeMetaHostName]
		metricsPort := meta[server.NodeMetaMetrics]
		if hostname == "" || metricsPort == "" {
			continue
		}
		tg := &targetGroup{
			Targets: []string{fmt.Sprintf("%s:%s", hostname, metricsPort)},
			Labels: map[string]string{
				"job":      "cells",
				"pid":      pid,
				"instance": "main",
			},
		}
		if startTag := meta[server.NodeMetaStartTag]; startTag != "" {
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
