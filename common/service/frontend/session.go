package frontend

import (
	"net/http"

	"github.com/gorilla/securecookie"
	"github.com/gorilla/sessions"
	"go.uber.org/zap"

	"github.com/pydio/cells/common/auth"
	"github.com/pydio/cells/common/log"
)

var SessionStore = sessions.NewCookieStore(securecookie.GenerateRandomKey(64))

func NewSessionWrapper(h http.Handler) http.Handler {

	jwtVerifier := auth.DefaultJWTVerifier()

	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {

		session, err := SessionStore.Get(r, "pydio")
		if err != nil {
			log.Logger(r.Context()).Error("Cannot retrieve session", zap.Error(err))
		}

		if value, ok := session.Values["jwt"]; ok {
			ctx := r.Context()
			ctx, _, err = jwtVerifier.Verify(ctx, value.(string))
			if err != nil {
				// This JWT is invalid. Silently remove it from session
				delete(session.Values, "jwt")
				session.Save(r, w)
			} else {
				log.Logger(ctx).Info("Found token in session")
				// Update context
				r = r.WithContext(ctx)
			}
		}
		h.ServeHTTP(w, r)

	})
}
