package server

import (
	"context"

	"github.com/emicklei/go-restful"
	"github.com/gobuffalo/packr"
	"github.com/jinzhu/copier"
	"github.com/pydio/cells/common/config"
	"github.com/pydio/cells/common/log"
	"github.com/pydio/cells/common/service"
	"github.com/pydio/cells/common/service/frontend"
	"github.com/pydio/cells/frontend/state"
	"go.uber.org/zap"
)

type RestHandler struct {
	pool *state.PluginsPool
}

func NewRestHandler() *RestHandler {

	h := &RestHandler{}
	frontend.RegisterPluginBoxes(frontend.PluginBox{
		Box: packr.NewBox("/Users/charles/Sources/cells-front/plugins"),
		Exposes: []string{
			"access.gateway",
			"access.homepage",
			"access.settings",
			"action.share",
			"auth.pydio",
			"authfront.duosecurity",
			"authfront.http_basic",
			"authfront.http_server",
			"authfront.keystore",
			"authfront.session_login",
			"boot.conf",
			"cache.doctrine",
			"conf.pydio",
			"core.access",
			"core.auth",
			"core.authfront",
			"core.cache",
			"core.conf",
			"core.index",
			"core.log",
			"core.mailer",
			"core.meta",
			"core.metastore",
			"core.pydio",
			"core.uploader",
			"editor.libreoffice",
			"gui.ajax",
			"gui.mobile",
			"gui.user",
			"index.pydio",
			"log.pydio",
			"meta.user",
			"metastore.pydio",
		},
	})

	boxes := frontend.GetRegisteredPluginBoxes()
	httpFs := frontend.NewUnionHttpFs(boxes...)
	h.pool = state.NewPluginsPool()
	if e := h.pool.Load(httpFs); e != nil {
		log.Logger(context.Background()).Error("Cannot load plugins list", zap.Error(e))
	}
	return h
}

func (r *RestHandler) State(req *restful.Request, resp *restful.Response) {
	ctx := req.Request.Context()
	wsId := req.QueryParameter("ws")

	user := &state.User{}
	if e := user.Load(ctx); e != nil {
		service.RestError500(req, resp, e)
		return
	}
	user.LoadActiveWorkspace(wsId)
	//log.Logger(ctx).Info("Loaded User", zap.Any("workspaces", user.Workspaces), zap.String("activeWorkspace", user.ActiveWorkspace))

	cfg := config.Default()
	rolesConfigs := user.FlattenedRolesConfigs()

	status := state.RequestStatus{
		Config:        cfg,
		AclParameters: rolesConfigs.Get("parameters").(*config.Map),
		AclActions:    rolesConfigs.Get("actions").(*config.Map),
		WsScopes:      user.GetActiveScopes(),
		User:          user,
		NoClaims:      !user.Logged,
	}

	plugins := r.pool.PluginsForStatus(ctx, status)
	dumpReg := &state.Cpydio_registry{}
	dumpReg.Cplugins = &state.Cplugins{}
	dumpReg.Cactions = &state.Cactions{}
	dumpReg.Cclient_configs = &state.Cclient_configs{}
	dumpReg.Cuser = user.Publish(status, r.pool)

	for _, plugin := range plugins {

		configs := plugin.PluginConfigs(status)

		if p, ok := plugin.(*state.Cuploader); ok {
			clone := &state.Cuploader{}
			copier.Copy(&clone, p)
			clone.ExposeConfigs(configs)
			clone.Cregistry_contributions = nil
			dumpReg.Cplugins.Cuploader = append(dumpReg.Cplugins.Cuploader, clone)
		} else if p, ok := plugin.(*state.Ceditor); ok {
			clone := &state.Ceditor{}
			copier.Copy(&clone, p)
			clone.ExposeConfigs(configs)
			clone.Cregistry_contributions = nil
			dumpReg.Cplugins.Ceditor = append(dumpReg.Cplugins.Ceditor, clone)
		} else if p, ok := plugin.(*state.Cmeta); ok {
			clone := &state.Cmeta{}
			copier.Copy(&clone, p)
			clone.ExposeConfigs(configs)
			clone.Cregistry_contributions = nil
			dumpReg.Cplugins.Cmeta = append(dumpReg.Cplugins.Cmeta, clone)
		} else if p, ok := plugin.(*state.Cajxpdriver); ok {
			clone := &state.Cajxpdriver{}
			copier.Copy(&clone, p)
			clone.ExposeConfigs(configs)
			clone.Cregistry_contributions = nil
			dumpReg.Cplugins.Cajxpdriver = append(dumpReg.Cplugins.Cajxpdriver, clone)
		} else if p, ok := plugin.(*state.Cplugin); ok {
			clone := &state.Cplugin{}
			copier.Copy(&clone, p)
			clone.ExposeConfigs(configs)
			clone.Cregistry_contributions = nil
			dumpReg.Cplugins.Cplugin = append(dumpReg.Cplugins.Cplugin, clone)
		}
		contribs := plugin.GetRegistryContributions()
		if contribs != nil && contribs.Cactions != nil {
			actions := plugin.FilterActions(status, r.pool, plugin.GetRegistryContributions().Cactions.Caction)
			dumpReg.Cactions.MergeActions(actions)
		}
		if contribs != nil && contribs.Cclient_configs != nil {
			dumpReg.Cclient_configs.Ccomponent_config = append(dumpReg.Cclient_configs.Ccomponent_config, plugin.GetRegistryContributions().Cclient_configs.Ccomponent_config...)
			dumpReg.Cclient_configs.Ctemplate = append(dumpReg.Cclient_configs.Ctemplate, plugin.GetRegistryContributions().Cclient_configs.Ctemplate...)
			dumpReg.Cclient_configs.Ctemplate_part = append(dumpReg.Cclient_configs.Ctemplate_part, plugin.GetRegistryContributions().Cclient_configs.Ctemplate_part...)
		}

	}
	resp.WriteAsXml(dumpReg)
}
