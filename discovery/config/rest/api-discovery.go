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

	"github.com/micro/go-micro/registry"

	servicecontext "github.com/pydio/cells/common/service/context"

	"github.com/ory/ladon"

	"github.com/pydio/cells/common/proto/jobs"

	"github.com/pydio/cells/common/forms"
	"github.com/pydio/cells/common/forms/protos"
	"github.com/pydio/cells/common/proto/idm"
	"github.com/pydio/cells/common/proto/tree"

	"github.com/pydio/cells/scheduler/actions"

	"github.com/go-openapi/spec"

	"github.com/emicklei/go-restful"
	"github.com/micro/go-micro/errors"
	"github.com/spf13/viper"

	"github.com/pydio/cells/common"
	"github.com/pydio/cells/common/auth/claim"
	"github.com/pydio/cells/common/config"
	"github.com/pydio/cells/common/proto/rest"
	"github.com/pydio/cells/common/service"
	"github.com/pydio/cells/common/utils/i18n"
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
		Endpoints: make(map[string]string),
	}
	if _, ok := req.Request.Context().Value(claim.ContextKey).(claim.Claims); ok {
		endpointResponse.PackageType = common.PackageType
		endpointResponse.PackageLabel = common.PackageLabel
		endpointResponse.Version = common.Version().String()
		endpointResponse.BuildStamp = int32(t.Unix())
		endpointResponse.BuildRevision = common.BuildRevision
	}

	cfg := config.Default()
	httpProtocol := "http"
	wsProtocol := "ws"

	mainUrl := cfg.Get("defaults", "url").String("")
	if !strings.HasPrefix(mainUrl, "http") {
		mainUrl = "http://" + mainUrl
	}
	urlParsed, _ := url.Parse(mainUrl)

	ssl := cfg.Get("cert", "proxy", "ssl").Bool(false)
	if ssl {
		httpProtocol = "https"
		wsProtocol = "wss"
	}

	endpointResponse.Endpoints["rest"] = fmt.Sprintf("%s://%s/a", httpProtocol, urlParsed.Host)
	endpointResponse.Endpoints["openapi"] = fmt.Sprintf("%s://%s/a/config/discovery/openapi", httpProtocol, urlParsed.Host)
	endpointResponse.Endpoints["forms"] = fmt.Sprintf("%s://%s/a/config/discovery/forms/{serviceName}", httpProtocol, urlParsed.Host)
	endpointResponse.Endpoints["oidc"] = fmt.Sprintf("%s://%s/auth", httpProtocol, urlParsed.Host)
	endpointResponse.Endpoints["s3"] = fmt.Sprintf("%s://%s/io", httpProtocol, urlParsed.Host)
	endpointResponse.Endpoints["chats"] = fmt.Sprintf("%s://%s/ws/chat", wsProtocol, urlParsed.Host)
	endpointResponse.Endpoints["websocket"] = fmt.Sprintf("%s://%s/ws/event", wsProtocol, urlParsed.Host)
	endpointResponse.Endpoints["frontend"] = fmt.Sprintf("%s://%s", httpProtocol, urlParsed.Host)

	ss, _ := config.LoadSites()
	external := viper.GetString("grpc_external")
	if external != "" {
		// in case of HTTP, SERVICE_GATEWAY should already be bound to grpc_external
		// Otherwise the proxy is exposing grpc_external
		endpointResponse.Endpoints["grpc"] = external
	} else if len(ss) == 1 && !ss[0].HasTLS() {
		// Pure HTTP and no grpc_external : detect GRPC Service Ports
		var grpcPorts []string
		if ss, e := registry.GetService(common.SERVICE_GATEWAY_GRPC); e == nil {
			for _, s := range ss {
				for _, n := range s.Nodes {
					grpcPorts = append(grpcPorts, fmt.Sprintf("%d", n.Port))
				}
			}
		}
		if len(grpcPorts) > 0 {
			endpointResponse.Endpoints["grpc"] = strings.Join(grpcPorts, ",")
		}
	}

	resp.WriteEntity(endpointResponse)

}

// OpenApiDiscovery prints out the Swagger Spec in JSON format
func (s *Handler) OpenApiDiscovery(req *restful.Request, resp *restful.Response) {

	p := req.Request.URL
	p.Path = ""

	jsonSpec := service.SwaggerSpec()
	jsonSpec.Spec().Host = p.Host
	jsonSpec.Spec().Schemes = []string{p.Scheme}
	jsonSpec.Spec().Info.Title = "Pydio Cells API"
	jsonSpec.Spec().Info.Version = "2.0"
	jsonSpec.Spec().Info.Description = "OAuth2-based REST API (automatically generated from protobufs)"
	scheme := &spec.SecurityScheme{
		VendorExtensible: spec.VendorExtensible{},
		SecuritySchemeProps: spec.SecuritySchemeProps{
			Type:             "oauth2",
			Description:      "Login using OAuth2 code flow",
			Flow:             "accessCode",
			AuthorizationURL: p.String() + "/oidc/oauth2/auth",
			TokenURL:         p.String() + "/oidc/oauth2/token",
		},
	}
	jsonSpec.Spec().SecurityDefinitions = map[string]*spec.SecurityScheme{"oauth2": scheme}
	jsonSpec.Spec().Security = append(jsonSpec.Spec().Security, map[string][]string{"oauth2": []string{}})
	for path, ops := range jsonSpec.Spec().Paths.Paths {
		s.documentOpResponse(ops.Get)
		s.documentOpResponse(ops.Head)
		s.documentOpResponse(ops.Patch)
		s.documentOpResponse(ops.Post)
		s.documentOpResponse(ops.Delete)
		s.documentOpResponse(ops.Put)
		if strings.HasPrefix(path, "/a/") {
			continue
		}
		outPath := "/a" + path
		delete(jsonSpec.Spec().Paths.Paths, path)
		jsonSpec.Spec().Paths.Paths[outPath] = ops
	}
	resp.WriteAsJson(jsonSpec.Spec())

}

// documentOpResponse adds a description on response to comply with Swagger spec
func (s *Handler) documentOpResponse(p *spec.Operation) {
	if p == nil || p.Responses == nil || p.Responses.StatusCodeResponses == nil {
		return
	}
	if success, ok := p.Responses.StatusCodeResponses[200]; ok {
		success.Description = "Successful response"
		p.Responses.StatusCodeResponses[200] = success
	}
}

// ConfigFormsDiscovery serves an XML description for building a form
func (s *Handler) ConfigFormsDiscovery(req *restful.Request, rsp *restful.Response) {
	serviceName := req.PathParameter("ServiceName")
	if serviceName == "" {
		service.RestError500(req, rsp, errors.BadRequest("configs", "Please provide a service name"))
	}

	form := config.ExposedConfigsForService(serviceName)
	if form == nil {
		service.RestError404(req, rsp, errors.NotFound("configs", "Cannot find service "+serviceName))
		return
	}
	rsp.WriteAsXml(form.Serialize(i18n.UserLanguagesFromRestRequest(req, config.Default())...))
	return

}

// SchedulerActionsDiscovery lists all registered actions
func (s *Handler) SchedulerActionsDiscovery(req *restful.Request, rsp *restful.Response) {
	actionManager := actions.GetActionsManager()
	allActions := actionManager.DescribeActions(i18n.UserLanguagesFromRestRequest(req, config.Default())...)
	response := &rest.SchedulerActionsResponse{
		Actions: make(map[string]*rest.ActionDescription, len(allActions)),
	}
	for name, a := range allActions {
		t := a.Tint
		if ct, o := actions.CategoryTints[a.Category]; o && t == "" {
			t = ct
		}
		response.Actions[name] = &rest.ActionDescription{
			Name:              a.ID,
			Icon:              a.Icon,
			Label:             a.Label,
			Tint:              t,
			Description:       a.Description,
			SummaryTemplate:   a.SummaryTemplate,
			Category:          a.Category,
			InputDescription:  a.InputDescription,
			OutputDescription: a.OutputDescription,
			HasForm:           a.HasForm,
		}
	}
	rsp.WriteEntity(response)
}

// SchedulerActionFormDiscovery sends an XML-serialized form for building parameters for a given action
func (s *Handler) SchedulerActionFormDiscovery(req *restful.Request, rsp *restful.Response) {
	actionName := req.PathParameter("ActionName")
	var form *forms.Form
	if strings.HasPrefix(actionName, "proto:") {
		protoName := strings.TrimPrefix(actionName, "proto:")
		var asSwitch bool
		if strings.HasPrefix(protoName, "switch:") {
			asSwitch = true
			protoName = strings.TrimPrefix(protoName, "switch:")
		}
		switch protoName {
		case "idm.UserSingleQuery":
			form = protos.GenerateProtoToForm(&idm.UserSingleQuery{}, asSwitch)
		case "idm.RoleSingleQuery":
			form = protos.GenerateProtoToForm(&idm.RoleSingleQuery{}, asSwitch)
		case "idm.WorkspaceSingleQuery":
			form = protos.GenerateProtoToForm(&idm.WorkspaceSingleQuery{}, asSwitch)
		case "idm.ACLSingleQuery":
			form = protos.GenerateProtoToForm(&idm.ACLSingleQuery{}, asSwitch)
			a := protos.GenerateProtoToForm(&idm.ACLAction{})
			if asSwitch {
				// Patch Actions field manually
				sw := form.Groups[0].Fields[0].(*forms.SwitchField)
				sw.Values = append(sw.Values, &forms.SwitchValue{
					Name:  "Actions",
					Value: "Actions",
					Label: "Actions",
					Fields: []forms.Field{&forms.ReplicableFields{
						Id:          "Actions",
						Title:       "Actions",
						Description: "Acl Actions",
						Mandatory:   true,
						Fields:      a.Groups[0].Fields,
					}},
				})
			} else {
				form.Groups[0].Fields = append(form.Groups[0].Fields, &forms.ReplicableFields{
					Id:          "Actions",
					Title:       "Actions",
					Description: "Acl Actions",
					Fields:      a.Groups[0].Fields,
				})
			}
		case "tree.Query":
			form = protos.GenerateProtoToForm(&tree.Query{}, asSwitch)
		case "jobs.ActionOutputSingleQuery":
			form = protos.GenerateProtoToForm(&jobs.ActionOutputSingleQuery{}, asSwitch)
		case "jobs.ContextMetaSingleQuery":
			form = protos.GenerateProtoToForm(&jobs.ContextMetaSingleQuery{}, asSwitch)
			// Select Choices
			selectChoices := []map[string]string{
				{servicecontext.HttpMetaRemoteAddress: servicecontext.HttpMetaRemoteAddress},
				{servicecontext.HttpMetaUserAgent: servicecontext.HttpMetaUserAgent},
				{servicecontext.HttpMetaContentType: servicecontext.HttpMetaContentType},
				{servicecontext.HttpMetaProtocol: servicecontext.HttpMetaProtocol},
				{servicecontext.HttpMetaHostname: servicecontext.HttpMetaHostname},
				{servicecontext.HttpMetaRequestMethod: servicecontext.HttpMetaRequestMethod},
				{servicecontext.HttpMetaRequestURI: servicecontext.HttpMetaRequestURI},
				{servicecontext.HttpMetaCookiesString: servicecontext.HttpMetaCookiesString},
				//{servicecontext.ClientTime: servicecontext.ClientTime},
				{servicecontext.ServerTime: servicecontext.ServerTime},
			}
			// Add SwitchField for PolicyCondition
			condField := &forms.SwitchField{
				Name:        "Condition",
				Label:       "Condition",
				Description: "Condition",
			}
			for name, f := range ladon.ConditionFactories {
				condition := f()
				condForm := protos.GenerateProtoToForm(condition, false)
				condField.Values = append(condField.Values, &forms.SwitchValue{
					Name:   name,
					Value:  name,
					Label:  name,
					Fields: condForm.Groups[0].Fields,
				})
			}
			if asSwitch {
				sw := form.Groups[0].Fields[0].(*forms.SwitchField)
				sw.Values[0].Fields[0].(*forms.FormField).Type = forms.ParamSelect
				sw.Values[0].Fields[0].(*forms.FormField).ChoicePresetList = selectChoices
				sw.Values[0].Fields = append(sw.Values[0].Fields, condField)
			} else {
				form.Groups[0].Fields[0].(*forms.FormField).Type = forms.ParamSelect
				form.Groups[0].Fields[0].(*forms.FormField).ChoicePresetList = selectChoices
				form.Groups[0].Fields = append(form.Groups[0].Fields, condField)
			}
		}
	} else {
		actionManager := actions.GetActionsManager()
		var err error
		form, err = actionManager.LoadActionForm(actionName)
		if err != nil {
			service.RestErrorDetect(req, rsp, err)
			return
		}
	}
	if form == nil {
		service.RestError404(req, rsp, fmt.Errorf("cannot find form"))
	}
	rsp.WriteAsXml(form.Serialize(i18n.UserLanguagesFromRestRequest(req, config.Default())...))
}
