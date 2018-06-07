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
	"encoding/json"

	"github.com/emicklei/go-restful"
	"go.uber.org/zap"
	"go.uber.org/zap/zapcore"

	"github.com/pydio/cells/common"
	"github.com/pydio/cells/common/log"
	"github.com/pydio/cells/common/proto/rest"
)

var settingsNode = &rest.SettingsMenuResponse{
	RootMetadata: &rest.SettingsEntryMeta{
		IconClass: "mdi mdi-view-dashboard",
		Component: "AdminComponents.SimpleDashboard",
	},
	Sections: []*rest.SettingsSection{
		{
			Key:         "idm",
			Label:       "settings.174",
			Description: "settings.174",
			Children: []*rest.SettingsEntry{
				{
					Key:         "users",
					Label:       "settings.2",
					Description: "settings.139",
					Manager:     "Pydio\\Access\\Driver\\DataProvider\\Provisioning\\UsersManager",
					Metadata: &rest.SettingsEntryMeta{
						IconClass: "mdi mdi-account-circle",
						Component: "AdminPeople.Dashboard",
						Props:     `{"advancedAcl":false}`,
					},
				},
				{
					Key:         "roles",
					Label:       "settings.69",
					Description: "settings.71",
					Manager:     "Pydio\\Access\\Driver\\DataProvider\\Provisioning\\RolesManager",
					Metadata: &rest.SettingsEntryMeta{
						IconClass: "mdi mdi-account-card-details",
						Component: "AdminPeople.RolesDashboard",
						Props:     `{"advancedAcl":false}`,
					},
				},
				{
					Key:         "policies",
					Label:       "settings.176",
					Description: "settings.177",
					Metadata: &rest.SettingsEntryMeta{
						IconClass: "mdi mdi-security",
						Component: "AdminPeople.PoliciesBoard",
						Props:     `{"readonly":true}`,
					},
				},
			},
		},
		{
			Key:         "data",
			Label:       "settings.175",
			Description: "settings.175",
			Children: []*rest.SettingsEntry{
				{
					Key:         "workspaces",
					Label:       "settings.3",
					Description: "settings.138",
					Manager:     "Pydio\\Access\\Driver\\DataProvider\\Provisioning\\WorkspacesManager",
					Metadata: &rest.SettingsEntryMeta{
						IconClass: "mdi mdi-folder-open",
						Component: "AdminWorkspaces.WsDashboard",
						Props:     `{"filter":"workspaces"}`,
					},
				},
				{
					Key:         "datasources",
					Label:       "settings.3b",
					Description: "settings.3b",
					Metadata: &rest.SettingsEntryMeta{
						IconClass: "mdi mdi-database",
						Component: "AdminWorkspaces.DataSourcesBoard",
						Props:     `{"versioningReadonly":true}`,
					},
				},
				{
					Key:         "template-paths",
					Label:       "settings.3c",
					Description: "settings.3c",
					Metadata: &rest.SettingsEntryMeta{
						IconClass: "mdi mdi-file-tree",
						Component: "AdminWorkspaces.VirtualNodes",
						Props:     `{"readonly":true}`,
					},
				},
				{
					Key:         "metadata",
					Label:       "Metadata",
					Description: "Metadata Definition",
					Metadata: &rest.SettingsEntryMeta{
						IconClass: "mdi mdi-tag-multiple",
						Component: "AdminWorkspaces.MetadataBoard",
					},
				},
			},
		},
		{
			Key:         "admin",
			Label:       "settings.111",
			Description: "settings.141",
			Children: []*rest.SettingsEntry{
				{
					Key:         "services",
					Label:       "settings.172",
					Description: "settings.173",
					Metadata: &rest.SettingsEntryMeta{
						IconClass: "mdi mdi-access-point-network",
						Component: "AdminServices.Dashboard",
					},
				},
				{
					Key:         "logs",
					Label:       "settings.4",
					Description: "settings.142",
					Metadata: &rest.SettingsEntryMeta{
						IconClass: "mdi mdi-pulse",
						Component: "AdminLogs.Dashboard",
						Props:     `{"disableExport":true}`,
					},
				},
				{
					Key:         "update",
					Label:       "updater.1",
					Description: "updater.2",
					Metadata: &rest.SettingsEntryMeta{
						IconClass: "mdi mdi-update",
						Component: "AdminPlugins.UpdaterDashboard",
					},
				},
				{
					Key:         "scheduler",
					Label:       "action.scheduler.18",
					Description: "action.scheduler.22",
					Metadata: &rest.SettingsEntryMeta{
						IconClass: "mdi mdi-timetable",
						Component: "AdminScheduler.Dashboard",
					},
				},
				{
					Key:         "php",
					Label:       "settings.5",
					Description: "settings.5",
					Manager:     "Pydio\\Access\\Driver\\DataProvider\\Provisioning\\DiagnosticManager",
					Metadata: &rest.SettingsEntryMeta{
						IconClass: "mdi mdi-language-php",
						Component: "AdminPlugins.DiagnosticDashboard",
					},
				},
			},
		},
		{
			Key:         "parameters",
			Label:       "settings.109",
			Description: "settings.136",
			Children: []*rest.SettingsEntry{
				{
					Key:         "core",
					Label:       "settings.98",
					Description: "settings.133",
					Metadata: &rest.SettingsEntryMeta{
						IconClass: "mdi mdi-settings-box",
						Component: "AdminPlugins.PluginEditor",
					},
				},
				{
					Key:         "core.auth",
					Label:       "ajxp_admin.menu.11",
					Description: "plugtype.desc.auth",
					Metadata: &rest.SettingsEntryMeta{
						IconClass: "mdi mdi-account-key",
						Component: "AdminPlugins.AuthenticationPluginsDashboard",
					},
				},
				{
					Key:         "core.conf",
					Label:       "ajxp_admin.menu.12",
					Description: "plugtype.desc.conf",
					Metadata: &rest.SettingsEntryMeta{
						IconClass: "mdi mdi-database",
						Component: "AdminPlugins.PluginEditor",
					},
				},
				{
					Key:         "uploader",
					Label:       "ajxp_admin.menu.9",
					Description: "ajxp_admin.menu.10",
					Alias:       "/config/plugins/uploader",
					Manager:     "Pydio\\Access\\Driver\\DataProvider\\Provisioning\\PluginsManager",
					Metadata: &rest.SettingsEntryMeta{
						IconClass: "mdi mdi-upload",
						Component: "AdminPlugins.CoreAndPluginsDashboard",
					},
				},
				{
					Key:         "mailer",
					Label:       "plugtype.title.mailer",
					Description: "plugtype.desc.mailer",
					Metadata: &rest.SettingsEntryMeta{
						IconClass: "mdi mdi-email",
						Component: "AdminPlugins.ServiceEditor",
						Props:     `{"serviceName":"pydio.grpc.mailer"}`,
					},
				},
			},
		},
		{
			Key:         "plugins",
			Label:       "ajxp_admin.menu.18",
			Description: "ajxp_admin.menu.18",
			Children: []*rest.SettingsEntry{
				{
					Key:         "manager",
					Label:       "ajxp_admin.menu.19",
					Description: "ajxp_admin.menu.19",
					Alias:       "/config/all",
					Manager:     "Pydio\\Access\\Driver\\DataProvider\\Provisioning\\PluginsManager",
					Metadata: &rest.SettingsEntryMeta{
						IconClass: "mdi mdi-google-circles-group",
						Component: "AdminPlugins.PluginsManager",
					},
				},
				{
					Key:         "apis",
					Label:       "Rest APIs",
					Description: "Rest APIs",
					Metadata: &rest.SettingsEntryMeta{
						IconClass: "mdi mdi-routes",
						Component: "AdminPlugins.OpenApiDashboard",
					},
				},
				{
					Key:         "jsdocs",
					Label:       "Javascript Docs",
					Description: "Javascript Classes Documentation",
					Metadata: &rest.SettingsEntryMeta{
						IconClass: "mdi mdi-nodejs",
						Component: "AdminPlugins.JSDocsDashboard",
					},
				},
			},
		},
	},
}

type FrontendHandler struct{}

// SwaggerTags list the names of the service tags declared in the swagger json implemented by this service
func (a *FrontendHandler) SwaggerTags() []string {
	return []string{"FrontendService"}
}

// Filter returns a function to filter the swagger path
func (a *FrontendHandler) Filter() func(string) string {
	return nil
}

// Log handles all HTTP requests sent to the FrontLogService, reads the message and directly returns.
// It then dispatches asynchronously the corresponding log message to technical and audit loggers.
func (a *FrontendHandler) FrontLog(req *restful.Request, rsp *restful.Response) {

	var message rest.FrontLogMessage
	req.ReadEntity(&message)
	rsp.WriteEntity(&rest.FrontLogResponse{Success: true})

	go func() {
		logger := log.Logger(req.Request.Context())

		zaps := []zapcore.Field{
			zap.String(common.KEY_FRONT_IP, message.Ip),
			zap.String(common.KEY_FRONT_USERID, message.UserId),
			zap.String(common.KEY_FRONT_WKSID, message.WorkspaceId),
			zap.String(common.KEY_FRONT_SOURCE, message.Source),
			zap.Strings(common.KEY_FRONT_NODES, message.Nodes),
		}

		if message.Level == rest.LogLevel_DEBUG || message.Level == rest.LogLevel_NOTICE {
			logger.Debug(message.Message, zaps...)
		} else if message.Level == rest.LogLevel_ERROR || message.Level == rest.LogLevel_WARNING {
			logger.Error(message.Message, zaps...)
		} else {
			logger.Info(message.Message, zaps...)
		}
	}()
}

func (a *FrontendHandler) SettingsMenu(req *restful.Request, rsp *restful.Response) {

	rsp.WriteEntity(settingsNode)

}

func (a *FrontendHandler) FrontBootConf(req *restful.Request, rsp *restful.Response) {

	data := map[string]string{
		"PackageType":   common.PackageType,
		"PackageLabel":  common.PackageLabel,
		"Version":       common.Version().String(),
		"BuildRevision": common.BuildRevision,
		"BuildStamp":    common.BuildStamp,
		"License":       "agplv3",
	}

	marshalled, _ := json.Marshal(data)

	response := &rest.FrontBootConfResponse{
		JsonData: map[string]string{
			"backend": string(marshalled),
		},
	}
	rsp.WriteEntity(response)

}
