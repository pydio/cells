// +build ignore

package web

import (
	"context"
	"encoding/json"
	"net/http"
	"strings"

	"gopkg.in/square/go-jose.v2/jwt"

	"github.com/pydio/cells/common/auth"
	"github.com/pydio/cells/common/proto/idm"
	"github.com/pydio/cells/common/utils/permissions"
)

type responseCapture struct {
	s int
	h http.Header
	b []byte
}

func (r *responseCapture) Header() http.Header {
	return r.h
}

func (r *responseCapture) Write(data []byte) (int, error) {
	r.b = append(r.b, data...)
	return len(data), nil
}

func (r *responseCapture) WriteHeader(statusCode int) {
	r.s = statusCode
}

type mdlFunc func(handler http.Handler) http.Handler
type permissionsHandler struct {
	inner http.Handler
}

func (p *permissionsHandler) userFromBody(ctx context.Context, b []byte) *idm.User {
	//fmt.Printf("Captured request with body %s\n", string(b))
	var respMap struct {
		IdToken string `json:"id_token"`
		Access  string `json:"access_token"`
		Refresh string `json:"refresh_token"`
		Exp     int    `json:"expires_in"`
	}
	if err := json.Unmarshal(b, &respMap); err == nil {
		// decode JWT token without verifying the signature
		token, _ := jwt.ParseSigned(respMap.IdToken)
		var claims map[string]interface{} // generic map to store parsed token
		_ = token.UnsafeClaimsWithoutVerification(&claims)
		if name, ok := claims["name"]; ok {
			if u, err := permissions.SearchUniqueUser(ctx, name.(string), ""); err == nil {
				return u
			}
		}
	}
	return nil
}

func (p *permissionsHandler) ServeHTTP(resp http.ResponseWriter, req *http.Request) {

	grant := req.FormValue("grant_type")
	// Capture response
	if strings.HasSuffix(req.RequestURI, "/oauth2/token") && (grant == "refresh_token" || grant == "authorization_code") {
		capture := &responseCapture{h: resp.Header()}
		p.inner.ServeHTTP(capture, req)
		if capture.s == 200 {
			if u := p.userFromBody(req.Context(), capture.b); u != nil {
				if err := auth.VerifyContext(req.Context(), u); err != nil {
					resp.WriteHeader(401)
					resp.Write([]byte("permission error"))
					return
				}
			}
		}
		resp.WriteHeader(capture.s)
		resp.Write(capture.b)
		return
	}

	p.inner.ServeHTTP(resp, req)
}

func customMiddleware(in mdlFunc) mdlFunc {
	return func(handler http.Handler) http.Handler {
		p := &permissionsHandler{inner: handler}
		return in(p)
	}
}
