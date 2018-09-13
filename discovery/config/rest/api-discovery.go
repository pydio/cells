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
	"fmt"
	"net/url"
	"strings"
	"time"

	"github.com/emicklei/go-restful"
	"github.com/micro/go-micro/errors"
	"go.uber.org/zap"

	"github.com/pydio/cells/common"
	"github.com/pydio/cells/common/config"
	"github.com/pydio/cells/common/forms"
	"github.com/pydio/cells/common/log"
	"github.com/pydio/cells/common/proto/rest"
	"github.com/pydio/cells/common/registry"
	"github.com/pydio/cells/common/service"
	"github.com/pydio/cells/common/utils"
)

/*****************************
PUBLIC ENDPOINTS FOR DISCOVERY
******************************/
// Publish a list of available endpoints
func (s *Handler) EndpointsDiscovery(req *restful.Request, resp *restful.Response) {
	var t time.Time
	var e error
	if t, e = time.Parse("2006-01-02T15:04:05", common.BuildStamp); e != nil {
		t = time.Now()
	}
	endpointResponse := &rest.DiscoveryResponse{
		PackageType:   common.PackageType,
		PackageLabel:  common.PackageLabel,
		Version:       common.Version().String(),
		BuildStamp:    int32(t.Unix()),
		BuildRevision: common.BuildRevision,
		Endpoints:     make(map[string]string),
	}

	cfg := config.Default()
	httpProtocol := "http"
	wsProtocol := "ws"

	ip, _ := utils.GetExternalIP()
	s3Port := cfg.Get("services", "pydio.grpc.gateway.data", "port").String("")

	mainUrl := cfg.Get("defaults", "url").String("")
	if !strings.HasPrefix(mainUrl, "http") {
		mainUrl = "http://" + mainUrl
	}
	urlParsed, _ := url.Parse(mainUrl)
	log.Logger(req.Request.Context()).Info("Parsed URL", zap.Any("url", urlParsed))

	ssl := cfg.Get("cert", "proxy", "ssl").Bool(false)
	if ssl {
		httpProtocol = "https"
		wsProtocol = "wss"
	}

	endpointResponse.Endpoints["rest"] = fmt.Sprintf("%s://%s/a", httpProtocol, urlParsed.Host)
	endpointResponse.Endpoints["openapi"] = fmt.Sprintf("%s://%s/a/config/discovery/openapi", httpProtocol, urlParsed.Host)
	endpointResponse.Endpoints["forms"] = fmt.Sprintf("%s://%s/a/config/discovery/forms/{serviceName}", httpProtocol, urlParsed.Host)
	endpointResponse.Endpoints["oidc"] = fmt.Sprintf("%s://%s/auth", httpProtocol, urlParsed.Host)
	endpointResponse.Endpoints["s3"] = fmt.Sprintf("%s://%s:%s", httpProtocol, ip.String(), s3Port)

	endpointResponse.Endpoints["chats"] = fmt.Sprintf("%s://%s/ws/chat", wsProtocol, urlParsed.Host)
	endpointResponse.Endpoints["websocket"] = fmt.Sprintf("%s://%s/ws/event", wsProtocol, urlParsed.Host)
	endpointResponse.Endpoints["frontend"] = fmt.Sprintf("%s://%s", httpProtocol, urlParsed.Host)

	resp.WriteEntity(endpointResponse)

}

func (s *Handler) OpenApiDiscovery(req *restful.Request, resp *restful.Response) {

	cfg := config.Default()
	ssl := cfg.Get("cert", "proxy", "ssl").Bool(false)
	restPort := cfg.Get("services", "micro.web", "port").String("")
	ip, _ := utils.GetExternalIP()
	protocol := "http"
	if ssl {
		protocol = "https"
	}

	jsonSpec := service.SwaggerSpec()
	jsonSpec.Spec().Host = fmt.Sprintf("%s://%s:%s", protocol, ip.String(), restPort)
	jsonSpec.Spec().Info.Title = "Pydio API"
	jsonSpec.Spec().Info.Version = "1.0"
	jsonSpec.Spec().Info.Description = "Automatically generated from Protobufs schemas"

	resp.WriteAsJson(jsonSpec.Spec())

}

func (s *Handler) ConfigFormsDiscovery(req *restful.Request, rsp *restful.Response) {
	serviceName := req.PathParameter("ServiceName")
	if serviceName == "" {
		service.RestError500(req, rsp, errors.BadRequest("configs", "Please provide a service name"))
	}

	services, err := registry.ListServices()
	if err != nil {
		service.RestError500(req, rsp, err)
		return
	}
	for _, srv := range services {
		if srv.Name() == serviceName {
			var form *forms.Form

			form = srv.ExposedConfigs()

			rsp.WriteAsXml(form.Serialize(utils.UserLanguagesFromRestRequest(req)...))
			return
		}
	}
	service.RestError404(req, rsp, errors.NotFound("configs", "Cannot find service "+serviceName))
}
