package index

import (
	"compress/gzip"
	"context"
	"encoding/xml"
	"html/template"
	"net/http"
	"strings"

	"github.com/gorilla/mux"

	"github.com/pydio/cells/common"
	"github.com/pydio/cells/common/config"
	"github.com/pydio/cells/common/log"
	defaults "github.com/pydio/cells/common/micro"
	"github.com/pydio/cells/common/service/frontend"
)

type IndexHandler struct {
	tpl              *template.Template
	loadingTpl       *template.Template
	frontendDetected bool
}

func NewIndexHandler() *IndexHandler {
	h := &IndexHandler{}
	h.tpl, _ = template.New("index").Parse(page)
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

	status := frontend.RequestStatus{
		Config:        config.Get(),
		AclParameters: rolesConfigs.Val("parameters"),
		AclActions:    rolesConfigs.Val("actions"),
		WsScopes:      user.GetActiveScopes(),
		User:          user,
		NoClaims:      !user.Logged,
		Lang:          "en",
		Request:       r,
	}
	registry := pool.RegistryForStatus(ctx, status)
	bootConf := frontend.ComputeBootConf(pool)

	url := config.Get("defaults", "url").String()
	startParameters := map[string]interface{}{
		"BOOTER_URL":          "/frontend/bootconf",
		"MAIN_ELEMENT":        "ajxp_desktop",
		"REBASE":              url,
		"PRELOADED_BOOT_CONF": bootConf,
	}

	if regXml, e := xml.Marshal(registry); e == nil {
		startParameters["PRELOADED_REGISTRY"] = string(regXml)
	}

	tplConf := &TplConf{
		ApplicationTitle: config.Get("frontend", "plugin", "core.pydio", "APPLICATION_TITLE").Default("Cells").String(),
		Rebase:           url,
		ResourcesFolder:  "plug/gui.ajax/res",
		Favicon:          "plug/gui.ajax/res/themes/common/images/favicon.png",
		Theme:            "material",
		Version:          frontend.VersionHash(),
		Debug:            config.Get("frontend", "debug").Bool(),
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
	if s, e := defaults.Registry().GetService(common.SERVICE_REST_NAMESPACE_ + common.SERVICE_FRONTEND); e == nil && len(s) > 0 {
		h.frontendDetected = true
		return true
	}
	log.Logger(context.Background()).Error("Frontend Service Not Detected")
	return false

}
