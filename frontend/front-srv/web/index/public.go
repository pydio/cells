package index

import (
	"compress/gzip"
	"context"
	"encoding/json"
	"fmt"
	"html/template"
	"net/http"
	"strings"
	"time"

	"github.com/micro/go-micro/errors"

	"github.com/golang/protobuf/ptypes"
	"github.com/golang/protobuf/ptypes/any"
	"github.com/gorilla/mux"
	"go.uber.org/zap"

	"github.com/pydio/cells/common"
	"github.com/pydio/cells/common/config"
	"github.com/pydio/cells/common/log"
	"github.com/pydio/cells/common/micro"
	"github.com/pydio/cells/common/proto/docstore"
	"github.com/pydio/cells/common/proto/idm"
	"github.com/pydio/cells/common/service/context"
	"github.com/pydio/cells/common/service/frontend"
	"github.com/pydio/cells/common/service/proto"
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

func (h *PublicHandler) computeTplConf(req *http.Request, linkId string) (statusCode int, tplConf *TplConf) {

	ctx := req.Context()

	tplConf = &TplConf{
		ApplicationTitle: config.Get("frontend", "plugin", "core.pydio").String("Pydio Cells"),
		//Rebase:           url,
		ResourcesFolder: "plug/gui.ajax/res",
		Favicon:         "plug/gui.ajax/res/themes/common/images/favicon.png",
		Theme:           "material",
		Version:         common.Version().String(),
		Debug:           config.Get("frontend", "debug").Bool(false),
	}
	if customHeader := config.Get("frontend", "plugin", "gui.ajax", "HTML_CUSTOM_HEADER").String(""); customHeader != "" {
		tplConf.CustomHTMLHeader = template.HTML(customHeader)
	}

	tplConf = FilterTplConf(tplConf)

	statusCode = 200
	// Load link data
	linkData, e := h.loadLink(ctx, linkId)
	if e != nil {
		parsed := errors.Parse(e.Error())
		if parsed.Code == 500 && parsed.Id == "go.micro.client" && parsed.Detail == "none available" {
			tplConf.ErrorMessage = "Service is temporarily unavailable, please retry later."
			return 503, tplConf
		} else {
			tplConf.ErrorMessage = "Cannot find this link! Please contact the person who sent it to you."
			return 404, tplConf
		}
	}

	// Check expiration time
	if linkData.ExpireTime > 0 && time.Now().After(time.Unix(linkData.ExpireTime, 0)) {
		tplConf.ErrorMessage = "This link has expired. Please contact the person who sent it to you."
		return 404, tplConf
	}

	// Check number of downloads
	if linkData.DownloadLimit > 0 && linkData.DownloadCount >= linkData.DownloadLimit {
		tplConf.ErrorMessage = "This link has expired (number of maximum downloads has been reached)."
		return 404, tplConf
	}

	cl := idm.NewWorkspaceServiceClient(common.SERVICE_GRPC_NAMESPACE_+common.SERVICE_WORKSPACE, defaults.NewClient())
	q, _ := ptypes.MarshalAny(&idm.WorkspaceSingleQuery{
		Uuid: linkData.RepositoryId,
	})
	s, e := cl.SearchWorkspace(ctx, &idm.SearchWorkspaceRequest{Query: &service.Query{
		SubQueries: []*any.Any{q},
	}})
	if e != nil {
		tplConf.ErrorMessage = "An unexpected error happened while loading this link"
		log.Logger(ctx).Error("Error while loading public link, cannot load workspace", zap.Error(e))
		return 500, tplConf
	}
	defer s.Close()
	var wsExists bool
	for {
		r, er := s.Recv()
		if er != nil {
			break
		}
		if r != nil {
			wsExists = true
			break
		}
	}
	if !wsExists {
		tplConf.ErrorMessage = "Error while loading link, the original data may have been deleted!"
		return 404, tplConf
	}

	pool, e := frontend.GetPluginsPool()
	if e != nil {
		tplConf.ErrorMessage = "Internal server error"
		return 500, tplConf
	}
	// Backward compat
	if linkData.TemplateName == "pydio_embed_template" {
		linkData.TemplateName = "pydio_shared_folder"
	}
	bootConf := frontend.ComputeBootConf(pool, req)
	startParameters := map[string]interface{}{
		"BOOTER_URL":          "/frontend/bootconf",
		"MAIN_ELEMENT":        linkData.TemplateName,
		"PRELOADED_BOOT_CONF": bootConf,
		"MINISITE":            linkId,
		"START_REPOSITORY":    linkData.RepositoryId,
	}
	var uField string
	if linkData.PreLogUser != "" {
		startParameters["PRELOG_USER"] = linkData.PreLogUser
		uField = linkData.PreLogUser
	} else if linkData.PresetLogin != "" {
		startParameters["PRESET_LOGIN"] = linkData.PresetLogin
		startParameters["PASSWORD_AUTH_ONLY"] = true
		uField = linkData.PresetLogin
	}
	if uField != "" {
		ctx = servicecontext.WithServiceName(ctx, common.SERVICE_WEB_NAMESPACE_+common.SERVICE_FRONTEND)
		log.Auditer(ctx).Info(
			fmt.Sprintf("Public Link %s accessed", linkId),
			log.GetAuditId(common.AUDIT_LOGIN_SUCCEED),
			zap.String(common.KEY_WORKSPACE_UUID, linkData.RepositoryId),
			zap.String(common.KEY_USER_UUID, uField),
		)
	}

	tplConf.StartParameters = startParameters
	tplConf.LoadingString = GetLoadingString(bootConf.CurrentLanguage)

	return
}

// ServeHTTP serve public link
func (h *PublicHandler) ServeHTTP(w http.ResponseWriter, r *http.Request) {

	link := mux.Vars(r)["link"]
	status, tplConf := h.computeTplConf(r, link)
	if status != 200 {
		w.WriteHeader(status)
		h.error.Execute(w, tplConf)
		return
	}

	w.Header().Set("Content-Type", "text/html; charset=utf8")
	for hK, hV := range config.Get("frontend", "secureHeaders").StringMap(map[string]string{}) {
		w.Header().Set(hK, hV)
	}
	if strings.Contains(r.Header.Get("Accept-Encoding"), "gzip") {
		out := gzip.NewWriter(w)
		defer out.Close()
		w.Header().Set("Content-Encoding", "gzip")
		w.WriteHeader(200)
		h.tpl.Execute(out, tplConf)
		return
	}

	w.WriteHeader(200)
	h.tpl.Execute(w, tplConf)
}

// Load link from Docstore
func (h *PublicHandler) loadLink(ctx context.Context, linkUuid string) (*docstore.ShareDocument, error) {

	store := docstore.NewDocStoreClient(common.SERVICE_GRPC_NAMESPACE_+common.SERVICE_DOCSTORE, defaults.NewClient())
	resp, e := store.GetDocument(ctx, &docstore.GetDocumentRequest{DocumentID: linkUuid, StoreID: common.DOCSTORE_ID_SHARES})
	if e != nil {
		return nil, e
	}
	linkDoc := resp.Document
	if linkDoc == nil {
		return nil, fmt.Errorf("cannot find document")
	}
	var linkData *docstore.ShareDocument

	err := json.Unmarshal([]byte(linkDoc.Data), &linkData)
	if err != nil {
		return nil, err
	}
	return linkData, nil

}
