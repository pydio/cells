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

package web

import (
	"bytes"
	"compress/gzip"
	"context"
	"crypto/md5"
	"encoding/hex"
	"fmt"
	"html/template"
	"io"
	"net/http"
	"path"
	"slices"
	"strconv"
	"strings"
	tplText "text/template"
	"time"

	sprig "github.com/Masterminds/sprig/v3"
	"go.uber.org/zap"

	"github.com/pydio/cells/v5/common"
	"github.com/pydio/cells/v5/common/auth"
	"github.com/pydio/cells/v5/common/client/commons/docstorec"
	"github.com/pydio/cells/v5/common/config"
	"github.com/pydio/cells/v5/common/errors"
	"github.com/pydio/cells/v5/common/nodes"
	"github.com/pydio/cells/v5/common/nodes/abstract"
	"github.com/pydio/cells/v5/common/nodes/acl"
	"github.com/pydio/cells/v5/common/nodes/models"
	"github.com/pydio/cells/v5/common/permissions"
	"github.com/pydio/cells/v5/common/proto/docstore"
	"github.com/pydio/cells/v5/common/proto/idm"
	"github.com/pydio/cells/v5/common/proto/tree"
	"github.com/pydio/cells/v5/common/runtime"
	"github.com/pydio/cells/v5/common/service/frontend"
	"github.com/pydio/cells/v5/common/telemetry/log"
	"github.com/pydio/cells/v5/common/utils/cache"
	cache_helper "github.com/pydio/cells/v5/common/utils/cache/helper"
	json "github.com/pydio/cells/v5/common/utils/jsonx"
	"github.com/pydio/cells/v5/common/utils/propagator"
	"github.com/pydio/cells/v5/common/utils/slug"
	"github.com/pydio/cells/v5/gateway/dav"
)

var (
	cacheConfig = cache.Config{
		Eviction:    "30s",
		CleanWindow: "5m",
	}
)

// PublicHandler implements http.Handler to server public links
type PublicHandler struct {
	tpl            *template.Template
	error          *template.Template
	runtimeContext context.Context
}

func NewPublicHandler(c context.Context) *PublicHandler {
	h := &PublicHandler{
		runtimeContext: c,
	}
	h.tpl, _ = template.New("public").Parse(Public)
	h.error, _ = template.New("error").Parse(errorTpl)
	return h
}

func (h *PublicHandler) computeTplConf(req *http.Request, linkId string) (statusCode int, tplConf *TplConf, sd *docstore.ShareDocument) {

	ctx := req.Context()

	tplConf = &TplConf{
		ApplicationTitle: config.Get(ctx, config.FrontendPluginPath(config.KeyFrontPluginCorePydio, config.KeyFrontApplicationTitle)...).Default("Pydio Cells").String(),
		ResourcesFolder:  "plug/gui.ajax/res",
		Favicon:          "plug/gui.ajax/res/themes/common/images/favicon.png",
		Theme:            "material",
		Version:          frontend.VersionHash(ctx),
	}
	if customHeader := config.Get(ctx, config.FrontendPluginPath(config.KeyFrontPluginGuiAjax, "HTML_CUSTOM_HEADER")...).String(); customHeader != "" {
		tplConf.CustomHTMLHeader = template.HTML(customHeader)
	}

	tplConf = FilterTplConf(ctx, tplConf)

	statusCode = 200
	// Load link data
	linkData, e := h.loadLink(ctx, linkId)
	if e != nil {
		if !errors.Is(e, errors.StatusNotFound) {
			tplConf.ErrorMessage = "Service is temporarily unavailable, please retry later."
			return 503, tplConf, linkData
		} else {
			tplConf.ErrorMessage = "Cannot find this link! Please contact the person who sent it to you."
			return 404, tplConf, linkData
		}
	}

	// Check expiration time
	if linkData.ExpireTime > 0 && time.Now().After(time.Unix(linkData.ExpireTime, 0)) {
		tplConf.ErrorMessage = "This link has expired. Please contact the person who sent it to you."
		return 404, tplConf, linkData
	}

	// Check number of downloads
	if linkData.DownloadLimit > 0 && linkData.DownloadCount >= linkData.DownloadLimit {
		tplConf.ErrorMessage = "This link has expired (number of maximum downloads has been reached)."
		return 404, tplConf, linkData
	}

	if ws, err := permissions.SearchUniqueWorkspace(ctx, linkData.RepositoryId, ""); err != nil || ws == nil {
		tplConf.ErrorMessage = "Error while loading link, the original data may have been deleted!"
		return 404, tplConf, linkData
	}

	pool, e := frontend.GetPluginsPool()
	if e != nil {
		tplConf.ErrorMessage = "Internal server error"
		return 500, tplConf, linkData
	}
	// Backward compat
	if linkData.TemplateName == "pydio_embed_template" {
		linkData.TemplateName = "pydio_shared_folder"
	}
	bootConf, er := frontend.ComputeBootConf(ctx, pool)
	if er != nil {
		tplConf.ErrorMessage = "Internal server error"
		return 500, tplConf, linkData
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
		ctx = runtime.WithServiceName(ctx, common.ServiceWebNamespace_+common.ServiceFrontend)
		log.Auditer(ctx).Info(
			fmt.Sprintf("Public Link %s accessed", linkId),
			log.GetAuditId(common.AuditLoginSucceed),
			zap.String(common.KeyWorkspaceUuid, linkData.RepositoryId),
			zap.String(common.KeyUserUuid, uField),
		)
	}

	tplConf.StartParameters = startParameters
	tplConf.LoadingString = GetLoadingString(bootConf.CurrentLanguage)
	sd = linkData

	return
}

// ServeHTTP serve Public link
func (h *PublicHandler) ServeHTTP(w http.ResponseWriter, r *http.Request) {

	// Update context with service name
	r = r.WithContext(propagator.ForkOneKey(runtime.ServiceNameKey, r.Context(), h.runtimeContext))

	linkId, davPath := h.parseLinkId(r)
	status, tplConf, linkData := h.computeTplConf(r, linkId)
	if status != http.StatusOK {
		w.WriteHeader(status)
		_ = h.error.Execute(w, tplConf)
		return
	}
	// There is a davPath, switch to dedicated DAV handler
	if davPath != "" {
		if er := h.ServeDAV(w, r, linkId, linkData, davPath); er != nil {
			if strings.HasPrefix(er.Error(), "[auth]") {
				w.WriteHeader(http.StatusUnauthorized)
			} else {
				w.WriteHeader(http.StatusInternalServerError)
			}
			_ = h.error.Execute(w, tplConf)
		}
		return
	}

	w.Header().Set("Content-Type", "text/html; charset=utf8")
	for hK, hV := range config.Get(r.Context(), "frontend", "secureHeaders").StringMap() {
		w.Header().Set(hK, hV)
	}
	if strings.Contains(r.Header.Get("Accept-Encoding"), "gzip") {
		out := gzip.NewWriter(w)
		defer out.Close()
		w.Header().Set("Content-Encoding", "gzip")
		w.WriteHeader(http.StatusOK)
		_ = h.tpl.Execute(out, tplConf)
		return
	}

	w.WriteHeader(http.StatusOK)
	_ = h.tpl.Execute(w, tplConf)
}

// ServeDAV forwards requests to a DAV handler (see gateway/dav package)
func (h *PublicHandler) ServeDAV(w http.ResponseWriter, r *http.Request, linkId string, linkData *docstore.ShareDocument, inputPath string) error {

	t := time.Now()
	ctx := r.Context()

	// Authenticate using Basic Auth
	// For public no-protected, build user/password manually
	// For password-protected, read password from Basic Auth (any username will do)
	log.Logger(ctx).Debug("Authenticate DAV on public link: " + linkId + ", Path: " + inputPath)
	if req, e, requestAuth := h.davAuthenticate(r, linkData); e == nil {
		r = req
		// Reload context
		ctx = r.Context()
	} else if requestAuth {
		w.Header().Set("WWW-Authenticate", `Basic realm="Link `+linkId+`"`)
		w.WriteHeader(401)
		_, _ = w.Write([]byte("Unauthorized.\n"))
		return nil
	} else {
		return fmt.Errorf("[auth] " + e.Error())
	}

	log.Logger(ctx).Debug("After Auth", zap.Duration("time", time.Since(t)))
	t = time.Now()

	// Load workspace and its root nodes
	var ws *idm.Workspace
	ca := cache_helper.MustResolveCache(ctx, common.CacheTypeLocal, cacheConfig)
	if !ca.Get(linkData.RepositoryId, &ws) {
		workspace, er := permissions.SearchUniqueWorkspace(ctx, linkData.RepositoryId, "")
		if er != nil {
			return er
		}
		resolver := func(ctx context.Context, node *tree.Node) (*tree.Node, bool) {
			return abstract.GetVirtualProvider().ByUuid(ctx, node.Uuid)
		}
		wss := map[string]*idm.Workspace{workspace.GetUUID(): workspace}
		er = permissions.LoadRootNodesForWorkspaces(ctx, []string{workspace.GetUUID()}, wss, resolver)
		if er != nil {
			return er
		}
		ws = workspace
		_ = ca.Set(ws.GetUUID(), workspace)
		log.Logger(ctx).Debug("WS Roots Not In Cache", zap.Duration("time", time.Since(t)))
		t = time.Now()
	} else {
		log.Logger(ctx).Debug("WS Roots In Cache", zap.Duration("time", time.Since(t)))
		t = time.Now()
	}

	// Translate input into read DAV path (something like /dav/workspace-slug/virtual-root)
	topRouter := dav.RouterWithOptionalPrefix(h.runtimeContext)
	davPath, innerPrefix, er := h.davFindPath(r, topRouter, ws, inputPath)
	if er != nil {
		return fmt.Errorf("[404] cannot find dav path")
	}

	davPrefix := path.Join(common.DefaultRoutePublic, linkId, GetPublicBaseDavSegment(ctx))
	log.Logger(ctx).Debug("processing dav request on public link", zap.String("inputPath", inputPath), zap.String("davPrefix", davPrefix), zap.String("routerPrefix", innerPrefix), zap.String("davPath", davPath))
	davHandler, prefixRouter := dav.GetHandler(h.runtimeContext, davPrefix, innerPrefix)

	if intercepted, serveError := h.davDirectoryIndex(w, r, prefixRouter, davPath); intercepted {
		// Index file served, stop now !
		if serveError != nil {
			log.Logger(ctx).Warn("Error while trying to serve directory index: " + serveError.Error())
		}
		return nil
	}

	// Finally serve DAV resources
	if davPath != inputPath {
		r.RequestURI = path.Join(davPrefix, davPath)
		r.URL.Path = r.RequestURI
	}
	davHandler.ServeHTTP(w, r)

	return nil
}

func (h *PublicHandler) parseLinkId(r *http.Request) (linkId, davPath string) {
	ctx := r.Context()
	linkId = strings.Trim(strings.TrimPrefix(r.URL.Path, common.DefaultRoutePublic), "/")
	parts := strings.Split(linkId, "/")
	davSegment := GetPublicBaseDavSegment(ctx)
	if len(parts) > 1 && parts[1] == davSegment {
		linkId = parts[0]
		if len(parts) > 2 {
			davPath = strings.Join(parts[2:], "/")
			davPath = path.Clean(davPath)
		} else {
			davPath = "/"
		}
	}
	return
}

func (h *PublicHandler) davAuthenticate(r *http.Request, linkData *docstore.ShareDocument) (*http.Request, error, bool) {
	ctx := r.Context()
	if linkData.PreLogUser != "" {
		// Impersonate Public User
		userName := linkData.PreLogUser
		aa, user, er := permissions.AccessListFromUser(ctx, userName, false)
		if er != nil {
			return nil, er, false
		}
		ctx = auth.WithImpersonate(ctx, user)
		ctx = acl.WithPresetACL(ctx, aa)
		r = r.WithContext(ctx)
	} else if linkData.PresetLogin != "" {
		userName := linkData.PresetLogin
		_, p, o := r.BasicAuth()
		if !o {
			return nil, fmt.Errorf("missing password information"), true
		}
		djv := auth.DefaultJWTVerifier()
		if _, err := djv.PasswordCredentialsToken(ctx, userName, p); err != nil {
			return nil, fmt.Errorf("invalid password"), true
		}
		aa, user, er := permissions.AccessListFromUser(ctx, userName, false)
		if er != nil {
			return nil, er, false
		}
		ctx = auth.WithImpersonate(ctx, user)
		ctx = acl.WithPresetACL(ctx, aa)
		r = r.WithContext(ctx)
	} else {
		return nil, fmt.Errorf("unsupported auth method, should be one of prelog or preset"), false
	}
	return r, nil, false
}

func (h *PublicHandler) davFindPath(req *http.Request, router nodes.Handler, ws *idm.Workspace, davPath string) (string, string, error) {

	roots := ws.GetRootNodes()
	var first *tree.Node
	for _, n := range roots {
		first = n
		break
	}
	// Multiple roots or leaf => virtual roots must be resolved
	if davPath != "/" && (len(roots) > 1 || len(roots) == 1 && first.IsLeaf()) {
		pathsToRoots := map[string]string{}
		for _, n := range roots {
			virtual := h.virtualRootKey(n)
			pathsToRoots[path.Base(n.GetPath())] = virtual
		}
		// map first davPath segment to virtual
		davParts := strings.Split(davPath, "/")
		if replace, ok := pathsToRoots[davParts[0]]; ok {
			davParts[0] = replace
			davPath = strings.Join(davParts, "/")
			log.Logger(req.Context()).Debug("PathToRoots replaced in path => davPath is "+davPath, zap.Any("ptr", pathsToRoots))
		}
	}

	slug := ws.GetSlug()
	return davPath, slug, nil

}

func (h *PublicHandler) davDirectoryIndex(w http.ResponseWriter, r *http.Request, router nodes.Handler, innerPath string) (served bool, serveError error) {

	if r.Method != http.MethodGet {
		return
	}
	ctx := r.Context()

	indexConf := config.Get(ctx, config.FrontendPluginPath("action.share", "LINK_PUBLIC_DIRECTORY_INDEXES")...).Default("_cells_index.html,_cells_listing.phtml,_cells_listing.json").String()
	if indexConf == "" {
		return
	}
	resp, er := router.ReadNode(ctx, &tree.ReadNodeRequest{Node: &tree.Node{Path: innerPath}})
	if er != nil {
		return
	} else if resp.GetNode().IsLeaf() {
		w.Header().Set("Content-Security-Policy", "script-src 'none'")
		return
	}

	var testPaths []string
	var hasTemplate, hasJson bool
	for _, name := range strings.Split(indexConf, ",") {
		testPaths = append(testPaths, path.Join(innerPath, name))
	}
	for _, name := range strings.Split(indexConf, ",") {
		if strings.HasSuffix(name, ".phtml") {
			hasTemplate = true
			testPaths = append(testPaths, path.Join(name)) // Lookup at the site root as well
		} else if strings.HasSuffix(name, ".json") {
			hasJson = true
			testPaths = append(testPaths, path.Join(name)) // Lookup at the site root as well
		}
	}
	var content []byte
	var cType string
	var evalT bool
	for _, indexName := range testPaths {
		indexReader, lErr := router.GetObject(ctx, &tree.Node{Path: indexName}, &models.GetRequestData{Length: -1})
		if lErr != nil {
			continue
		}
		content, _ = io.ReadAll(indexReader)
		_ = indexReader.Close()
		if strings.HasSuffix(indexName, ".json") {
			cType = "application/json"
			evalT = true
		} else if strings.HasSuffix(indexName, ".phtml") {
			cType = "text/html"
			evalT = true
		} else {
			cType = "text/html"
		}
		break
	}
	if cType == "" && (hasTemplate || hasJson) { // No content found, maybe default ?
		if defPhtml := config.Get(ctx, config.FrontendPluginPath("action.share", "LINK_PUBLIC_DIRECTORY_LISTING_PHTML")...).String(); defPhtml != "" {
			content = []byte(defPhtml)
			cType = "text/html"
			evalT = true
		} else if defJson := config.Get(ctx, config.FrontendPluginPath("action.share", "LINK_PUBLIC_DIRECTORY_LISTING_PHTML")...).String(); defJson != "" {
			content = []byte(defJson)
			cType = "application/json"
			evalT = true
		}
	}
	if cType == "" {
		return
	}

	if evalT {
		children := []*tree.Node{} // for non-empty array
		lr, e := router.ListNodes(ctx, &tree.ListNodesRequest{Node: resp.GetNode()})
		if e != nil {
			serveError = e
			return
		}
		for {
			sr, err := lr.Recv()
			if err != nil {
				break
			}
			if slices.Contains(testPaths, strings.Trim(sr.GetNode().GetPath(), "/")) { // ignore special paths!
				continue
			}
			children = append(children, sr.GetNode().WithoutReservedMetas())
		}
		data := map[string]interface{}{
			"Current":  resp.GetNode().WithoutReservedMetas(),
			"Children": children,
		}
		if innerPath != "/" {
			// Try to load parent
			if pR, pE := router.ReadNode(ctx, &tree.ReadNodeRequest{Node: &tree.Node{Path: path.Dir(innerPath)}}); pE == nil {
				data["Parent"] = pR.GetNode().WithoutReservedMetas()
			}
		}
		all := &bytes.Buffer{}
		// Parse Template and evaluate it, replace content
		if cType == "application/json" {
			tpl := tplText.New("json_listing")
			tpl.Funcs(sprig.TxtFuncMap())
			tpl, er := tpl.Parse(string(content))
			if er != nil {
				serveError = er
				return
			}
			if er := tpl.Execute(all, data); er != nil {
				serveError = er
				return
			}
		} else {
			tpl := template.New("html_listing")
			tpl.Funcs(sprig.HtmlFuncMap())
			tpl, er := tpl.Parse(string(content))
			if er != nil {
				serveError = er
				return
			}
			if er := tpl.Execute(all, data); er != nil {
				serveError = er
				return
			}
		}
		content = all.Bytes()
	}

	w.Header().Set("Content-Security-Policy", "script-src 'none'")
	w.Header().Set("Content-Type", cType)
	w.Header().Set("Content-Length", strconv.Itoa(len(content)))
	w.WriteHeader(http.StatusOK)
	_, _ = w.Write(content)
	return true, nil

}

// Load link from Docstore
func (h *PublicHandler) loadLink(ctx context.Context, linkUuid string) (*docstore.ShareDocument, error) {

	resp, e := docstorec.DocStoreClient(ctx).GetDocument(ctx, &docstore.GetDocumentRequest{DocumentID: linkUuid, StoreID: common.DocStoreIdShares})
	if e != nil {
		return nil, e
	}
	linkDoc := resp.Document
	if linkDoc == nil {
		return nil, errors.WithStack(errors.DocStoreDocNotFound)
	}
	var linkData *docstore.ShareDocument

	err := json.Unmarshal([]byte(linkDoc.Data), &linkData)
	if err != nil {
		return nil, err
	}
	return linkData, nil

}

func (h *PublicHandler) virtualRootKey(n *tree.Node) string {
	hash := md5.New()
	hash.Write([]byte(n.GetUuid()))
	rand := hex.EncodeToString(hash.Sum(nil))
	return rand[0:8] + "-" + n.GetStringMeta("name")
}

// GetPublicBaseDavSegment returns the segment used to exposed minisites through DAV
func GetPublicBaseDavSegment(ctx context.Context) string {
	return slug.Make(config.Get(ctx, config.FrontendPluginPath("action.share", "LINK_PUBLIC_URI_DAV_SEGMENT")...).Default("dav").String())
}
