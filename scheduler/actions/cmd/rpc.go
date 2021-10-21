/*
 * Copyright (c) 2018. Abstrium SAS <team (at) pydio.com>
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

package cmd

import (
	"context"
	"time"

	json "github.com/pydio/cells/x/jsonx"

	"github.com/micro/go-micro/client"
	"github.com/micro/go-micro/errors"

	"github.com/pydio/cells/common"
	"github.com/pydio/cells/common/forms"
	"github.com/pydio/cells/common/log"
	"github.com/pydio/cells/common/proto/jobs"
	"github.com/pydio/cells/scheduler/actions"
)

var (
	rpcActionName = "actions.cmd.rpc"
)

type RpcAction struct {
	Client      client.Client
	ServiceName string
	MethodName  string
	JsonRequest string
	Timeout     string
}

// GetDescription returns action description
func (c *RpcAction) GetDescription(lang ...string) actions.ActionDescription {
	return actions.ActionDescription{
		ID:              rpcActionName,
		Label:           "gRPC Request",
		Category:        actions.ActionCategoryCmd,
		Icon:            "code-braces",
		Description:     "Perform a valid JSON-encoded call to any micro-service",
		SummaryTemplate: "",
		HasForm:         true,
	}
}

// GetParametersForm returns a UX form
func (c *RpcAction) GetParametersForm() *forms.Form {
	return &forms.Form{Groups: []*forms.Group{
		{
			Fields: []forms.Field{
				&forms.FormField{
					Name:        "service",
					Type:        forms.ParamString,
					Label:       "Service Name",
					Description: "Full name of the cells micro service",
					Default:     "",
					Mandatory:   true,
					Editable:    true,
				},
				&forms.FormField{
					Name:        "method",
					Type:        forms.ParamString,
					Label:       "Method",
					Description: "Name of the RPC method",
					Mandatory:   true,
					Editable:    true,
				},
				&forms.FormField{
					Name:        "request",
					Type:        forms.ParamTextarea,
					Label:       "JSON Request",
					Description: "JSON-encoded body to be sent as request",
					Default:     "{}",
					Mandatory:   false,
					Editable:    true,
				},
				&forms.FormField{
					Name:        "timeout",
					Type:        forms.ParamString,
					Label:       "Request Timeout",
					Description: "Set a duration (10s, 10m, 1h...)",
					Default:     "",
					Mandatory:   false,
					Editable:    true,
				},
			},
		},
	}}
}

// GetName provides unique identifier
func (c *RpcAction) GetName() string {
	return rpcActionName
}

// Init passes parameters
func (c *RpcAction) Init(job *jobs.Job, cl client.Client, action *jobs.Action) error {
	c.Client = cl
	c.ServiceName = action.Parameters["service"]
	c.MethodName = action.Parameters["method"]
	if c.ServiceName == "" || c.MethodName == "" {
		return errors.BadRequest(common.ServiceJobs, "Missing parameters for RPC Action")
	}
	if jsonParams, o := action.Parameters["request"]; o {
		c.JsonRequest = jsonParams
	} else {
		c.JsonRequest = "{}"
	}
	if t, ok := action.Parameters["timeout"]; ok && t != "" {
		c.Timeout = t
	}
	return nil
}

// Run perform actual action code
func (c *RpcAction) Run(ctx context.Context, channels *actions.RunnableChannels, input jobs.ActionMessage) (jobs.ActionMessage, error) {

	var jsonParams interface{}
	if e := json.Unmarshal([]byte(jobs.EvaluateFieldStr(ctx, input, c.JsonRequest)), &jsonParams); e != nil {
		return input.WithError(e), e
	}

	serviceName := jobs.EvaluateFieldStr(ctx, input, c.ServiceName)
	methodName := jobs.EvaluateFieldStr(ctx, input, c.MethodName)
	log.TasksLogger(ctx).Info("Sending json+grpc request to " + serviceName + "." + methodName)
	req := c.Client.NewJsonRequest(serviceName, methodName, &jsonParams)
	var response json.RawMessage
	var opts []client.CallOption
	if c.Timeout != "" {
		timeout := jobs.EvaluateFieldStr(ctx, input, c.Timeout)
		if dur, er := time.ParseDuration(timeout); er == nil {
			opts = append(opts, client.WithRequestTimeout(dur))
		} else {
			log.TasksLogger(ctx).Error("Cannot parse duration " + timeout + ": " + er.Error())
		}
	}
	e := c.Client.Call(ctx, req, &response, opts...)
	if e != nil {
		return input.WithError(e), e
	}
	output := input
	jsonData, _ := response.MarshalJSON()
	log.TasksLogger(ctx).Info("Request Success, appending data to action output (JsonBody)")
	output.AppendOutput(&jobs.ActionOutput{
		Success:  true,
		JsonBody: jsonData,
	})
	return output, nil

}
