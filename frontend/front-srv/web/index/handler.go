package index

import (
	"html/template"
	"net/http"

	"github.com/pydio/cells/common"
	"github.com/pydio/cells/common/config"
	"github.com/pydio/cells/common/service/frontend"
)

type Handler struct {
	tpl *template.Template
}

type TplConf struct {
	ApplicationTitle string
	Rebase           string
	ResourcesFolder  string
	Theme            string
	Version          string
	Debug            bool
	StartParameters  map[string]interface{}
}

func NewHandler() *Handler {
	h := &Handler{}
	h.tpl, _ = template.New("index").Parse(page)
	return h
}

func (h *Handler) ServeHTTP(w http.ResponseWriter, r *http.Request) {

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
	w.WriteHeader(200)
	h.tpl.Execute(w, tplConf)
}
