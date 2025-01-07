package hooks

import (
	"context"
	"net/http"
	"net/url"
	"strconv"
	"strings"
	"time"

	"github.com/gorilla/mux"
	"github.com/minio/minio-go/v7/pkg/signer"
	"github.com/minio/minio/cmd"

	"github.com/pydio/cells/v5/common"
	"github.com/pydio/cells/v5/common/auth"
	"github.com/pydio/cells/v5/common/auth/claim"
	"github.com/pydio/cells/v5/common/middleware"
	"github.com/pydio/cells/v5/common/permissions"
	"github.com/pydio/cells/v5/common/runtime"
	"github.com/pydio/cells/v5/common/telemetry/log"
	"github.com/pydio/cells/v5/common/utils/propagator"
)

// pydioAuthHandler - handles all the incoming authorization headers and validates them if possible.
type pydioAuthHandler struct {
	rootCtx      context.Context
	handler      http.Handler
	jwtVerifier  *auth.JWTVerifier
	accessKey    string
	accessSecret string
	region       string
}

// GetPydioAuthHandlerFunc validates Pydio authorization headers for the incoming request.
func GetPydioAuthHandlerFunc(ctx context.Context, accessKey, secret, region string) mux.MiddlewareFunc {
	return func(h http.Handler) http.Handler {
		return &pydioAuthHandler{
			rootCtx:      ctx,
			handler:      h,
			jwtVerifier:  auth.DefaultJWTVerifier(),
			accessKey:    accessKey,
			accessSecret: secret,
			region:       region,
		}
	}
}

// handler for validating incoming authorization headers.
func (a *pydioAuthHandler) ServeHTTP(w http.ResponseWriter, r *http.Request) {

	//var md map[string]string
	var userName string

	ctx := r.Context()
	reqURL := r.URL
	r, er := middleware.ApplyHTTPIncomingContextModifiers(r)
	if er != nil {
		cmd.ExposedWriteErrorResponse(ctx, w, cmd.ErrBadRequest, reqURL)
		return
	}

	ctx = propagator.ForkContext(r.Context(), a.rootCtx)
	ctx = runtime.WithServiceName(ctx, common.ServiceGatewayData)
	r = r.WithContext(ctx)

	accessToken, doSign, doPreSign := a.extractToken(ctx, r)

	if accessToken != "" {

		var err error
		var claims claim.Claims
		ctx, claims, err = a.jwtVerifier.Verify(ctx, accessToken)
		if err != nil {
			if amzDate := r.Header.Get("X-Amz-Date"); amzDate != "" {
				// Parse header as ISO8861 format - It is set at signature time, so more or less represents the request issue time.
				// If it's too far from now, request body has probably been buffered too long and now the token is invalid
				// In that case, trigger a 504 GatewayTimeout code so that it is interpreted as a retryable error.
				if reqTime, e := time.Parse("20060102T150405Z", amzDate); e == nil {
					// todo we should compare here with the underlying client token lifespan
					if reqTime.Before(time.Now().Add(-20 * time.Second)) {
						cmd.ExposedWriteErrorResponse(ctx, w, cmd.ErrTokenTimeMismatch, r.URL)
						return
					}
				}
			}
			cmd.ExposedWriteErrorResponse(ctx, w, cmd.ErrUnauthorizedAccess, r.URL)
			return
		}
		userName = claims.Name

		if doSign {

			r = signer.SignV4(*r, a.accessKey, a.accessSecret, "", a.region)

		} else if doPreSign {

			r = a.recomputePreSignV4(r)

		}

	} else {

		if user, er := permissions.SearchUniqueUser(ctx, common.PydioS3AnonUsername, ""); er == nil {

			userName = common.PydioS3AnonUsername
			var s []string
			for _, role := range user.Roles {
				if role.UserRole { // Just append the User Role
					s = append(s, role.Uuid)
				}
			}
			anonClaim := claim.Claims{
				Name:      common.PydioS3AnonUsername,
				Roles:     strings.Join(s, ","),
				Profile:   "anon",
				GroupPath: "/",
			}
			ctx = context.WithValue(ctx, claim.ContextKey, anonClaim)

		} else {

			cmd.ExposedWriteErrorResponse(ctx, w, cmd.ErrAccessDenied, r.URL)
			return

		}

	}

	ctx = propagator.WithUserNameMetadata(ctx, common.PydioContextUserKey, userName)
	newRequest := r.WithContext(ctx)
	a.handler.ServeHTTP(w, newRequest)

}

func (a *pydioAuthHandler) extractToken(ctx context.Context, r *http.Request) (token string, doSign bool, doPresign bool) {

	rq := r.URL.Query()

	if bearer := r.Header.Get("X-Pydio-Bearer"); bearer != "" {

		token = bearer
		r.Header.Del("X-Pydio-Bearer")

	} else if jwt := rq.Get("pydio_jwt"); len(jwt) > 0 {

		//logger.Info("Found JWT in URL: replace by header and remove from URL")
		token = jwt

		rq.Del("pydio_jwt")
		checkResignV4 := false
		if r.Method == http.MethodGet {
			// Force attachment (if not already set)
			if !strings.HasPrefix(strings.TrimSpace(rq.Get("response-content-disposition")), "attachment") {
				rq.Set("response-content-disposition", "attachment")
				checkResignV4 = true
			}
		}
		// Rebuild Query
		r.URL.RawQuery = rq.Encode()
		_ = r.ParseForm()
		// If PresignedV4, flag for re-signing
		if signedKey, err := cmd.ExposedParsePresignV4(ctx, r.Form); err == nil && (signedKey != a.accessKey || checkResignV4) {
			doPresign = true
		}

	} else {

		if v4Auth := r.Header.Get("Authorization"); v4Auth == "" {
			_ = r.ParseForm()
			if signedKey, err := cmd.ExposedParsePresignV4(ctx, r.Form); err == nil && signedKey != a.accessKey {
				token = signedKey
				doPresign = true
			}

		} else if signedKey, err := cmd.ExposedParseSignV4(ctx, v4Auth); err == nil && signedKey != a.accessKey {
			// Parse signature version '4' header.
			log.Logger(ctx).Debug("Use AWS Api Key as JWT: " + signedKey)
			token = signedKey
			doSign = true
		}

	}

	return
}

func (a *pydioAuthHandler) recomputePreSignV4(r *http.Request) *http.Request {

	origUrl := r.URL
	origHeader := r.Header
	newUrl := &url.URL{
		Scheme: origUrl.Scheme,
		Host:   origUrl.Host,
		Path:   origUrl.Path,
	}
	newV := newUrl.Query()
	expire := int64(900)
	for k, vv := range origUrl.Query() {
		if k == "X-Amz-Expires" {
			if ex, e := strconv.ParseInt(strings.Join(vv, ""), 10, 64); e == nil {
				expire = ex
			}
		}
		if strings.HasPrefix(k, "X-Amz-") || k == "pydio_jwt" {
			continue
		}
		for _, v := range vv {
			newV.Set(k, v)
		}
	}
	if len(newV) > 0 {
		newUrl.RawQuery = newV.Encode()
	}

	newReq := *r
	newReq.URL = newUrl
	newReq.RequestURI = newUrl.RequestURI()
	_ = newReq.ParseForm()
	signed := signer.PreSignV4(newReq, a.accessKey, a.accessSecret, "", a.region, expire)
	// Re-append headers
	if len(origHeader) > 0 {
		signed.Header = http.Header{}
		for k, vv := range origHeader {
			for _, v := range vv {
				signed.Header.Set(k, v)
			}
		}
	}

	return signed
}
