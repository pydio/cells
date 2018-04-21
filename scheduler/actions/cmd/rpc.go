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
	"encoding/json"

	"github.com/micro/go-micro/client"
	"github.com/micro/go-micro/errors"

	"github.com/pydio/cells/common"
	"github.com/pydio/cells/common/proto/jobs"
	"github.com/pydio/cells/scheduler/actions"
)

type RpcAction struct {
	Client      client.Client
	ServiceName string
	MethodName  string
	JsonRequest interface{}
}

var (
	rpcActionName = "actions.cmd.rpc"
)

// Unique identifier
func (c *RpcAction) GetName() string {
	return rpcActionName
}

// Pass parameters
func (c *RpcAction) Init(job *jobs.Job, cl client.Client, action *jobs.Action) error {
	c.Client = cl
	c.ServiceName = action.Parameters["service"]
	c.MethodName = action.Parameters["method"]
	if c.ServiceName == "" || c.MethodName == "" {
		return errors.BadRequest(common.SERVICE_JOBS, "Missing parameters for RPC Action")
	}
	if jsonParams, o := action.Parameters["request"]; o {
		var jsonData interface{}
		e := json.Unmarshal([]byte(jsonParams), &jsonData)
		if e == nil {
			c.JsonRequest = jsonData
		}
	}
	return nil
}

// Run the actual action code
func (c *RpcAction) Run(ctx context.Context, channels *actions.RunnableChannels, input jobs.ActionMessage) (jobs.ActionMessage, error) {

	req := c.Client.NewJsonRequest(c.ServiceName, c.MethodName, c.JsonRequest)
	var response json.RawMessage
	e := c.Client.Call(ctx, req, &response)
	if e != nil {
		return input.WithError(e), e
	}
	output := input
	jsonData, _ := response.MarshalJSON()
	output.AppendOutput(&jobs.ActionOutput{
		Success:  true,
		JsonBody: jsonData,
	})
	return output, nil

}
