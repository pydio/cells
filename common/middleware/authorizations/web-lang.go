package authorizations

import (
	"net/http"

	restful "github.com/emicklei/go-restful/v3"

	"github.com/pydio/cells/v5/common/middleware"
	"github.com/pydio/cells/v5/common/utils/i18n/languages"
)

func HttpWrapperLanguage(h http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		ll := languages.UserLanguagesFromRestRequest(&restful.Request{Request: r})
		ctx := middleware.WithDetectedLanguages(r.Context(), ll)
		r = r.WithContext(ctx)
		h.ServeHTTP(w, r)

	})
}
