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
	"github.com/jcuga/golongpoll"
	"go.uber.org/zap"

	"github.com/pydio/cells/common/caddy"
	"github.com/pydio/cells/common/log"
	"github.com/pydio/cells/common/proto/install"
	"github.com/pydio/cells/common/service"
	"github.com/pydio/cells/discovery/install/lib"
)

// Handler to the REST requests.
type Handler struct {
	eventManager *golongpoll.LongpollManager
}

// SwaggerTags lists the names of the service tags declared in the swagger JSON implemented by this service.
func (h *Handler) SwaggerTags() []string {
	return []string{"InstallService"}
}

// Filter returns a function to filter the swagger path.
func (h *Handler) Filter() func(string) string {
	return nil
}

// PerformInstallCheck performs a few server side checks before launching the real install.
func (h *Handler) PerformInstallCheck(req *restful.Request, rsp *restful.Response) {

	ctx := req.Request.Context()
	var input install.PerformCheckRequest
	err := req.ReadEntity(&input)
	if err != nil {
		service.RestError500(req, rsp, err)
		return
	}

	installConfig := input.GetConfig()
	if installConfig.DbUseDefaults {
		reloadDbDefaults(installConfig)
	}

	result := lib.PerformCheck(ctx, input.Name, installConfig)
	rsp.WriteEntity(&install.PerformCheckResponse{Result: result})

}

// GetAgreement returns current Licence text for user validation.
func (h *Handler) GetAgreement(req *restful.Request, rsp *restful.Response) {

	rsp.WriteEntity(&install.GetAgreementResponse{Text: AgplText})

}

// GetInstall retrieves default configuration parameters.
func (h *Handler) GetInstall(req *restful.Request, rsp *restful.Response) {

	ctx := req.Request.Context()
	// Create a copy of default config without any db passwords
	defaultConfig := *lib.GenerateDefaultConfig()
	defaultConfig.DbTCPPassword = ""
	defaultConfig.DbSocketPassword = ""
	response := &install.GetDefaultsResponse{
		Config: &defaultConfig,
	}
	log.Logger(ctx).Debug("Received Install.Get request", zap.Any("response", response))
	rsp.WriteEntity(response)
}

// PostInstall updates pydio.json configuration file after having gathered modifications from the admin end user.
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
	installConfig := input.GetConfig()
	if installConfig.DbUseDefaults {
		reloadDbDefaults(installConfig)
	}
	if er := lib.Install(ctx, installConfig, lib.InstallAll, func(event *lib.InstallProgressEvent) {
		h.eventManager.Publish("install", event)
	}); er != nil {
		h.eventManager.Publish("install", &lib.InstallProgressEvent{Message: "Some error occurred: " + er.Error()})
		service.RestError500(req, rsp, er)
	} else {
		h.eventManager.Publish("install", &lib.InstallProgressEvent{
			Message:  "Installation Finished, starting all services...",
			Progress: 100,
		})
		response.Success = true
		rsp.WriteEntity(response)
	}

	go func() {
		<-time.After(3 * time.Second)
		caddy.Stop()
		h.eventManager.Shutdown()
	}()
}

// InstallEvents returns events
func (h *Handler) InstallEvents(req *restful.Request, rsp *restful.Response) {
	h.eventManager.SubscriptionHandler(rsp.ResponseWriter, req.Request)
}

func reloadDbDefaults(config *install.InstallConfig) {
	defaultConfig := lib.GenerateDefaultConfig()
	config.DbManualDSN = defaultConfig.DbManualDSN
	config.DbConnectionType = defaultConfig.DbConnectionType

	config.DbSocketFile = defaultConfig.DbSocketFile
	config.DbSocketName = defaultConfig.DbSocketName
	config.DbSocketUser = defaultConfig.DbSocketUser
	config.DbSocketPassword = defaultConfig.DbSocketPassword

	config.DbTCPPassword = defaultConfig.DbTCPPassword
	config.DbTCPHostname = defaultConfig.DbTCPHostname
	config.DbTCPName = defaultConfig.DbTCPName
	config.DbTCPPort = defaultConfig.DbTCPPort
	config.DbTCPUser = defaultConfig.DbTCPUser

}
