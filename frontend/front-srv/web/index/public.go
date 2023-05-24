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
	"fmt"
	"html/template"
	"net/http"
	"path"
	"strings"
	"time"

	"go.uber.org/zap"

	"github.com/pydio/cells/v4/common"
	"github.com/pydio/cells/v4/common/client/grpc"
	"github.com/pydio/cells/v4/common/config"
	"github.com/pydio/cells/v4/common/log"
	"github.com/pydio/cells/v4/common/proto/docstore"
	servicecontext "github.com/pydio/cells/v4/common/service/context"
	"github.com/pydio/cells/v4/common/service/errors"
	"github.com/pydio/cells/v4/common/service/frontend"
	json "github.com/pydio/cells/v4/common/utils/jsonx"
	"github.com/pydio/cells/v4/common/utils/permissions"
)

type PublicHandler struct {
	tpl   *template.Template
	error *template.Template
}

func NewPublicHandler() *PublicHandler {
	h := &PublicHandler{}
	h.tpl, _ = template.New("public").Parse(Public)
	h.error, _ = template.New("error").Parse(errorTpl)
	return h
}

func (h *PublicHandler) computeTplConf(req *http.Request, linkId string) (statusCode int, tplConf *TplConf) {

	ctx := req.Context()

	tplConf = &TplConf{
		ApplicationTitle: config.Get("frontend", "plugin", "core.pydio", "APPLICATION_TITLE").Default("Pydio Cells").String(),
		ResourcesFolder:  "plug/gui.ajax/res",
		Favicon:          "plug/gui.ajax/res/themes/common/images/favicon.png",
		Theme:            "material",
		Version:          frontend.VersionHash(),
	}
	if customHeader := config.Get("frontend", "plugin", "gui.ajax", "HTML_CUSTOM_HEADER").String(); customHeader != "" {
		tplConf.CustomHTMLHeader = template.HTML(customHeader)
	}

	tplConf = FilterTplConf(tplConf)

	statusCode = 200
	// Load link data
	linkData, e := h.loadLink(ctx, linkId)
	if e != nil {
		parsed := errors.FromError(e)
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

	if ws, err := permissions.SearchUniqueWorkspace(ctx, linkData.RepositoryId, ""); err != nil || ws == nil {
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
	bootConf, er := frontend.ComputeBootConf(pool)
	if er != nil {
		tplConf.ErrorMessage = "Internal server error"
		return 500, tplConf
	}
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
		ctx = servicecontext.WithServiceName(ctx, common.ServiceWebNamespace_+common.ServiceFrontend)
		log.Auditer(ctx).Info(
			fmt.Sprintf("Public Link %s accessed", linkId),
			log.GetAuditId(common.AuditLoginSucceed),
			zap.String(common.KeyWorkspaceUuid, linkData.RepositoryId),
			zap.String(common.KeyUserUuid, uField),
		)
	}

	tplConf.StartParameters = startParameters
	tplConf.LoadingString = GetLoadingString(bootConf.CurrentLanguage)

	return
}

// ServeHTTP serve Public link
func (h *PublicHandler) ServeHTTP(w http.ResponseWriter, r *http.Request) {

	status, tplConf := h.computeTplConf(r, path.Base(r.URL.Path))
	if status != 200 {
		w.WriteHeader(status)
		_ = h.error.Execute(w, tplConf)
		return
	}

	w.Header().Set("Content-Type", "text/html; charset=utf8")
	for hK, hV := range config.Get("frontend", "secureHeaders").StringMap() {
		w.Header().Set(hK, hV)
	}
	if strings.Contains(r.Header.Get("Accept-Encoding"), "gzip") {
		out := gzip.NewWriter(w)
		defer out.Close()
		w.Header().Set("Content-Encoding", "gzip")
		w.WriteHeader(200)
		_ = h.tpl.Execute(out, tplConf)
		return
	}

	w.WriteHeader(200)
	_ = h.tpl.Execute(w, tplConf)
}

// Load link from Docstore
func (h *PublicHandler) loadLink(ctx context.Context, linkUuid string) (*docstore.ShareDocument, error) {

	store := docstore.NewDocStoreClient(grpc.GetClientConnFromCtx(ctx, common.ServiceDocStore))
	resp, e := store.GetDocument(ctx, &docstore.GetDocumentRequest{DocumentID: linkUuid, StoreID: common.DocStoreIdShares})
	if e != nil {
		return nil, fmt.Errorf("cannot find document")
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
