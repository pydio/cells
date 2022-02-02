/*
 * Copyright (c) 2021. Abstrium SAS <team (at) pydio.com>
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

package modifiers

import (
	"context"

	"github.com/pydio/cells/v4/common"
	"github.com/pydio/cells/v4/common/client/grpc"
	"github.com/pydio/cells/v4/common/config"
	"github.com/pydio/cells/v4/common/proto/idm"
	"github.com/pydio/cells/v4/common/proto/service"
	"github.com/pydio/cells/v4/common/service/frontend"
	json "github.com/pydio/cells/v4/common/utils/jsonx"
)

// MetaUserRegModifier adds/updates some registry contributions for rendering metadata.
func MetaUserRegModifier(ctx context.Context, status frontend.RequestStatus, registry *frontend.Cpydio_registry) error {

	client := idm.NewUserMetaServiceClient(grpc.GetClientConnFromCtx(status.RuntimeCtx, common.ServiceUserMeta))
	respStream, e := client.ListUserMetaNamespace(ctx, &idm.ListUserMetaNamespaceRequest{})
	if e != nil {
		return e
	}
	defer respStream.CloseSend()
	var namespaces []*idm.UserMetaNamespace
	for {
		r, e := respStream.Recv()
		if e != nil {
			break
		}
		namespaces = append(namespaces, r.UserMetaNamespace)
	}
	if len(namespaces) == 0 {
		return nil
	}

	columns := &frontend.Ccolumns{}
	searchables := make(map[string]string)
	searchableRenderers := make(map[string]string)
	var crtAdmin bool
	if status.User.Logged && status.User.UserObject.Attributes != nil {
		if p, ok := status.User.UserObject.Attributes[idm.UserAttrProfile]; ok && p == common.PydioProfileAdmin {
			crtAdmin = true
		}
	}

	for _, ns := range namespaces {

		var readAdminOnly bool
		for _, p := range ns.Policies {
			if p.Action == service.ResourcePolicyAction_READ && p.Subject == "profile:admin" {
				readAdminOnly = true
			}
		}
		if readAdminOnly && !crtAdmin {
			continue
		}

		def, dE := ns.UnmarshallDefinition()
		if dE != nil || def.GetType() == "json" {
			continue
		}

		column := &frontend.Cadditional_column{
			AttrmessageString:    ns.Label,
			AttrattributeName:    ns.Namespace,
			AttrsortType:         "String",
			AttrdefaultVisibilty: "true",
		}
		if ns.Indexable {
			searchables[ns.Namespace] = ns.Label
		}
		if def.DefaultHide() {
			column.AttrdefaultVisibilty = "false"
		}

		switch def.GetType() {
		case "stars_rate":
			column.AttrreactModifier = "ReactMeta.Renderer.renderStars"
			column.AttrsortType = "CellSorterValue"
			if ns.Indexable {
				searchableRenderers[ns.Namespace] = "ReactMeta.Renderer.formPanelStars"
			}
		case "css_label":
			column.AttrreactModifier = "ReactMeta.Renderer.renderCSSLabel"
			column.AttrsortType = "CellSorterValue"
			if ns.Indexable {
				searchableRenderers[ns.Namespace] = "ReactMeta.Renderer.formPanelCssLabels"
			}
		case "choice":
			column.AttrreactModifier = "ReactMeta.Renderer.renderSelector"
			column.AttrsortType = "CellSorterValue"
			if def.GetData() != nil {
				remarshed, _ := json.Marshal(def.GetData())
				column.AttrmetaAdditional = string(remarshed)
			}
			if ns.Indexable {
				searchableRenderers[ns.Namespace] = "ReactMeta.Renderer.formPanelSelectorFilter"
			}
		case "tags":
			column.AttrreactModifier = "ReactMeta.Renderer.renderTagsCloud"
			if ns.Indexable {
				searchableRenderers[ns.Namespace] = "ReactMeta.Renderer.formPanelTags"
			}
		case "integer":
			column.AttrreactModifier = "ReactMeta.Renderer.renderInteger"
			column.AttrsortType = "Number"
			if def.GetData() != nil {
				remarshed, _ := json.Marshal(def.GetData())
				column.AttrmetaAdditional = string(remarshed)
			}
			if ns.Indexable {
				searchableRenderers[ns.Namespace] = "ReactMeta.Renderer.formPanelInteger"
			}
		case "boolean":
			column.AttrreactModifier = "ReactMeta.Renderer.renderBoolean"
			column.AttrsortType = "Number"
			if ns.Indexable {
				searchableRenderers[ns.Namespace] = "ReactMeta.Renderer.formPanelBoolean"
			}
		case "date":
			column.AttrreactModifier = "ReactMeta.Renderer.renderDate"
			column.AttrsortType = "Number"
			if def.GetData() != nil {
				remarshed, _ := json.Marshal(def.GetData())
				column.AttrmetaAdditional = string(remarshed)
			}
			if ns.Indexable {
				searchableRenderers[ns.Namespace] = "ReactMeta.Renderer.formPanelDate"
			}
		}
		columns.Cadditional_column = append(columns.Cadditional_column, column)
	}

	// Add a section in the registry_contribution
	if registry.Cclient_configs == nil {
		registry.Cclient_configs = &frontend.Cclient_configs{
			Ccomponent_config: []*frontend.Ccomponent_config{},
		}
	}

	registry.Cclient_configs.Ccomponent_config = append(registry.Cclient_configs.Ccomponent_config, &frontend.Ccomponent_config{
		Attrcomponent: "FilesList",
		Ccolumns:      columns,
	})

	if len(searchables) > 0 {
		appendPart := true
		tPart := &frontend.Ctemplate_part{
			AttrajxpId:    "search_container",
			AttrajxpClass: "SearchEngine",
			Attrtheme:     "material",
		}
		optionsData := make(map[string]interface{})

		for _, part := range registry.Cclient_configs.Ctemplate_part {
			if part.AttrajxpId == "search_container" && part.AttrajxpClass == "SearchEngine" && part.Attrtheme == "material" {
				tPart = part
				var options map[string]interface{}
				if e := json.Unmarshal([]byte(part.AttrajxpOptions), &options); e == nil {
					optionsData = options
				}
				appendPart = false
				break
			}
		}
		optionsData["metaColumns"] = searchables
		optionsData["reactColumnsRenderers"] = searchableRenderers
		optionsData["indexContent"] = config.Get("services", common.ServiceGrpcNamespace_+common.ServiceSearch, "indexContent").Default(false).Bool()
		searchOptions, _ := json.Marshal(optionsData)
		tPart.AttrajxpOptions = string(searchOptions)
		if appendPart {
			registry.Cclient_configs.Ctemplate_part = append(registry.Cclient_configs.Ctemplate_part, tPart)
		}
	}

	return nil
}
