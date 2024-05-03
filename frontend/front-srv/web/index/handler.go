/*
 * Copyright (c) 2023. Abstrium SAS <team (at) pydio.com>
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

package index

import (
	"compress/gzip"
	"context"
	"encoding/xml"
	"html/template"
	"net/http"
	"strings"

	"github.com/pydio/cells/v4/common"
	"github.com/pydio/cells/v4/common/config"
	pb "github.com/pydio/cells/v4/common/proto/registry"
	"github.com/pydio/cells/v4/common/registry"
	"github.com/pydio/cells/v4/common/runtime/runtimecontext"
	"github.com/pydio/cells/v4/common/service/frontend"
)

type IndexHandler struct {
	runtimeCtx        context.Context
	tpl               *template.Template
	loadingTpl        *template.Template
	frontendDetected  bool
	resetPasswordPath string
}

func NewIndexHandler(ctx context.Context, resetPasswordPath string) *IndexHandler {
	h := &IndexHandler{
		runtimeCtx:        ctx,
		resetPasswordPath: resetPasswordPath,
	}
	h.tpl, _ = template.New("index").Parse(Page)
	h.loadingTpl, _ = template.New("loading").Parse(loading)
	return h
}

func (h *IndexHandler) ServeHTTP(w http.ResponseWriter, r *http.Request) {

	pool, e := frontend.GetPluginsPool()
	if e != nil {
		w.WriteHeader(500)
		return
	}
	// Try to precompute registry
	ctx := r.Context()
	user := &frontend.User{}
	rolesConfigs := user.FlattenedRolesConfigs()

	c := config.Get()
	aclParameters := rolesConfigs.Val("parameters")
	aclActions := rolesConfigs.Val("actions")
	scopes := user.GetActiveScopes()

	status := frontend.RequestStatus{
		RuntimeCtx:    h.runtimeCtx,
		Config:        c,
		AclParameters: aclParameters,
		AclActions:    aclActions,
		WsScopes:      scopes,
		User:          user,
		NoClaims:      !user.Logged,
		Lang:          "en",
		Request:       r,
	}
	registry, e := pool.RegistryForStatus(ctx, status)
	if e != nil {
		w.WriteHeader(500)
		return
	}
	bootConf, e := frontend.ComputeBootConf(pool)
	if e != nil {
		w.WriteHeader(500)
		return
	}

	startParameters := map[string]interface{}{
		"BOOTER_URL":          "/frontend/bootconf",
		"MAIN_ELEMENT":        "ajxp_desktop",
		"PRELOADED_BOOT_CONF": bootConf,
	}

	if regXml, e := xml.Marshal(registry); e == nil {
		startParameters["PRELOADED_REGISTRY"] = string(regXml)
	}

	tplConf := &TplConf{
		ApplicationTitle: config.Get("frontend", "plugin", "core.pydio", "APPLICATION_TITLE").Default("Cells").String(),
		//Rebase:           "/",
		ResourcesFolder: "./plug/gui.ajax/res",
		Favicon:         "./plug/gui.ajax/res/themes/common/images/favicon.png",
		Theme:           "material",
		Version:         frontend.VersionHash(),
		LoadingString:   GetLoadingString(bootConf.CurrentLanguage),
		StartParameters: startParameters,
	}
	if customHeader := config.Get("frontend", "plugin", "gui.ajax", "HTML_CUSTOM_HEADER").String(); customHeader != "" {
		tplConf.CustomHTMLHeader = template.HTML(customHeader)
	}

	tplConf = FilterTplConf(tplConf)

	if strings.HasPrefix(r.URL.Path, h.resetPasswordPath) {
		reset := strings.TrimPrefix(r.URL.Path, h.resetPasswordPath)
		tplConf.StartParameters["USER_GUI_ACTION"] = "reset-password"
		tplConf.StartParameters["USER_ACTION_KEY"] = reset
	}

	w.Header().Set("Content-Type", "text/html; charset=utf-8")
	for hK, hV := range config.Get("frontend", "secureHeaders").StringMap() {
		w.Header().Set(hK, hV)
	}

	var tpl *template.Template
	if !h.detectFrontendService() {
		tpl = h.loadingTpl
	} else {
		tpl = h.tpl
	}

	if strings.Contains(r.Header.Get("Accept-Encoding"), "gzip") {
		out := gzip.NewWriter(w)
		defer out.Close()
		w.Header().Set("Content-Encoding", "gzip")
		w.WriteHeader(200)
		tpl.Execute(out, tplConf)
	} else {
		w.WriteHeader(200)
		tpl.Execute(w, tplConf)
	}

}

func (h *IndexHandler) detectFrontendService() bool {

	if h.frontendDetected {
		return true
	}
	var reg registry.Registry
	runtimecontext.Get(h.runtimeCtx, registry.ContextKey, &reg)

	if ss, e := reg.List(registry.WithName(common.ServiceRestNamespace_+common.ServiceFrontend), registry.WithType(pb.ItemType_SERVICE)); e == nil && len(ss) > 0 {
		h.frontendDetected = true
	}
	return h.frontendDetected

}
