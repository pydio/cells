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
	"fmt"
	"strings"

	"go.uber.org/zap"
	grpc2 "google.golang.org/grpc"
	"google.golang.org/protobuf/encoding/protojson"
	"google.golang.org/protobuf/reflect/protoreflect"
	"google.golang.org/protobuf/reflect/protoregistry"

	"github.com/pydio/cells/v4/common"
	"github.com/pydio/cells/v4/common/client/grpc"
	"github.com/pydio/cells/v4/common/forms"
	"github.com/pydio/cells/v4/common/log"
	"github.com/pydio/cells/v4/common/proto/jobs"
	"github.com/pydio/cells/v4/common/service/errors"
	json "github.com/pydio/cells/v4/common/utils/jsonx"
	"github.com/pydio/cells/v4/scheduler/actions"
)

var (
	rpcActionName = "actions.cmd.rpc"
)

type RpcAction struct {
	common.RuntimeHolder
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
func (c *RpcAction) Init(job *jobs.Job, action *jobs.Action) error {
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
func (c *RpcAction) Run(ctx context.Context, channels *actions.RunnableChannels, input *jobs.ActionMessage) (*jobs.ActionMessage, error) {

	var jsonParams interface{}
	if e := json.Unmarshal([]byte(jobs.EvaluateFieldStr(ctx, input, c.JsonRequest)), &jsonParams); e != nil {
		return input.WithError(e), e
	}

	serviceName := jobs.EvaluateFieldStr(ctx, input, c.ServiceName)
	methodName := jobs.EvaluateFieldStr(ctx, input, c.MethodName)
	log.TasksLogger(ctx).Info("Sending json+grpc request to " + serviceName + "." + methodName)

	var methodDescriptor protoreflect.MethodDescriptor
	var methodSendName string

	parts := strings.Split(methodName, ".")

	if len(parts) == 3 { // example : mailer.MailerService.ConsumeQueue

		srvDescName := strings.Join(parts[:2], ".") // mailer.MailerService
		methodSendName = "/" + srvDescName + "/" + parts[2]

		g, e := protoregistry.GlobalFiles.FindDescriptorByName(protoreflect.FullName(srvDescName))
		if e != nil {
			return input.WithError(e), e
		}
		serviceDescriptor := g.(protoreflect.ServiceDescriptor)
		methodDescriptor = serviceDescriptor.Methods().ByName(protoreflect.Name(parts[2])) // ConsumeQueue

	} else if len(parts) == 2 { // legacy, we don't have the package name : MailerService.ConsumeQueue

		srvName := parts[0]
		protoregistry.GlobalFiles.RangeFiles(func(file protoreflect.FileDescriptor) bool {
			if strings.HasPrefix(file.Path(), "cells") {
				ss := file.Services()
				for i := 0; i < ss.Len(); i++ {
					serv := ss.Get(i)
					if srvName == string(serv.Name()) {
						methodDescriptor = serv.Methods().ByName(protoreflect.Name(parts[1]))
						if methodDescriptor != nil {
							methodSendName = "/" + string(serv.FullName()) + "/" + string(methodDescriptor.Name())
							//fmt.Println("Found target method ! ", methodSendName)
							// Break range
							return false
						}
					}
				}
			}
			return true
		})

	}
	if methodDescriptor == nil {
		er := fmt.Errorf("cannot find corresponding service/method for " + methodName)
		return input.WithError(er), er
	}
	if methodDescriptor.IsStreamingClient() {
		er := fmt.Errorf("StreamingClient is not supported in this action")
		return input.WithError(er), er
	}

	// Create Request & Response objects, unmarshall Request from JSON input
	reqType, _ := protoregistry.GlobalTypes.FindMessageByName(methodDescriptor.Input().FullName())
	respType, _ := protoregistry.GlobalTypes.FindMessageByName(methodDescriptor.Output().FullName())

	request := reqType.New().Interface()
	jsonRequest := jobs.EvaluateFieldStr(ctx, input, c.JsonRequest)
	if e := protojson.Unmarshal([]byte(jsonRequest), request); e != nil {
		return input.WithError(e), e
	}

	output := input.Clone()
	conn := grpc.GetClientConnFromCtx(c.GetRuntimeContext(), serviceName)
	if methodDescriptor.IsStreamingServer() {

		cStream, e := conn.NewStream(ctx, &grpc2.StreamDesc{ServerStreams: true}, methodSendName, grpc2.WaitForReady(false))
		if e != nil {
			return input.WithError(e), e
		}
		done := make(chan struct{}, 1)
		var marshaledResponses []string
		go func() {
			defer close(done)
			for {
				response := respType.New().Interface()
				se := cStream.RecvMsg(response)
				if se != nil {
					return
				}
				marshaled, _ := protojson.Marshal(response)
				marshaledResponses = append(marshaledResponses, string(marshaled))
			}
		}()
		er := cStream.SendMsg(request)
		if er != nil {
			log.TasksLogger(ctx).Error("Failed calling SendMsg "+er.Error(), zap.String("serviceName", serviceName), zap.String("methodName", methodSendName), zap.Any("request", request))
		}
		_ = cStream.CloseSend()
		<-done
		jsonData := []byte("[" + strings.Join(marshaledResponses, ",") + "]")
		output.AppendOutput(&jobs.ActionOutput{
			Success:  true,
			JsonBody: jsonData,
		})

	} else {
		// Unary call - Create a response
		response := respType.New().Interface()

		if e := conn.Invoke(ctx, methodSendName, request, response, grpc2.WaitForReady(false)); e != nil {
			log.TasksLogger(ctx).Error("Failed calling Invoke", zap.String("serviceName", serviceName), zap.String("methodName", methodSendName), zap.Any("request", request))
			return input.WithError(e), e
		}

		log.TasksLogger(ctx).Info("Successfully called Invoke", zap.Any("request", request), zap.Any("response", response))
		jsonData, _ := protojson.Marshal(response)
		output.AppendOutput(&jobs.ActionOutput{
			Success:  true,
			JsonBody: jsonData,
		})

	}

	return output, nil

}
