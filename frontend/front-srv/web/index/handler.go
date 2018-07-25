package index

import (
	"html/template"
	"net/http"

	"context"

	"github.com/gorilla/mux"
	"github.com/pydio/cells/common"
	"github.com/pydio/cells/common/config"
	"github.com/pydio/cells/common/log"
	"github.com/pydio/cells/common/service/defaults"
	"github.com/pydio/cells/common/service/frontend"
	"go.uber.org/zap"
)

type IndexHandler struct {
	tpl              *template.Template
	frontendDetected bool
}

type TplConf struct {
	ApplicationTitle string
	Rebase           string
	ResourcesFolder  string
	Theme            string
	Version          string
	ErrorMessage     string
	Debug            bool
	StartParameters  map[string]interface{}
}

func NewIndexHandler() *IndexHandler {
	h := &IndexHandler{}
	h.tpl, _ = template.New("index").Parse(page)
	return h
}

func (h *IndexHandler) ServeHTTP(w http.ResponseWriter, r *http.Request) {

	pool, e := frontend.GetPluginsPool()
	if e != nil {
		w.WriteHeader(500)
		return
	}
	url := config.Get("defaults", "url").String("")
	tplConf := &TplConf{
		ApplicationTitle: "Pydio",
		Rebase:           url,
		ResourcesFolder:  "plug/gui.ajax/res",
		Theme:            "material",
		Version:          common.Version().String(),
		Debug:            true,
		StartParameters: map[string]interface{}{
			"BOOTER_URL":          "/frontend/bootconf",
			"MAIN_ELEMENT":        "ajxp_desktop",
			"REBASE":              url,
			"PRELOADED_BOOT_CONF": frontend.ComputeBootConf(pool),
		},
	}

	vars := mux.Vars(r)
	log.Logger(r.Context()).Info("vars", zap.Any("v", vars), zap.String("uri", r.RequestURI))
	if reset, ok := vars["resetPasswordKey"]; ok {
		tplConf.StartParameters["USER_GUI_ACTION"] = "reset-password"
		tplConf.StartParameters["USER_ACTION_KEY"] = reset
	}

	w.WriteHeader(200)

	var tpl *template.Template
	if !h.detectFrontendService() {
		tpl, _ = template.New("loading").Parse(loading)
	} else {
		tpl = h.tpl
	}
	tpl.Execute(w, tplConf)

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
