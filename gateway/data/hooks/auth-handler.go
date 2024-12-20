package hooks

import (
	"context"
	"net/http"
	"net/url"
	"strconv"
	"strings"

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

// authHandler - handles all the incoming authorization headers and validates them if possible.
type pydioAuthHandler struct {
	rootCtx         context.Context
	handler         http.Handler
	jwtVerifier     *auth.JWTVerifier
	globalAccessKey string
}

// GetPydioAuthHandlerFunc validates Pydio authorization headers for the incoming request.
func GetPydioAuthHandlerFunc(ctx context.Context, globalAccessKey string) mux.MiddlewareFunc {
	return func(h http.Handler) http.Handler {
		return pydioAuthHandler{
			rootCtx:         ctx,
			handler:         h,
			jwtVerifier:     auth.DefaultJWTVerifier(),
			globalAccessKey: globalAccessKey,
		}
	}
}

// handler for validating incoming authorization headers.
func (a pydioAuthHandler) ServeHTTP(w http.ResponseWriter, r *http.Request) {

	//var md map[string]string
	var userName string

	r, er := middleware.ApplyHTTPIncomingContextModifiers(r)
	if er != nil {
		w.WriteHeader(http.StatusBadRequest)
		return
	}

	ctx := propagator.ForkContext(r.Context(), a.rootCtx)
	ctx = runtime.WithServiceName(ctx, common.ServiceGatewayData)
	r = r.WithContext(ctx)

	resignRequestV4 := false
	resignRequestV4Presigned := false

	rq := r.URL.Query()
	jwt := rq.Get("pydio_jwt")

	if len(jwt) > 0 {
		//logger.Info("Found JWT in URL: replace by header and remove from URL")
		r.Header.Set("X-Pydio-Bearer", jwt)
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
		if signedKey, err := cmd.ExposedParsePresignV4(ctx, r.Form); err == nil && (signedKey != a.globalAccessKey || checkResignV4) {
			resignRequestV4Presigned = true
		}

	} else if bearer, ok := r.Header["X-Pydio-Bearer"]; !ok || len(bearer) == 0 {
		// Copy request.
		req := *r
		// Save authorization header.
		v4Auth := req.Header.Get("Authorization")
		// Parse signature version '4' header.
		if signedKey, err := cmd.ExposedParseSignV4(ctx, v4Auth); err == nil && signedKey != a.globalAccessKey {
			log.Logger(ctx).Debug("Use AWS Api Key as JWT: " + signedKey)
			resignRequestV4 = true
			r.Header.Set("X-Pydio-Bearer", signedKey)
		}
	}

	if bearer, ok := r.Header["X-Pydio-Bearer"]; ok && len(bearer) > 0 {

		rawIDToken := strings.Join(bearer, "")
		var err error
		var claims claim.Claims
		ctx, claims, err = a.jwtVerifier.Verify(ctx, rawIDToken)
		if err != nil {
			cmd.ExposedWriteErrorResponse(ctx, w, cmd.ErrAccessDenied, r.URL)
			return
		}
		userName = claims.Name
		if resignRequestV4 {
			// User is OK, override signature with service account ID/Secret
			r = signer.SignV4(*r, common.S3GatewayRootUser, common.S3GatewayRootPassword, "", common.S3GatewayDefaultRegion)
		} else if resignRequestV4Presigned {
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
			r = signer.PreSignV4(newReq, common.S3GatewayRootUser, common.S3GatewayRootPassword, "", common.S3GatewayDefaultRegion, expire)
			// Re-append headers
			if len(origHeader) > 0 {
				r.Header = http.Header{}
				for k, vv := range origHeader {
					for _, v := range vv {
						r.Header.Set(k, v)
					}
				}
			}
		}

	} else if agent, aOk := r.Header["User-Agent"]; aOk && strings.Contains(strings.Join(agent, ""), "pydio.sync.client.s3") {

		userName = common.PydioSystemUsername

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
