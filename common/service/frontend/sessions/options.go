package sessions

import (
	"context"
	"net/http"

	"github.com/gorilla/sessions"

	"github.com/pydio/cells/v5/common"
	"github.com/pydio/cells/v5/common/config"
	"github.com/pydio/cells/v5/common/config/routing"
)

// SessionOptionsFromConfig creates a default sessions.Options struct using context configuration.
// It reads the SESSION_TIMEOUT, SameSite policy from config and the REST API path from routing context.
func SessionOptionsFromConfig(ctx context.Context) *sessions.Options {
	restApi := routing.RouteIngressURIContext(ctx, common.RouteApiREST, common.DefaultRouteREST)
	timeout := config.Get(ctx, config.FrontendPluginPath(config.KeyFrontPluginGuiAjax, "SESSION_TIMEOUT")...).Default(60).Int()
	sameSiteStr := config.Get(ctx, "frontend", "secureCookies", "SameSite").Default("Strict").String()

	var sameSite http.SameSite
	switch sameSiteStr {
	case "Lax":
		sameSite = http.SameSiteLaxMode
	case "None":
		sameSite = http.SameSiteNoneMode
	default:
		sameSite = http.SameSiteStrictMode
	}

	return &sessions.Options{
		Path:     restApi + "/frontend",
		MaxAge:   60 * timeout,
		HttpOnly: true,
		SameSite: sameSite,
	}
}
