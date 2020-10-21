package frontend

import (
	"encoding/base64"
	"net/http"
	"net/url"
	"strings"
	"sync"

	"github.com/gorilla/securecookie"
	"github.com/gorilla/sessions"
	"go.uber.org/zap"

	"github.com/pydio/cells/common"
	"github.com/pydio/cells/common/auth"
	"github.com/pydio/cells/common/config"
	"github.com/pydio/cells/common/log"
	"github.com/pydio/cells/common/utils/net"
)

var (
	sessionStores     map[string]*sessions.CookieStore
	sessionStoresLock *sync.Mutex
	knownKey          []byte
)

func init() {
	sessionStores = make(map[string]*sessions.CookieStore)
	sessionStoresLock = &sync.Mutex{}
}

func loadKey() []byte {
	if knownKey != nil {
		return knownKey
	}
	val := config.Get("frontend", "session", "secureKey").String()
	var key []byte
	if val == "" {
		knownKey = securecookie.GenerateRandomKey(64)
		val = base64.StdEncoding.EncodeToString(key)
		config.Get("frontend", "session", "secureKey").Set(val)
		config.Save(common.PYDIO_SYSTEM_USERNAME, "Generating session random key")
	} else {
		knownKey, _ = base64.StdEncoding.DecodeString(val)
	}
	return knownKey
}

func storeForUrl(u *url.URL) sessions.Store {
	key := u.Scheme + "://" + u.Hostname()
	sessionStoresLock.Lock()
	defer sessionStoresLock.Unlock()
	if ss, o := sessionStores[key]; o {
		return ss
	}

	pKey := loadKey()
	ss := sessions.NewCookieStore(pKey)
	timeout := config.Get("frontend", "plugin", "gui.ajax", "SESSION_TIMEOUT").Default(60).Int()
	ss.Options = &sessions.Options{
		Path:     "/a/frontend",
		MaxAge:   60 * timeout,
		HttpOnly: true,
	}
	if u.Scheme == "https" {
		ss.Options.Secure = true
	}
	ss.Options.Domain = u.Hostname()
	sessionStores[key] = ss
	return ss
}

func GetSessionStore(req *http.Request) sessions.Store {
	u := net.ExternalDomainFromRequest(req)
	return storeForUrl(u)
}

// NewSessionWrapper creates a Http middleware checking if a cookie is passed
// along and if this cookie contains a proper JWT.
// The excludes parameter may be used to namely ignore specific "METHOD:/URI“ for this check.
func NewSessionWrapper(h http.Handler, excludes ...string) http.Handler {

	jwtVerifier := auth.DefaultJWTVerifier()

	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {

		for _, excluded := range excludes {
			split := strings.Split(excluded, ":")
			method := split[0]
			uri := split[1]
			if strings.ToLower(method) == strings.ToLower(r.Method) && strings.HasPrefix(r.RequestURI, uri) {
				log.Logger(r.Context()).Debug("Skipping session wrapper by exclusion:" + excluded)
				h.ServeHTTP(w, r)
				return
			}
		}

		sessionName := "pydio"
		if h, ok := r.Header["X-Pydio-Minisite"]; ok {
			sessionName = sessionName + "-" + strings.Join(h, "")
		}
		if h, ok := r.Header[common.XPydioFrontendSessionUuid]; ok {
			sessionName = sessionName + "-" + strings.Join(h, "")
		}
		session, err := GetSessionStore(r).Get(r, sessionName)
		if err != nil && !strings.Contains(err.Error(), "securecookie: the value is not valid") {
			log.Logger(r.Context()).Error("Cannot retrieve session", zap.Error(err))
		}

		if value, ok := session.Values["access_token"]; ok {
			ctx := r.Context()
			if ctx, _, err = jwtVerifier.Verify(ctx, value.(string)); err == nil {
				// Update context
				log.Logger(ctx).Debug("Found token in session " + sessionName)
				r = r.WithContext(ctx)
			}
		}
		h.ServeHTTP(w, r)
	})
}
