package index

import (
	"context"
	"encoding/json"
	"fmt"
	"html/template"
	"net/http"
	"time"

	"github.com/gorilla/mux"
	"go.uber.org/zap"

	"github.com/pydio/cells/common"
	"github.com/pydio/cells/common/config"
	"github.com/pydio/cells/common/log"
	"github.com/pydio/cells/common/proto/docstore"
	"github.com/pydio/cells/common/service/defaults"
	"github.com/pydio/cells/common/service/frontend"
)

type PublicHandler struct {
	tpl   *template.Template
	error *template.Template
}

func NewPublicHandler() *PublicHandler {
	h := &PublicHandler{}
	h.tpl, _ = template.New("public").Parse(public)
	h.error, _ = template.New("error").Parse(errorTpl)
	return h
}

// ServeHTTP serve public link
func (h *PublicHandler) ServeHTTP(w http.ResponseWriter, r *http.Request) {

	link := mux.Vars(r)["link"]

	url := config.Get("defaults", "url").String("")
	tplConf := &TplConf{
		ApplicationTitle: "Pydio",
		Rebase:           url,
		ResourcesFolder:  "plug/gui.ajax/res",
		Theme:            "material",
		Version:          common.Version().String(),
		Debug:            config.Get("frontend", "debug").Bool(false),
	}

	// Load link data
	linkData, e := h.loadLink(r.Context(), link)
	if e != nil {
		w.WriteHeader(404)
		tplConf.ErrorMessage = "Cannot find this link! Please contact the person who sent you the link."
		h.error.Execute(w, tplConf)
		return
	}
	log.Logger(r.Context()).Info("PUBLIC LINK", zap.String("link", link), zap.Any("linkData", linkData))

	// Check expiration time
	if linkData.ExpireTime > 0 && time.Now().After(time.Unix(linkData.ExpireTime, 0)) {
		w.WriteHeader(404)
		tplConf.ErrorMessage = "This link has expired. Please contact the person who sent you the link."
		h.error.Execute(w, tplConf)
		return
	}

	// Check number of downloads
	if linkData.DownloadLimit > 0 && linkData.DownloadCount >= linkData.DownloadLimit {
		w.WriteHeader(404)
		tplConf.ErrorMessage = "This link has expired (number of maximum downloads has been reached)."
		h.error.Execute(w, tplConf)
		return
	}

	pool, e := frontend.GetPluginsPool()
	if e != nil {
		w.WriteHeader(500)
		tplConf.ErrorMessage = "Internal server error"
		h.error.Execute(w, tplConf)
		return
	}
	startParameters := map[string]interface{}{
		"BOOTER_URL":          "/frontend/bootconf",
		"MAIN_ELEMENT":        linkData.TemplateName,
		"REBASE":              url,
		"PRELOADED_BOOT_CONF": frontend.ComputeBootConf(pool),
		"MINISITE":            link,
		"START_REPOSITORY":    linkData.RepositoryId,
	}
	if linkData.PreLogUser != "" {
		startParameters["PRELOG_USER"] = linkData.PreLogUser
	} else if linkData.PresetLogin != "" {
		startParameters["PRESET_LOGIN"] = linkData.PresetLogin
		startParameters["PASSWORD_AUTH_ONLY"] = true
	}
	tplConf.StartParameters = startParameters

	w.WriteHeader(200)
	h.tpl.Execute(w, tplConf)
}

// Load link from Docstore
func (h *PublicHandler) loadLink(ctx context.Context, linkUuid string) (*docstore.ShareDocument, error) {

	store := docstore.NewDocStoreClient(common.SERVICE_GRPC_NAMESPACE_+common.SERVICE_DOCSTORE, defaults.NewClient())
	resp, e := store.GetDocument(ctx, &docstore.GetDocumentRequest{DocumentID: linkUuid, StoreID: "share"})
	if e != nil {
		return nil, e
	}
	linkDoc := resp.Document
	if linkDoc == nil {
		return nil, fmt.Errorf("cannot find document")
	}
	var linkData *docstore.ShareDocument
	if err := json.Unmarshal([]byte(linkDoc.Data), &linkData); err == nil {
		return linkData, nil
	} else {
		return nil, err
	}

}
