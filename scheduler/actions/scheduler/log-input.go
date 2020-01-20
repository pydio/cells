package scheduler

import (
	"context"
	"fmt"
	"strings"

	"go.uber.org/zap/zapcore"

	"github.com/micro/go-micro/client"
	"go.uber.org/zap"

	"github.com/pydio/cells/common/forms"
	"github.com/pydio/cells/common/log"
	"github.com/pydio/cells/common/proto/jobs"
	"github.com/pydio/cells/scheduler/actions"
)

var (
	LogInputActionName = "actions.test.log-input"
)

type LogInputAction struct {
	intLog  bool
	taskLog bool
	msg     string
	debug   bool
}

func (l *LogInputAction) GetDescription(lang ...string) actions.ActionDescription {
	return actions.ActionDescription{
		ID:              LogInputActionName,
		Label:           "Pass-through",
		Icon:            "transfer",
		Category:        actions.ActionCategoryScheduler,
		Description:     "Blank action for appending selections or filtering, or just logging the current content of the input message.",
		SummaryTemplate: "",
		HasForm:         true,
	}
}

func (l *LogInputAction) GetParametersForm() *forms.Form {
	return &forms.Form{Groups: []*forms.Group{
		{
			Fields: []forms.Field{
				&forms.FormField{
					Name:        "internalLogger",
					Type:        forms.ParamBool,
					Label:       "Internal Logger",
					Description: "Log in application logs",
					Default:     true,
					Mandatory:   false,
					Editable:    true,
				},
				&forms.FormField{
					Name:        "taskLogger",
					Type:        forms.ParamBool,
					Label:       "Task Logger",
					Description: "Log in Task Logger",
					Default:     true,
					Mandatory:   false,
					Editable:    true,
				},
				&forms.FormField{
					Name:        "debug",
					Type:        forms.ParamBool,
					Label:       "Logger Debug level",
					Description: "Logger Debug level",
					Default:     false,
					Mandatory:   false,
					Editable:    true,
				},
				&forms.FormField{
					Name:        "message",
					Type:        forms.ParamTextarea,
					Label:       "Message",
					Description: "Create custom message",
					Default:     nil,
					Mandatory:   false,
					Editable:    true,
				},
			},
		},
	}}
}

func (l *LogInputAction) GetName() string {
	return LogInputActionName
}

func (l *LogInputAction) Init(job *jobs.Job, cl client.Client, action *jobs.Action) error {
	if action.Parameters["taskLogger"] == "true" {
		l.taskLog = true
	}
	if action.Parameters["internalLogger"] == "true" {
		l.intLog = true
	}
	if action.Parameters["debug"] == "true" {
		l.debug = true
	}
	if m, ok := action.Parameters["message"]; ok && len(m) > 0 {
		l.msg = m
	}
	return nil
}

func (l *LogInputAction) Run(ctx context.Context, channels *actions.RunnableChannels, input jobs.ActionMessage) (jobs.ActionMessage, error) {

	if !l.taskLog && !l.intLog {
		return input.WithIgnore(), nil
	}

	msg := l.msg
	var ff []zapcore.Field
	if msg != "" {
		msg = jobs.EvaluateFieldStr(ctx, input, msg)
	} else {
		var mm []string
		if len(input.Nodes) > 0 {
			mm = append(mm, fmt.Sprintf("%d nodes", len(input.Nodes)))
			ff = append(ff, zap.Int("total", len(input.Nodes)), input.Nodes[0].ZapUuid(), input.Nodes[0].ZapPath())
		}
		if len(input.Users) > 0 {
			mm = append(mm, fmt.Sprintf("%d users", len(input.Users)))
			ff = append(ff, zap.Int("total", len(input.Users)), input.Users[0].ZapUuid(), input.Users[0].ZapLogin())
		}
		if len(input.Roles) > 0 {
			mm = append(mm, fmt.Sprintf("%d roles", len(input.Roles)))
			ff = append(ff, zap.Int("total", len(input.Roles)), input.Roles[0].Zap())
		}
		if len(input.Workspaces) > 0 {
			mm = append(mm, fmt.Sprintf("%d workspaces", len(input.Workspaces)))
			ff = append(ff, zap.Int("total", len(input.Workspaces)), input.Workspaces[0].Zap())
		}
		if len(input.Acls) > 0 {
			mm = append(mm, fmt.Sprintf("%d acls", len(input.Acls)))
			ff = append(ff, zap.Int("total", len(input.Acls)), input.Acls[0].Zap())
		}
		if len(input.Activities) > 0 {
			mm = append(mm, fmt.Sprintf("%d activities", len(input.Activities)))
			ff = append(ff, zap.Int("total", len(input.Activities)), zap.Any("first", input.Activities[0]))
		}
		msg = strings.Join(mm, ", ")
	}
	if l.intLog {
		if l.debug {
			log.Logger(ctx).Debug(msg, ff...)
		} else {
			log.Logger(ctx).Info(msg, ff...)
		}
	}
	if l.taskLog {
		if l.debug {
			log.TasksLogger(ctx).Debug(msg, ff...)
		} else {
			log.TasksLogger(ctx).Info(msg, ff...)
		}
	}

	return input, nil
}
