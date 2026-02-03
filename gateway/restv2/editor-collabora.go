package restv2

import (
	"context"
	"fmt"
	"net/url"
	"os"
	"slices"
	"strings"
	"time"

	restful "github.com/emicklei/go-restful/v3"

	"github.com/pydio/cells/v5/common"
	"github.com/pydio/cells/v5/common/auth/claim"
	"github.com/pydio/cells/v5/common/client/grpc"
	"github.com/pydio/cells/v5/common/config"
	"github.com/pydio/cells/v5/common/errors"
	"github.com/pydio/cells/v5/common/proto/auth"
	"github.com/pydio/cells/v5/common/proto/rest"
	"github.com/pydio/cells/v5/common/proto/tree"
	"github.com/pydio/cells/v5/common/runtime"
	"github.com/pydio/cells/v5/common/utils/i18n/languages"
)

// EditorProvider interface for editor URL providers
type EditorProvider interface {
	Provides(ext string) bool
	Get(ctx context.Context, node *tree.Node) (*rest.PreSignedURL, error)
}

// EditorProviderFactory creates an EditorProvider from a request context
type EditorProviderFactory func(ctx context.Context, req *restful.Request) (EditorProvider, bool)

var (
	collaboraSupportedExt   = []string{"docx", "pptx", "xlsx", "dotx", "xltx", "ppsx", "doc", "ppt", "xls", "dot", "xlt", "pps", "odt", "odp", "ods", "ots", "ott", "otp", "rtf", "csv"}
	editorProviderFactories = map[string]EditorProviderFactory{}
)

// RegisterEditorProviderFactory registers a factory for creating editor providers
func RegisterEditorProviderFactory(name string, factory EditorProviderFactory) {
	editorProviderFactories[name] = factory
}

func init() {
	// Allow overriding the list of supported extensions
	runtime.RegisterEnvVariable("CELLS_COLLABORA_SUPPORTED_EXTENSIONS", "", "Override default list of extensions for Collabora edition")
	if ee := strings.TrimSpace(os.Getenv("CELLS_COLLABORA_SUPPORTED_EXTENSIONS")); ee != "" {
		// Handle possible spaces after commas and filter out empty strings
		splitExt := strings.Split(ee, ",")
		collaboraSupportedExt = make([]string, 0, len(splitExt))
		for _, ext := range splitExt {
			if tr := strings.TrimSpace(ext); tr != "" {
				collaboraSupportedExt = append(collaboraSupportedExt, tr)
			}
		}
	}
	RegisterEditorProviderFactory("collabora", GetCollaboraProvider)
}

type CollaboraProvider struct {
	SupportedExt           []string
	LibreOfficeBaseURL     string
	LibreOfficeCodeVersion string
	ReqOriginalScheme      string
	ReqOriginalHost        string
	ReqOriginalLanguage    string
	ReqOriginalLocale      string
	Issuer                 string
	AutoRefreshWindow      int32
}

// GetCollaboraProvider creates a EditorURL provider for collabora
func GetCollaboraProvider(ctx context.Context, req *restful.Request) (EditorProvider, bool) {
	libreOfficeConf := config.Get(ctx, "frontend/plugin/editor.libreoffice")
	if !libreOfficeConf.Val(config.KeyFrontPluginEnabled).Bool() {
		return nil, false
	}
	libreOfficeCodeVersion := libreOfficeConf.Val("LIBREOFFICE_CODE_VERSION").String()
	libreOfficeBaseURL := libreOfficeConf.Val("LIBREOFFICE_INTERNAL_CELLS_BASE_URL").String()

	cVal := config.Get(ctx, "defaults", "personalTokens", "documentTokensRefresh").Default("30m").String()
	var refresh int32
	if d, e := time.ParseDuration(cVal); e != nil {
		refresh = 30 * 60
	} else {
		refresh = int32(d.Seconds())
	}

	reqOriginalLanguage, reqOriginalUILocale := languages.DetectLocale(req.Request)

	return &CollaboraProvider{
		SupportedExt:           collaboraSupportedExt,
		ReqOriginalScheme:      "https",
		ReqOriginalHost:        req.Request.Host,
		AutoRefreshWindow:      refresh,
		Issuer:                 req.Request.URL.String(),
		LibreOfficeCodeVersion: libreOfficeCodeVersion,
		LibreOfficeBaseURL:     libreOfficeBaseURL,
		ReqOriginalLanguage:    reqOriginalLanguage,
		ReqOriginalLocale:      reqOriginalUILocale,
	}, true
}

func (p *CollaboraProvider) Provides(ext string) bool {
	if len(ext) < 1 {
		return false
	}
	return slices.Index(p.SupportedExt, ext[1:]) >= 0
}

func (p *CollaboraProvider) Get(ctx context.Context, node *tree.Node) (*rest.PreSignedURL, error) {
	claims, ok := claim.FromContext(ctx)
	if !ok {
		return nil, errors.WithMessage(errors.StatusForbidden, "missing claims from context")
	}

	// Must be read at least by default.
	// Scopes expect "r" or "rw", collabora URL expects "readonly" or "edit"
	scopePermission := "r"
	permission := "readonly"
	if _, ok := node.MetaStore[common.MetaFlagReadonly]; !ok {
		permission = "edit"
		scopePermission = "rw"
	}
	scope := fmt.Sprintf("node:%s:%s", node.Uuid, scopePermission)

	patGenerateRequest := &auth.PatGenerateRequest{
		Type:              auth.PatType_DOCUMENT,
		UserUuid:          claims.Subject,
		UserLogin:         claims.Name,
		Label:             "Temporary access token for document " + node.Path,
		AutoRefreshWindow: p.AutoRefreshWindow,
		Issuer:            p.Issuer,
		Scopes:            []string{scope},
	}

	cli := auth.NewPersonalAccessTokenServiceClient(grpc.ResolveConn(ctx, common.ServiceTokenGRPC))
	patGenerateResp, err := cli.Generate(ctx, patGenerateRequest)
	if err != nil {
		return nil, err
	}

	fileSrcBaseUrl := p.LibreOfficeBaseURL
	if fileSrcBaseUrl == "" {
		fileSrcBaseUrl = p.ReqOriginalScheme + "://" + p.ReqOriginalHost
	}
	fileSrcUrl := url.QueryEscape(fileSrcBaseUrl + "/wopi/files/" + node.Uuid)

	iframeUrl := p.ReqOriginalScheme + "://" + p.ReqOriginalHost
	if p.LibreOfficeCodeVersion == "v21" {
		iframeUrl = iframeUrl + "/browser/dist/cool.html"
	} else {
		iframeUrl = iframeUrl + "/loleaflet/dist/loleaflet.html"
	}

	websocketScheme := "wss"
	if p.ReqOriginalScheme == "http" {
		websocketScheme = "ws"
	}

	lang := p.ReqOriginalLanguage
	//	let lang = pydio.user.getPreference('lang')
	//	if(lang !== 'zh-cn' &&  lang.split) {
	//		lang = lang.split('-')[0]
	//	}
	//	langParam = `&lang=${lang}`
	//}

	uiLocale := p.ReqOriginalLocale

	langParam := fmt.Sprintf("&lang=%s", lang)
	uiLocaleParam := fmt.Sprintf("&ui_locale=%s", uiLocale)

	websocketURL := websocketScheme + "://" + p.ReqOriginalHost

	iFrameUrl := fmt.Sprintf("%s?host=%s&WOPISrc=%s&access_token=%s&permission=%s%s%s", iframeUrl, websocketURL, fileSrcUrl, patGenerateResp.AccessToken, permission, langParam, uiLocaleParam)

	return &rest.PreSignedURL{Url: iFrameUrl, ExpiresAt: int64(p.AutoRefreshWindow)}, nil
}
