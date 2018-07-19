package index

import (
	"html/template"
	"net/http"

	"context"
	"encoding/json"
	"fmt"

	"github.com/gorilla/mux"
	"github.com/pydio/cells/common"
	"github.com/pydio/cells/common/config"
	"github.com/pydio/cells/common/log"
	"github.com/pydio/cells/common/proto/docstore"
	"github.com/pydio/cells/common/service/defaults"
	"github.com/pydio/cells/common/service/frontend"
	"github.com/pydio/cells/idm/share/rest"
	"go.uber.org/zap"
)

type PublicHandler struct {
	tpl *template.Template
}

func NewPublicHandler() *PublicHandler {
	h := &PublicHandler{}
	h.tpl, _ = template.New("public").Parse(public)
	return h
}

// ServeHTTP serve public link
func (h *PublicHandler) ServeHTTP(w http.ResponseWriter, r *http.Request) {

	link := mux.Vars(r)["link"]
	// Load link data
	linkData, e := h.loadLink(r.Context(), link)
	if e != nil {
		w.WriteHeader(404)
		w.Write([]byte("Link not found"))
		return
	}

	log.Logger(r.Context()).Info("PUBLIC LINK", zap.String("link", link), zap.Any("linkData", linkData))

	pool, e := frontend.GetPluginsPool()
	if e != nil {
		w.WriteHeader(500)
		return
	}
	url := config.Get("defaults", "url").String("")
	startParameters := map[string]interface{}{
		"BOOTER_URL":          "/frontend/bootconf",
		"MAIN_ELEMENT":        linkData.TemplateName,
		"REBASE":              url,
		"PRELOADED_BOOT_CONF": frontend.ComputeBootConf(pool),
		"MINISITE_SESSION":    link,
		"START_REPOSITORY":    linkData.RepositoryId,
	}
	if linkData.PreLogUser != "" {
		startParameters["PRELOG_USER"] = linkData.PreLogUser
	} else if linkData.PresetLogin != "" {
		startParameters["PRESET_LOGIN"] = linkData.PresetLogin
		startParameters["PASSWORD_AUTH_ONLY"] = true
	}
	tplConf := &TplConf{
		ApplicationTitle: "Pydio",
		Rebase:           url,
		ResourcesFolder:  "plug/gui.ajax/res",
		Theme:            "material",
		Version:          common.Version().String(),
		Debug:            true,
		StartParameters:  startParameters,
	}
	w.WriteHeader(200)
	h.tpl.Execute(w, tplConf)
}

// Load link from Docstore
func (h *PublicHandler) loadLink(ctx context.Context, linkUuid string) (*rest.HashDocument, error) {

	store := docstore.NewDocStoreClient(common.SERVICE_GRPC_NAMESPACE_+common.SERVICE_DOCSTORE, defaults.NewClient())
	resp, e := store.GetDocument(ctx, &docstore.GetDocumentRequest{DocumentID: linkUuid, StoreID: "share"})
	if e != nil {
		return nil, e
	}
	linkDoc := resp.Document
	if linkDoc == nil {
		return nil, fmt.Errorf("cannot find document")
	}
	var linkData *rest.HashDocument
	if err := json.Unmarshal([]byte(linkDoc.Data), &linkData); err == nil {
		return linkData, nil
	} else {
		return nil, err
	}

}
