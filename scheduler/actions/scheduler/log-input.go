package scheduler

import (
	"context"

	"github.com/micro/go-micro/client"
	"github.com/pydio/cells/common/log"
	"github.com/pydio/cells/common/proto/jobs"
	"github.com/pydio/cells/scheduler/actions"
	"go.uber.org/zap"
)

var (
	LogInputActionName = "actions.test.log-input"
)

type LogInputAction struct{}

func (l *LogInputAction) GetName() string {
	return LogInputActionName
}

func (l *LogInputAction) Init(job *jobs.Job, cl client.Client, action *jobs.Action) error {
	return nil
}

func (l *LogInputAction) Run(ctx context.Context, channels *actions.RunnableChannels, input jobs.ActionMessage) (jobs.ActionMessage, error) {
	// Log all inputs
	if len(input.Nodes) > 0 {
		log.Logger(ctx).Info("Input has node(s)", zap.Int("total", len(input.Nodes)), input.Nodes[0].Zap())
	}
	if len(input.Users) > 0 {
		log.Logger(ctx).Info("Input has user(s)", zap.Int("total", len(input.Users)), input.Users[0].Zap())
	}
	if len(input.Roles) > 0 {
		log.Logger(ctx).Info("Input has role(s)", zap.Int("total", len(input.Roles)), input.Roles[0].Zap())
	}
	if len(input.Workspaces) > 0 {
		log.Logger(ctx).Info("Input has workspace(s)", zap.Int("total", len(input.Workspaces)), input.Workspaces[0].Zap())
	}
	if len(input.Acls) > 0 {
		log.Logger(ctx).Info("Input has acl(s)", zap.Int("total", len(input.Acls)), input.Acls[0].Zap())
	}
	if len(input.Activities) > 0 {
		log.Logger(ctx).Info("Input has activity(ies)", zap.Int("total", len(input.Activities)))
	}
	return input, nil
}
