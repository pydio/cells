package utils

import (
	"context"
	"encoding/base64"
	"net/http"
	"net/url"
	"strings"

	"github.com/gorilla/securecookie"
	"go.uber.org/zap"

	"github.com/pydio/cells/v5/common"
	"github.com/pydio/cells/v5/common/config"
	"github.com/pydio/cells/v5/common/telemetry/log"
)

var (
	knownKey []byte
)

// SessionName extracts session name depending on headers. Default is pydio, but can be prepended with
// a minisite unique identifier.
func SessionName(r *http.Request) string {
	sessionName := "pydio"
	if h, ok := r.Header[common.XPydioMinisite]; ok {
		sessionName = sessionName + "-" + strings.Join(h, "")
	}
	return sessionName
}

// LoadKey loads secure session key from config or generates a new one
func LoadKey(ctx context.Context) ([]byte, error) {
	if knownKey != nil {
		return knownKey, nil
	}
	val := config.Get(ctx, "frontend", "session", "secureKey").String()
	if val != "" {
		if kk, e := base64.StdEncoding.DecodeString(val); e == nil {
			knownKey = kk
			return knownKey, nil
		}
	}
	knownKey = securecookie.GenerateRandomKey(64)
	val = base64.StdEncoding.EncodeToString(knownKey)
	if er := config.Get(ctx, "frontend", "session", "secureKey").Set(val); er != nil {
		return nil, er
	}
	if e := config.Save(ctx, common.PydioSystemUsername, "Generating session random key"); e != nil {
		log.Logger(ctx).Error("Failed saving secure key to config, session will not be persisted after restart!", zap.Error(e))
		return nil, e
	}
	return knownKey, nil
}

// RequestURL copies r.URL and completes host and scheme if they are not set
func RequestURL(r *http.Request) *url.URL {
	u := *r.URL
	if u.Host == "" {
		u.Host = r.Host
		if r.TLS != nil {
			u.Scheme = "https"
		} else {
			u.Scheme = "http"
		}
	}
	return &u
}
