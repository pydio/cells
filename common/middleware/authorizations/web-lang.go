package authorizations

import (
	"context"
	"net/http"

	restful "github.com/emicklei/go-restful/v3"

	"github.com/pydio/cells/v4/common/config"
	"github.com/pydio/cells/v4/common/middleware"
	"github.com/pydio/cells/v4/common/utils/i18n/languages"
)

func HttpWrapperLanguage(_ context.Context, h http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// Todo config should be contextualized
		ll := languages.UserLanguagesFromRestRequest(&restful.Request{Request: r}, config.Get())
		ctx := middleware.WithDetectedLanguages(r.Context(), ll)
		r = r.WithContext(ctx)
		h.ServeHTTP(w, r)

	})
}
