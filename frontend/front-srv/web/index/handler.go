package index

import (
	"compress/gzip"
	"context"
	"encoding/xml"
	"html/template"
	"net/http"
	"strings"

	"github.com/gorilla/mux"

	"github.com/pydio/cells/v4/common"
	"github.com/pydio/cells/v4/common/config"
	servicecontext "github.com/pydio/cells/v4/common/service/context"
	"github.com/pydio/cells/v4/common/service/frontend"
)

type IndexHandler struct {
	runtimeCtx       context.Context
	tpl              *template.Template
	loadingTpl       *template.Template
	frontendDetected bool
}

func NewIndexHandler(ctx context.Context) *IndexHandler {
	h := &IndexHandler{
		runtimeCtx: ctx,
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
		Rebase:           "/",
		ResourcesFolder:  "plug/gui.ajax/res",
		Favicon:          "plug/gui.ajax/res/themes/common/images/favicon.png",
		Theme:            "material",
		Version:          frontend.VersionHash(),
		LoadingString:    GetLoadingString(bootConf.CurrentLanguage),
		StartParameters:  startParameters,
	}
	if customHeader := config.Get("frontend", "plugin", "gui.ajax", "HTML_CUSTOM_HEADER").String(); customHeader != "" {
		tplConf.CustomHTMLHeader = template.HTML(customHeader)
	}

	tplConf = FilterTplConf(tplConf)

	vars := mux.Vars(r)
	if reset, ok := vars["resetPasswordKey"]; ok {
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
	reg := servicecontext.GetRegistry(h.runtimeCtx)
	if s, e := reg.Get(common.ServiceRestNamespace_ + common.ServiceFrontend); e == nil && s != nil {
		h.frontendDetected = true
	}
	return h.frontendDetected

}
