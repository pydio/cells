/*
 * Copyright (c) 2026. Pydio Cells Personal Fork contributors.
 * This file is part of the Pydio Cells Personal Fork.
 *
 * Licensed under the GNU Affero General Public License, version 3 or later.
 */

package restv2

import (
	"context"
	"encoding/base64"
	"encoding/json"
	"encoding/xml"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"os"
	"path"
	"strings"
	"sync"
	"time"

	restful "github.com/emicklei/go-restful/v3"

	"github.com/pydio/cells/v5/common"
	"github.com/pydio/cells/v5/common/auth/claim"
	"github.com/pydio/cells/v5/common/client/grpc"
	"github.com/pydio/cells/v5/common/config"
	"github.com/pydio/cells/v5/common/errors"
	"github.com/pydio/cells/v5/common/permissions"
	"github.com/pydio/cells/v5/common/proto/auth"
	"github.com/pydio/cells/v5/common/proto/rest"
	"github.com/pydio/cells/v5/common/proto/tree"
	"github.com/pydio/cells/v5/common/runtime"
	"github.com/pydio/cells/v5/common/utils/i18n/languages"
)

type euroOfficeDiscovery struct {
	NetZones []struct {
		Name string `xml:"name,attr"`
		Apps []struct {
			Actions []euroOfficeDiscoveryAction `xml:"action"`
		} `xml:"app"`
	} `xml:"net-zone"`
}

type euroOfficeDiscoveryAction struct {
	Name     string `xml:"name,attr"`
	Ext      string `xml:"ext,attr"`
	Requires string `xml:"requires,attr"`
	URLSrc   string `xml:"urlsrc,attr"`
}

type euroOfficeLaunchPayload struct {
	ActionURL      string `json:"actionUrl"`
	WOPISrc        string `json:"wopiSrc"`
	AccessToken    string `json:"accessToken"`
	AccessTokenTTL int32  `json:"accessTokenTtl"`
	Language       string `json:"lang,omitempty"`
	UILanguage     string `json:"ui,omitempty"`
}

type EuroOfficeProvider struct {
	Actions           []euroOfficeDiscoveryAction
	PublicURL         string
	WOPIHostBaseURL   string
	AutoRefreshWindow int32
	RequestLanguage   string
	RequestUILanguage string
}

var euroOfficeDiscoveryCache struct {
	sync.Mutex
	serverURL string
	actions   []euroOfficeDiscoveryAction
	expiresAt time.Time
}

func euroOfficeOrigin(raw, name string) (string, error) {
	parsed, err := url.Parse(strings.TrimRight(strings.TrimSpace(raw), "/"))
	if err != nil || parsed.Host == "" || (parsed.Scheme != "https" && parsed.Scheme != "http") ||
		parsed.User != nil || parsed.Path != "" || parsed.RawQuery != "" || parsed.Fragment != "" {
		return "", fmt.Errorf("%s must be an absolute HTTP(S) origin without a path, credentials, query, or fragment", name)
	}
	return parsed.Scheme + "://" + parsed.Host, nil
}

func euroOfficeDiscoveryActions(ctx context.Context, serverURL string) ([]euroOfficeDiscoveryAction, error) {
	euroOfficeDiscoveryCache.Lock()
	defer euroOfficeDiscoveryCache.Unlock()
	if euroOfficeDiscoveryCache.serverURL == serverURL && time.Now().Before(euroOfficeDiscoveryCache.expiresAt) {
		return euroOfficeDiscoveryCache.actions, nil
	}

	client := &http.Client{
		Timeout: 5 * time.Second,
		CheckRedirect: func(_ *http.Request, _ []*http.Request) error {
			return http.ErrUseLastResponse
		},
	}
	request, err := http.NewRequestWithContext(ctx, http.MethodGet, serverURL+"/hosting/discovery", nil)
	if err != nil {
		return nil, err
	}
	response, err := client.Do(request)
	if err != nil {
		return nil, fmt.Errorf("fetch Euro-Office WOPI discovery: %w", err)
	}
	defer response.Body.Close()
	if response.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("Euro-Office WOPI discovery returned HTTP %d", response.StatusCode)
	}
	var discovery euroOfficeDiscovery
	if err := xml.NewDecoder(io.LimitReader(response.Body, 1<<20)).Decode(&discovery); err != nil {
		return nil, fmt.Errorf("decode Euro-Office WOPI discovery: %w", err)
	}

	selectedZoneIndex := -1
	for i := range discovery.NetZones {
		if discovery.NetZones[i].Name == "external-https" {
			selectedZoneIndex = i
			break
		}
	}
	if selectedZoneIndex < 0 && len(discovery.NetZones) > 0 {
		selectedZoneIndex = 0
	}
	if selectedZoneIndex < 0 {
		return nil, fmt.Errorf("Euro-Office WOPI discovery contains no network zones")
	}
	var actions []euroOfficeDiscoveryAction
	for _, app := range discovery.NetZones[selectedZoneIndex].Apps {
		for _, action := range app.Actions {
			name := strings.ToLower(strings.TrimSpace(action.Name))
			if name != "edit" && name != "view" {
				continue
			}
			parsed, err := url.Parse(action.URLSrc)
			if err != nil || !strings.HasPrefix(parsed.Path, "/hosting/wopi/") {
				continue
			}
			if strings.Contains(parsed.Path, "..") {
				continue
			}
			actions = append(actions, action)
		}
	}
	if len(actions) == 0 {
		return nil, fmt.Errorf("Euro-Office discovery advertised no supported WOPI editor actions")
	}
	euroOfficeDiscoveryCache.serverURL = serverURL
	euroOfficeDiscoveryCache.actions = actions
	euroOfficeDiscoveryCache.expiresAt = time.Now().Add(time.Hour)
	return actions, nil
}

func euroOfficeActionRequires(action euroOfficeDiscoveryAction, required ...string) bool {
	values := make(map[string]bool)
	for _, value := range strings.Split(strings.ToLower(action.Requires), ",") {
		values[strings.TrimSpace(value)] = true
	}
	for _, value := range required {
		if !values[value] {
			return false
		}
	}
	return true
}

func euroOfficeActionPath(action euroOfficeDiscoveryAction) (string, error) {
	parsed, err := url.Parse(action.URLSrc)
	if err != nil || !strings.HasPrefix(parsed.Path, "/hosting/wopi/") || strings.Contains(parsed.Path, "..") {
		return "", fmt.Errorf("invalid Euro-Office WOPI action URL")
	}
	return path.Clean(parsed.Path), nil
}

func (p *EuroOfficeProvider) Provides(ext string) bool {
	normalizedExt := strings.TrimPrefix(strings.ToLower(ext), ".")
	for _, action := range p.Actions {
		if strings.EqualFold(strings.TrimPrefix(strings.ToLower(action.Ext), "."), normalizedExt) &&
			(strings.EqualFold(action.Name, "view") || strings.EqualFold(action.Name, "edit")) {
			return true
		}
	}
	return false
}

func (p *EuroOfficeProvider) findAction(ext, mode string) (euroOfficeDiscoveryAction, bool) {
	for _, action := range p.Actions {
		if strings.EqualFold(strings.TrimPrefix(strings.ToLower(action.Ext), "."), strings.TrimPrefix(strings.ToLower(ext), ".")) &&
			strings.EqualFold(action.Name, mode) {
			if mode != "edit" || euroOfficeActionRequires(action, "locks", "update") {
				return action, true
			}
		}
	}
	return euroOfficeDiscoveryAction{}, false
}

func (p *EuroOfficeProvider) Get(ctx context.Context, node *tree.Node) (*rest.PreSignedURL, error) {
	claims, ok := claim.FromContext(ctx)
	if !ok {
		return nil, errors.WithMessage(errors.StatusForbidden, "missing claims from context")
	}
	accessList, err := permissions.AccessListFromContextClaims(ctx)
	if err != nil {
		return nil, err
	}
	if !accessList.CanRead(ctx, node) {
		return nil, errors.WithMessage(errors.StatusForbidden, "read access is required to open this document")
	}

	fileExt := strings.TrimPrefix(strings.ToLower(path.Ext(node.GetPath())), ".")
	mode := "view"
	scopePermission := "r"
	if accessList.CanWrite(ctx, node) && node.GetStringMeta(common.MetaFlagReadonly) != "true" {
		if _, available := p.findAction(fileExt, "edit"); available {
			mode = "edit"
			scopePermission = "rw"
		}
	}
	action, available := p.findAction(fileExt, mode)
	if !available {
		return nil, errors.WithMessagef(errors.StatusNotFound, "Euro-Office does not support %s for .%s documents", mode, fileExt)
	}
	actionPath, err := euroOfficeActionPath(action)
	if err != nil {
		return nil, err
	}

	patGenerateRequest := &auth.PatGenerateRequest{
		Type:              auth.PatType_DOCUMENT,
		UserUuid:          claims.Subject,
		UserLogin:         claims.Name,
		Label:             "Temporary Euro-Office access token for document " + node.GetPath(),
		AutoRefreshWindow: p.AutoRefreshWindow,
		Issuer:            "eurooffice",
		Scopes:            []string{fmt.Sprintf("node:%s:%s", node.GetUuid(), scopePermission)},
	}
	cli := auth.NewPersonalAccessTokenServiceClient(grpc.ResolveConn(ctx, common.ServiceTokenGRPC))
	pat, err := cli.Generate(ctx, patGenerateRequest)
	if err != nil {
		return nil, err
	}

	wopiSrc := p.WOPIHostBaseURL + "/wopi/files/" + url.PathEscape(node.GetUuid())
	payload, err := json.Marshal(euroOfficeLaunchPayload{
		ActionURL:      p.PublicURL + actionPath,
		WOPISrc:        wopiSrc,
		AccessToken:    pat.GetAccessToken(),
		AccessTokenTTL: p.AutoRefreshWindow,
		Language:       p.RequestLanguage,
		UILanguage:     p.RequestUILanguage,
	})
	if err != nil {
		return nil, err
	}
	fragment := base64.RawURLEncoding.EncodeToString(payload)
	return &rest.PreSignedURL{
		Url:       p.WOPIHostBaseURL + "/wopi/launch#" + fragment,
		ExpiresAt: int64(p.AutoRefreshWindow),
	}, nil
}

func GetEuroOfficeProvider(ctx context.Context, req *restful.Request) (EditorProvider, bool) {
	conf := config.Get(ctx, "frontend/plugin/editor.eurooffice")
	if !conf.Val(config.KeyFrontPluginEnabled).Default(false).Bool() {
		return nil, false
	}
	internalURL := strings.TrimSpace(conf.Val("EUROOFFICE_INTERNAL_URL").String())
	if internalURL == "" {
		internalURL = strings.TrimSpace(os.Getenv("CELLS_EUROOFFICE_INTERNAL_URL"))
	}
	internalURL = strings.TrimRight(internalURL, "/")
	internalOrigin, err := euroOfficeOrigin(internalURL, "EUROOFFICE_INTERNAL_URL")
	if err != nil {
		return nil, false
	}
	publicURLValue := strings.TrimSpace(conf.Val("EUROOFFICE_PUBLIC_URL").String())
	if publicURLValue == "" {
		publicURLValue = strings.TrimSpace(os.Getenv("CELLS_EUROOFFICE_PUBLIC_URL"))
	}
	publicURL, err := euroOfficeOrigin(publicURLValue, "EUROOFFICE_PUBLIC_URL")
	if err != nil {
		return nil, false
	}
	wopiHostBaseURLValue := strings.TrimSpace(conf.Val("WOPI_HOST_BASE_URL").String())
	if wopiHostBaseURLValue == "" {
		wopiHostBaseURLValue = strings.TrimSpace(os.Getenv("CELLS_EUROOFFICE_WOPI_HOST_BASE_URL"))
	}
	wopiHostBaseURL, err := euroOfficeOrigin(wopiHostBaseURLValue, "WOPI_HOST_BASE_URL")
	if err != nil {
		return nil, false
	}
	actions, err := euroOfficeDiscoveryActions(ctx, internalOrigin)
	if err != nil {
		return nil, false
	}

	refreshText := config.Get(ctx, "defaults", "personalTokens", "documentTokensRefresh").Default("30m").String()
	refresh, err := time.ParseDuration(refreshText)
	if err != nil || refresh <= 0 || refresh > 24*time.Hour {
		refresh = 30 * time.Minute
	}
	lang, ui := languages.DetectLocale(req.Request)
	return &EuroOfficeProvider{
		Actions:           actions,
		PublicURL:         publicURL,
		WOPIHostBaseURL:   wopiHostBaseURL,
		AutoRefreshWindow: int32(refresh.Seconds()),
		RequestLanguage:   lang,
		RequestUILanguage: ui,
	}, true
}

func init() {
	RegisterEditorProviderFactory("eurooffice", GetEuroOfficeProvider)
	runtime.RegisterEnvVariable("CELLS_EUROOFFICE_INTERNAL_URL", "", "Internal Euro-Office DocumentServer URL")
	runtime.RegisterEnvVariable("CELLS_EUROOFFICE_PUBLIC_URL", "", "Public Euro-Office DocumentServer URL")
	runtime.RegisterEnvVariable("CELLS_EUROOFFICE_WOPI_HOST_BASE_URL", "", "Public Cells WOPI host origin")
}
