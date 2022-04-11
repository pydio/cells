package utils

import (
	"context"
	"encoding/base64"
	"go.uber.org/zap"
	"net/http"
	"strings"

	"github.com/gorilla/securecookie"

	"github.com/pydio/cells/v4/common"
	"github.com/pydio/cells/v4/common/config"
	"github.com/pydio/cells/v4/common/log"
)

var (
	knownKey []byte
)

// SessionName extracts session name depending on headers. Default is pydio, but can be prepended with
// a minisite unique identifier.
func SessionName(r *http.Request) string {
	sessionName := "pydio"
	if h, ok := r.Header["X-Pydio-Minisite"]; ok {
		sessionName = sessionName + "-" + strings.Join(h, "")
	}
	if h, ok := r.Header[common.XPydioFrontendSessionUuid]; ok {
		sessionName = sessionName + "-" + strings.Join(h, "")
	}
	return sessionName
}

// LoadKey loads secure session key from config or generates a new one
func LoadKey() ([]byte, error) {
	if knownKey != nil {
		return knownKey, nil
	}
	val := config.Get("frontend", "session", "secureKey").String()
	if val != "" {
		if kk, e := base64.StdEncoding.DecodeString(val); e == nil {
			knownKey = kk
			return knownKey, nil
		}
	}
	knownKey = securecookie.GenerateRandomKey(64)
	val = base64.StdEncoding.EncodeToString(knownKey)
	if er := config.Get("frontend", "session", "secureKey").Set(val); er != nil {
		return nil, er
	}
	if e := config.Save(common.PydioSystemUsername, "Generating session random key"); e != nil {
		log.Logger(context.Background()).Error("Failed saving secure key to config, session will not be persisted after restart!", zap.Error(e))
		return nil, e
	}
	return knownKey, nil
}
