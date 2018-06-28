package frontend

import (
	"net/http"

	"github.com/gorilla/securecookie"
	"github.com/gorilla/sessions"
	"go.uber.org/zap"

	"encoding/base64"

	"github.com/pydio/cells/common"
	"github.com/pydio/cells/common/auth"
	"github.com/pydio/cells/common/config"
	"github.com/pydio/cells/common/log"
)

var sessionStore *sessions.CookieStore

func GetSessionStore() sessions.Store {
	if sessionStore == nil {
		val := config.Get("frontend", "session", "secureKey").String("")
		var key []byte
		if val == "" {
			key = securecookie.GenerateRandomKey(64)
			val = base64.StdEncoding.EncodeToString(key)
			config.Set(val, "frontend", "session", "secureKey")
			config.Save(common.PYDIO_SYSTEM_USERNAME, "Generating session random key")
		} else {
			key, _ = base64.StdEncoding.DecodeString(val)
		}
		sessionStore = sessions.NewCookieStore([]byte(val))
	}
	return sessionStore
}

func NewSessionWrapper(h http.Handler) http.Handler {

	jwtVerifier := auth.DefaultJWTVerifier()

	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {

		session, err := GetSessionStore().Get(r, "pydio")
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
