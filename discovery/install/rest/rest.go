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

package rest

import (
	"time"

	"github.com/emicklei/go-restful"
	"go.uber.org/zap"

	"github.com/pydio/cells/common/caddy"
	"github.com/pydio/cells/common/log"
	"github.com/pydio/cells/common/proto/install"
	"github.com/pydio/cells/common/service"
	"github.com/pydio/cells/discovery/install/lib"
)

// Handler to the REST requests
type Handler struct{}

// SwaggerTags list the names of the service tags declared in the swagger json implemented by this service
func (a *Handler) SwaggerTags() []string {
	return []string{"InstallService"}
}

// Filter returns a function to filter the swagger path
func (a *Handler) Filter() func(string) string {
	return nil
}

func (h *Handler) PerformInstallCheck(req *restful.Request, rsp *restful.Response) {

	ctx := req.Request.Context()
	var input install.PerformCheckRequest
	err := req.ReadEntity(&input)
	if err != nil {
		service.RestError500(req, rsp, err)
		return
	}
	result := lib.PerformCheck(ctx, input.Name, input.Config)
	rsp.WriteEntity(&install.PerformCheckResponse{Result: result})

}

func (h *Handler) GetAgreement(req *restful.Request, rsp *restful.Response) {

	rsp.WriteEntity(&install.GetAgreementResponse{Text: AgplText})

}

// Post request handler
func (h *Handler) GetInstall(req *restful.Request, rsp *restful.Response) {

	ctx := req.Request.Context()
	response := &install.GetDefaultsResponse{
		Config: lib.GenerateDefaultConfig(),
	}
	log.Logger(ctx).Info("Received Install.Get request", zap.Any("response", response))
	rsp.WriteEntity(response)
}

// Post request handler
func (h *Handler) PostInstall(req *restful.Request, rsp *restful.Response) {

	ctx := req.Request.Context()

	var input install.InstallRequest

	err := req.ReadEntity(&input)
	if err != nil {
		service.RestError500(req, rsp, err)
		return
	}

	log.Logger(ctx).Debug("Received Install.Post request", zap.Any("input", input))

	response := &install.InstallResponse{}
	if er := lib.Install(ctx, input.GetConfig(), func(event *lib.InstallProgressEvent) {
		eventManager.Publish("install", event)
	}); er != nil {
		eventManager.Publish("install", &lib.InstallProgressEvent{Message: "Some error occurred: " + er.Error()})
		service.RestError500(req, rsp, er)
	} else {
		eventManager.Publish("install", &lib.InstallProgressEvent{
			Message:  "Installation Finished, starting all services...",
			Progress: 100,
		})
		response.Success = true
		rsp.WriteEntity(response)
	}

	<-time.After(2 * time.Second)

	caddy.Stop()
}
