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
	net2 "net"
	"net/url"
	"strings"
	"time"

	restful "github.com/emicklei/go-restful/v3"
	"github.com/go-openapi/spec"
	"github.com/ory/ladon"
	"go.uber.org/zap"

	"github.com/pydio/cells/v4/common"
	"github.com/pydio/cells/v4/common/auth/claim"
	"github.com/pydio/cells/v4/common/config"
	"github.com/pydio/cells/v4/common/forms"
	"github.com/pydio/cells/v4/common/forms/protos"
	"github.com/pydio/cells/v4/common/log"
	"github.com/pydio/cells/v4/common/proto/idm"
	"github.com/pydio/cells/v4/common/proto/jobs"
	"github.com/pydio/cells/v4/common/proto/object"
	pbregistry "github.com/pydio/cells/v4/common/proto/registry"
	"github.com/pydio/cells/v4/common/proto/rest"
	"github.com/pydio/cells/v4/common/proto/tree"
	"github.com/pydio/cells/v4/common/registry"
	"github.com/pydio/cells/v4/common/runtime"
	"github.com/pydio/cells/v4/common/service"
	servicecontext "github.com/pydio/cells/v4/common/service/context"
	"github.com/pydio/cells/v4/common/service/errors"
	"github.com/pydio/cells/v4/common/utils/i18n"
	"github.com/pydio/cells/v4/common/utils/net"
	"github.com/pydio/cells/v4/discovery/config/lang"
	"github.com/pydio/cells/v4/scheduler/actions"
)

/*
****************************
PUBLIC ENDPOINTS FOR DISCOVERY
*****************************
*/
func withPath(u *url.URL, p string) *url.URL {
	u2 := *u
	u2.Path = p
	return &u2
}

func withScheme(u *url.URL, s string) *url.URL {
	u2 := *u
	u2.Scheme = s
	return &u2
}

// EndpointsDiscovery publishes a list of available endpoints
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

	urlParsed := net.ExternalDomainFromRequest(req.Request)
	log.Logger(req.Request.Context()).Debug("Request", zap.Any("mainUrl", urlParsed))

	wsProtocol := "ws"
	if urlParsed.Scheme == "https" {
		wsProtocol = "wss"
	}

	endpointResponse.Endpoints["rest"] = withPath(urlParsed, common.DefaultRouteREST).String()
	endpointResponse.Endpoints["openapi"] = withPath(urlParsed, "/a/config/discovery/openapi").String()
	endpointResponse.Endpoints["forms"] = withPath(urlParsed, "/a/config/discovery/forms").String() + "/{serviceName}"
	endpointResponse.Endpoints["oidc"] = withPath(urlParsed, "/auth").String()
	endpointResponse.Endpoints["s3"] = withPath(urlParsed, "/io").String()
	endpointResponse.Endpoints["chats"] = withScheme(withPath(urlParsed, "/ws/chat"), wsProtocol).String()
	endpointResponse.Endpoints["websocket"] = withScheme(withPath(urlParsed, "/ws/event"), wsProtocol).String()
	endpointResponse.Endpoints["frontend"] = withPath(urlParsed, "").String()

	if urlParsed.Scheme == "http" {
		if external := runtime.GrpcExternalPort(); external != "" {
			endpointResponse.Endpoints["grpc"] = external
		} else {
			// Pure HTTP and no grpc_external : detect GRPC_CLEAR Service Port
			var grpcPorts []string
			reg := servicecontext.GetRegistry(s.MainCtx)
			if ss, e := reg.List(registry.WithName(common.ServiceGatewayGrpcClear), registry.WithType(pbregistry.ItemType_SERVICE)); e == nil && len(ss) > 0 {
				for _, s := range ss {
					for _, n := range reg.ListAdjacentItems(
						registry.WithAdjacentSourceItems([]registry.Item{s}),
						registry.WithAdjacentTargetOptions(registry.WithType(pbregistry.ItemType_SERVER)),
					) {
						for _, a := range reg.ListAdjacentItems(
							registry.WithAdjacentSourceItems([]registry.Item{n}),
							registry.WithAdjacentTargetOptions(registry.WithType(pbregistry.ItemType_ADDRESS)),
						) {
							if _, p, e := net2.SplitHostPort(a.Name()); e == nil {
								/*strings.ReplaceAll(a.Name(), "[::]:", "")*/
								grpcPorts = append(grpcPorts, p)
							}
						}
					}
				}
			}
			if len(grpcPorts) > 0 {
				endpointResponse.Endpoints["grpc"] = strings.Join(grpcPorts, ",")
			}
		}
	}

	resp.WriteEntity(endpointResponse)

}

// OpenApiDiscovery prints out the Swagger Spec in JSON format
func (s *Handler) OpenApiDiscovery(req *restful.Request, resp *restful.Response) {

	p := net.ExternalDomainFromRequest(req.Request)
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
		if strings.HasPrefix(path, common.DefaultRouteREST+"/") {
			continue
		}
		outPath := common.DefaultRouteREST + path
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
	rsp.WriteAsXml(form.Serialize(i18n.UserLanguagesFromRestRequest(req, config.Get())...))

}

// SchedulerActionsDiscovery lists all registered actions
func (s *Handler) SchedulerActionsDiscovery(req *restful.Request, rsp *restful.Response) {
	actionManager := actions.GetActionsManager()
	allActions := actionManager.DescribeActions(i18n.UserLanguagesFromRestRequest(req, config.Get())...)
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
			IsInternal:        a.IsInternal,
			Tint:              t,
			Description:       a.Description,
			SummaryTemplate:   a.SummaryTemplate,
			Category:          a.Category,
			InputDescription:  a.InputDescription,
			OutputDescription: a.OutputDescription,
			HasForm:           a.HasForm,
			FormModule:        a.FormModule,
			FormModuleProps:   a.FormModuleProps,
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
			form = protos.GenerateProtoToForm("userSingleQuery", &idm.UserSingleQuery{}, asSwitch)
		case "idm.RoleSingleQuery":
			form = protos.GenerateProtoToForm("roleSingleQuery", &idm.RoleSingleQuery{}, asSwitch)
		case "idm.WorkspaceSingleQuery":
			form = protos.GenerateProtoToForm("workspaceSingleQuery", &idm.WorkspaceSingleQuery{}, asSwitch)
		case "idm.ACLSingleQuery":
			form = protos.GenerateProtoToForm("aclSingleQuery", &idm.ACLSingleQuery{}, asSwitch)
			a := protos.GenerateProtoToForm("aclAction", &idm.ACLAction{}, false)
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
			form = protos.GenerateProtoToForm("treeQuery", &tree.Query{}, asSwitch)
		case "jobs.ActionOutputSingleQuery":
			form = protos.GenerateProtoToForm("actionOutputSingleQuery", &jobs.ActionOutputSingleQuery{}, asSwitch)
		case "jobs.TriggerFilterQuery":
			form = protos.GenerateProtoToForm("triggerFilterQuery", &jobs.TriggerFilterQuery{}, asSwitch)
			eventsField := &forms.FormField{
				Name: "EventNames",
				Type: forms.ParamSelect,
				ChoicePresetList: []map[string]string{
					{jobs.NodeChangeEventName(tree.NodeChangeEvent_CREATE): "Create Node"},
					{jobs.NodeChangeEventName(tree.NodeChangeEvent_READ): "Read Node"},
					{jobs.NodeChangeEventName(tree.NodeChangeEvent_DELETE): "Delete Node"},
					{jobs.NodeChangeEventName(tree.NodeChangeEvent_UPDATE_PATH): "Move Node"},
					{jobs.NodeChangeEventName(tree.NodeChangeEvent_UPDATE_CONTENT): "Content Updated"},
					{jobs.NodeChangeEventName(tree.NodeChangeEvent_UPDATE_META): "Meta Updated"},
					{jobs.NodeChangeEventName(tree.NodeChangeEvent_UPDATE_USER_META): "User Meta Updated"},
					{jobs.IdmChangeEventName(jobs.IdmSelectorType_User, idm.ChangeEventType_CREATE): "User Created"},
					{jobs.IdmChangeEventName(jobs.IdmSelectorType_User, idm.ChangeEventType_DELETE): "User Deleted"},
					{jobs.IdmChangeEventName(jobs.IdmSelectorType_User, idm.ChangeEventType_LOGIN): "User Logs In"},
					{jobs.IdmChangeEventName(jobs.IdmSelectorType_User, idm.ChangeEventType_LOGOUT): "User Logs Out"},
					{jobs.IdmChangeEventName(jobs.IdmSelectorType_User, idm.ChangeEventType_UPDATE): "User Updated"},
					{jobs.IdmChangeEventName(jobs.IdmSelectorType_User, idm.ChangeEventType_READ): "User Accessed"},
					{jobs.IdmChangeEventName(jobs.IdmSelectorType_Role, idm.ChangeEventType_CREATE): "Role Created"},
					{jobs.IdmChangeEventName(jobs.IdmSelectorType_Role, idm.ChangeEventType_DELETE): "Role Deleted"},
					{jobs.IdmChangeEventName(jobs.IdmSelectorType_Role, idm.ChangeEventType_UPDATE): "Role Updated"},
					{jobs.IdmChangeEventName(jobs.IdmSelectorType_Workspace, idm.ChangeEventType_CREATE): "Workspace Created"},
					{jobs.IdmChangeEventName(jobs.IdmSelectorType_Workspace, idm.ChangeEventType_DELETE): "Workspace Deleted"},
					{jobs.IdmChangeEventName(jobs.IdmSelectorType_Workspace, idm.ChangeEventType_UPDATE): "Workspace Updated"},
					{jobs.IdmChangeEventName(jobs.IdmSelectorType_Acl, idm.ChangeEventType_CREATE): "Acl Created"},
					{jobs.IdmChangeEventName(jobs.IdmSelectorType_Acl, idm.ChangeEventType_DELETE): "Acl Deleted"},
					{jobs.IdmChangeEventName(jobs.IdmSelectorType_Acl, idm.ChangeEventType_UPDATE): "Acl Updated"},
				},
			}
			if asSwitch {
				sw := form.Groups[0].Fields[0].(*forms.SwitchField)
				for _, f := range sw.Values {
					if f.Name == "EventNames" {
						eventsField.Label = f.Label
						replicable := f.Fields[0].(*forms.ReplicableFields)
						replicable.Fields = []forms.Field{eventsField}
					}
				}
			} else {
				for _, f := range form.Groups[0].Fields {
					if field, ok := f.(*forms.ReplicableFields); ok && field.Id == "EventNames" {
						eventsField.Label = field.Fields[0].(*forms.FormField).Label
						eventsField.Description = field.Fields[0].(*forms.FormField).Description
						field.Fields = []forms.Field{eventsField}
					}
				}
			}
		case "object.DataSourceSingleQuery":
			form = protos.GenerateProtoToForm("dataSourceSingleQuery", &object.DataSourceSingleQuery{}, asSwitch)
		case "jobs.DataSelectorSingleQuery":
			form = protos.GenerateProtoToForm("dataSelectorSingleQuery", &jobs.DataSelectorSingleQuery{}, asSwitch)
		case "jobs.ContextMetaSingleQuery", "policy.Conditions":
			// Add SwitchField for PolicyCondition
			condField := &forms.SwitchField{
				Name:        "Condition",
				Label:       "Condition",
				Description: "Condition",
			}
			for name, f := range ladon.ConditionFactories {
				condition := f()
				condForm := protos.GenerateProtoToForm("condition"+condition.GetName(), condition, false)
				// Do not enqueue conditions with zero fields: they are not usable
				if len(condForm.Groups[0].Fields) > 0 {
					condField.Values = append(condField.Values, &forms.SwitchValue{
						Name:   name,
						Value:  name,
						Label:  "contextMetaCondition." + name,
						Fields: condForm.Groups[0].Fields,
					})
				}
			}
			if protoName == "policy.Conditions" {
				// Specific case to just build Conditions form
				form = &forms.Form{Groups: []*forms.Group{{
					Fields: []forms.Field{condField},
				}}}
			} else {
				// Build FieldName / Condition Form
				form = protos.GenerateProtoToForm("contextMetaSingleQuery", &jobs.ContextMetaSingleQuery{}, asSwitch)
				selectChoices := []map[string]string{
					{servicecontext.HttpMetaRemoteAddress: "contextMetaField." + servicecontext.HttpMetaRemoteAddress},
					{servicecontext.HttpMetaUserAgent: "contextMetaField." + servicecontext.HttpMetaUserAgent},
					{servicecontext.HttpMetaContentType: "contextMetaField." + servicecontext.HttpMetaContentType},
					{servicecontext.HttpMetaProtocol: "contextMetaField." + servicecontext.HttpMetaProtocol},
					{servicecontext.HttpMetaHost: "contextMetaField." + servicecontext.HttpMetaHost},
					{servicecontext.HttpMetaHostname: "contextMetaField." + servicecontext.HttpMetaHostname},
					{servicecontext.HttpMetaPort: "contextMetaField." + servicecontext.HttpMetaPort},
					{servicecontext.HttpMetaRequestMethod: "contextMetaField." + servicecontext.HttpMetaRequestMethod},
					{servicecontext.HttpMetaRequestURI: "contextMetaField." + servicecontext.HttpMetaRequestURI},
					{servicecontext.HttpMetaCookiesString: "contextMetaField." + servicecontext.HttpMetaCookiesString},
					//{servicecontext.ClientTime: servicecontext.ClientTime},
					{servicecontext.ServerTime: "contextMetaField." + servicecontext.ServerTime},
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
		return
	}
	form.I18NBundle = lang.Bundle()
	rsp.WriteAsXml(form.Serialize(i18n.UserLanguagesFromRestRequest(req, config.Get())...))
}

// ListSites implements /config/sites GET API
func (s *Handler) ListSites(req *restful.Request, rsp *restful.Response) {
	// There is an optional Filter string on req

	ss, err := config.LoadSites()
	if err != nil {
		service.RestError500(req, rsp, err)
		return
	}

	sites := &rest.ListSitesResponse{}
	sites.Sites = ss
	rsp.WriteEntity(sites)
}
