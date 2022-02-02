package rest

import "github.com/pydio/cells/v4/common/proto/rest"

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
						Advanced:  true,
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
					Metadata: &rest.SettingsEntryMeta{
						IconClass: "mdi mdi-folder-open",
						Component: "AdminWorkspaces.WsDashboard",
					},
				},
				{
					Key:         "datasources",
					Label:       "settings.3b",
					Description: "settings.3b",
					Metadata: &rest.SettingsEntryMeta{
						IconClass: "mdi mdi-database",
						Component: "AdminWorkspaces.DataSourcesBoard",
						Props:     `{"versioningReadonly":true,"storageTypes":["LOCAL","S3"]}`,
					},
				},
				{
					Key:         "metadata",
					Label:       "ajxp_admin.menu.metadata",
					Description: "ajxp_admin.menu.metadata.description",
					Metadata: &rest.SettingsEntryMeta{
						IconClass: "mdi mdi-tag-multiple",
						Component: "AdminWorkspaces.MetadataBoard",
					},
				},
				{
					Key:         "migration",
					Label:       "migration.title",
					Description: "migration.legend",
					Metadata: &rest.SettingsEntryMeta{
						IconClass: "mdi mdi-import",
						Advanced:  true,
						Component: "MigrationComponents.Dashboard",
					},
				},
				{
					Key:         "template-paths",
					Label:       "settings.3c",
					Description: "settings.3c",
					Metadata: &rest.SettingsEntryMeta{
						IconClass: "mdi mdi-file-tree",
						Component: "AdminWorkspaces.VirtualNodes",
						Advanced:  true,
						Props:     `{"readonly":true}`,
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
					Label:       "updater.title",
					Description: "updater.legend",
					Metadata: &rest.SettingsEntryMeta{
						IconClass: "mdi mdi-update",
						Component: "AdminPlugins.UpdaterDashboard",
					},
				},
				{
					Key:         "scheduler",
					Label:       "ajxp_admin.scheduler.title",
					Description: "ajxp_admin.scheduler.legend",
					Metadata: &rest.SettingsEntryMeta{
						IconClass: "mdi mdi-timetable",
						Component: "AdminScheduler.Dashboard",
						Advanced:  true,
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
						Props:     "{\"pluginId\":\"core.pydio\"}",
					},
				},
				{
					Key:         "mailer",
					Label:       "plugtype.title.mailer",
					Description: "plugtype.desc.mailer",
					Metadata: &rest.SettingsEntryMeta{
						IconClass: "mdi mdi-email",
						Component: "AdminPlugins.ServiceEditor",
						Props:     `{"serviceName":"pydio.grpc.mailer","pluginId":"core.mailer"}`,
					},
				},
				{
					Key:         "core.auth",
					Label:       "ajxp_admin.menu.11",
					Description: "plugtype.desc.auth",
					Metadata: &rest.SettingsEntryMeta{
						IconClass: "mdi mdi-account-key",
						Component: "AdminPlugins.AuthenticationPluginsDashboard",
						Props:     `{"pluginId":"core.auth"}`,
					},
				},
				{
					Key:         "uploader",
					Label:       "ajxp_admin.menu.9",
					Description: "ajxp_admin.menu.10",
					Alias:       "/config/plugins/uploader",
					Metadata: &rest.SettingsEntryMeta{
						IconClass: "mdi mdi-upload",
						Component: "AdminPlugins.CoreAndPluginsDashboard",
						Props:     "{\"pluginId\":\"core.uploader\"}",
						Advanced:  true,
					},
				},
				{
					Key:         "manager",
					Label:       "ajxp_admin.menu.18",
					Description: "ajxp_admin.menu.19",
					Alias:       "/config/all",
					Metadata: &rest.SettingsEntryMeta{
						IconClass: "mdi mdi-google-circles-group",
						Component: "AdminPlugins.PluginsManager",
						Advanced:  true,
					},
				},
			},
		},
		/*
			{
				Key:         "developer",
				Label:       "settings.144",
				Description: "settings.144",
				Children: []*rest.SettingsEntry{
					{
						Key:         "apis",
						Label:       "Rest APIs",
						Description: "Rest APIs",
						Metadata: &rest.SettingsEntryMeta{
							IconClass: "mdi mdi-routes",
							Component: "AdminPlugins.OpenApiDashboard",
							Advanced:  true,
						},
					},
					{
						Key:         "jsdocs",
						Label:       "Javascript Docs",
						Description: "Javascript Classes Documentation",
						Metadata: &rest.SettingsEntryMeta{
							IconClass: "mdi mdi-nodejs",
							Component: "AdminPlugins.JSDocsDashboard",
							Advanced:  true,
						},
					},
				},
			},
		*/
	},
}
