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
)

var (
	collaboraSupportedExt = []string{"docx", "pptx", "xlsx", "dotx", "xltx", "ppsx", "doc", "ppt", "xls", "dot", "xlt", "pps", "odt", "odp", "ods", "ots", "ott", "otp", "rtf", "csv"}
)

func init() {
	// Allow overriding the list of supported extensions
	runtime.RegisterEnvVariable("CELLS_COLLABORA_SUPPORTED_EXTENSIONS", "", "Override default list of extensions for Collabora edition")
	if ee := strings.TrimSpace(os.Getenv("CELLS_COLLABORA_SUPPORTED_EXTENSIONS")); ee != "" {
		collaboraSupportedExt = strings.Split(ee, ",")
	}
	RegisterEditorProviderFactory("collabora", GetCollaboraProvider)
}

type CollaboraProvider struct {
	SupportedExt           []string
	LibreOfficeBaseURL     string
	LibreOfficeCodeVersion string
	ReqOriginalScheme      string
	ReqOriginalHost        string
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
	return &CollaboraProvider{
		SupportedExt:           collaboraSupportedExt,
		ReqOriginalScheme:      "https",
		ReqOriginalHost:        req.Request.Host,
		AutoRefreshWindow:      refresh,
		Issuer:                 req.Request.URL.String(),
		LibreOfficeCodeVersion: libreOfficeCodeVersion,
		LibreOfficeBaseURL:     libreOfficeBaseURL,
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
		return nil, errors.WithMessage(errors.StatusForbidden, "sending email anonymously is forbidden")
	}

	permission := "readonly" // Must be read at least by default !
	if _, ok := node.MetaStore[common.MetaFlagReadonly]; !ok {
		permission = "edit"
	}
	scope := fmt.Sprintf("node:%s:%s", node.Uuid, permission)

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

	langParam := ""
	//	let lang = pydio.user.getPreference('lang')
	//	if(lang !== 'zh-cn' &&  lang.split) {
	//		lang = lang.split('-')[0]
	//	}
	//	langParam = `&lang=${lang}`
	//}

	websocketURL := websocketScheme + "://" + p.ReqOriginalHost

	url := fmt.Sprintf("%s?host=%s&WOPISrc=%s&access_token=%s&permission=%s%s", iframeUrl, websocketURL, fileSrcUrl, patGenerateResp.AccessToken, permission, langParam)

	return &rest.PreSignedURL{Url: url, ExpiresAt: int64(p.AutoRefreshWindow)}, nil
}
