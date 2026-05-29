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
	"github.com/pydio/cells/v5/common/errors"
	"github.com/pydio/cells/v5/common/middleware"
	"github.com/pydio/cells/v5/common/permissions"
	"github.com/pydio/cells/v5/common/runtime"
	"github.com/pydio/cells/v5/common/telemetry/log"
	"github.com/pydio/cells/v5/common/utils/propagator"
)

// pydioAuthHandler - handles all the incoming authorization headers and validates them if possible.
type pydioAuthHandler struct {
	rootCtx     context.Context
	handler     http.Handler
	jwtVerifier *auth.JWTVerifier
}

// GetPydioAuthHandlerFunc validates Pydio authorization headers for the incoming request.
func GetPydioAuthHandlerFunc(ctx context.Context) mux.MiddlewareFunc {
	return func(h http.Handler) http.Handler {
		return &pydioAuthHandler{
			rootCtx:     ctx,
			handler:     h,
			jwtVerifier: auth.DefaultJWTVerifier(),
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

	accessToken, fromPydioJWT, err := a.extractToken(ctx, r)
	if err != nil {
		log.Logger(ctx).Errorf("Error extracting token: %v", err)
		cmd.ExposedWriteErrorResponse(ctx, w, cmd.ErrUnauthorizedAccess, reqURL)
		return
	}

	if accessToken != "" {

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

		if fromPydioJWT {
			// V4 accepted pydio_jwt on presigned S3 URLs. Strip it from the canonical query,
			// verify the JWT, then re-sign with gateway credentials before MinIO validates it.
			var ok bool
			if r, ok = a.resignPydioJWTPresignedRequest(r); !ok {
				cmd.ExposedWriteErrorResponse(ctx, w, cmd.ErrSignatureVersionNotSupported, r.URL)
				return
			}
			ctx = cmd.ExposedUpdateContextWithCredentials(ctx, common.S3GatewayRootUser, common.S3GatewayRootPassword, common.S3GatewayDefaultRegion)
		} else {
			// We may now have an updated secret key inferred from accessToken.
			secret := common.S3GatewayRootPassword
			if sp := claims.GetSecretPair(); sp != "" {
				secret = sp
			}
			ctx = cmd.ExposedUpdateContextWithCredentials(ctx, accessToken, secret, common.S3GatewayDefaultRegion)
		}
		r = r.WithContext(ctx)
		if errCode := cmd.ExposedValidateRequestSignature(r); errCode != cmd.ErrNone {
			cmd.ExposedWriteErrorResponse(ctx, w, errCode, r.URL)
			return
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
			ctx = claim.ToContext(ctx, claim.Claims{
				Name:      common.PydioS3AnonUsername,
				Roles:     strings.Join(s, ","),
				Profile:   "anon",
				GroupPath: "/",
			})

		} else {

			cmd.ExposedWriteErrorResponse(ctx, w, cmd.ErrAccessDenied, r.URL)
			return

		}

	}

	ctx = propagator.WithUserNameMetadata(ctx, common.PydioContextUserKey, userName)
	newRequest := r.WithContext(ctx)
	a.handler.ServeHTTP(w, newRequest)

}

func (a *pydioAuthHandler) extractToken(ctx context.Context, r *http.Request) (token string, fromPydioJWT bool, er error) {

	rq := r.URL.Query()

	if bearer := r.Header.Get("X-Pydio-Bearer"); bearer != "" {

		return "", false, errors.New("X-Pydio-Bearer authentication method is deprecated")

	} else if jwt := rq.Get("pydio_jwt"); len(jwt) > 0 {

		rq.Del("pydio_jwt")
		if r.Method == http.MethodGet && !strings.HasPrefix(strings.TrimSpace(rq.Get("response-content-disposition")), "attachment") {
			rq.Set("response-content-disposition", "attachment")
		}
		r.URL.RawQuery = rq.Encode()
		_ = r.ParseForm()
		return jwt, true, nil

	}

	var s3Err cmd.APIErrorCode
	token, s3Err = cmd.ExposedExtractKeyFromSignature(r)

	if s3Err != cmd.ErrNone {
		return "", false, errors.New(s3Err.String())
	}

	return
}

func (a *pydioAuthHandler) resignPydioJWTPresignedRequest(r *http.Request) (*http.Request, bool) {
	if !isPresignedV4(r.URL.Query()) {
		return r, false
	}
	if _, errCode := cmd.ExposedExtractKeyFromSignature(r); errCode != cmd.ErrNone {
		return r, false
	}
	return presignWithGatewayCredentials(r), true
}

func isPresignedV4(query url.Values) bool {
	return query.Get("X-Amz-Credential") != "" && query.Get("X-Amz-Signature") != "" && query.Get("X-Amz-Date") != ""
}

func presignWithGatewayCredentials(r *http.Request) *http.Request {
	origURL := r.URL
	origHeader := r.Header
	newURL := *origURL
	newQuery := url.Values{}
	expire := int64(900)

	for k, vv := range origURL.Query() {
		if k == "X-Amz-Expires" {
			if ex, e := strconv.ParseInt(strings.Join(vv, ""), 10, 64); e == nil {
				expire = ex
			}
		}
		if strings.HasPrefix(k, "X-Amz-") || k == "pydio_jwt" {
			continue
		}
		for _, v := range vv {
			newQuery.Add(k, v)
		}
	}
	newURL.RawQuery = newQuery.Encode()

	newReq := *r
	newReq.URL = &newURL
	newReq.RequestURI = newURL.RequestURI()
	_ = newReq.ParseForm()
	signed := signer.PreSignV4(newReq, common.S3GatewayRootUser, common.S3GatewayRootPassword, "", common.S3GatewayDefaultRegion, expire)
	if len(origHeader) > 0 {
		signed.Header = origHeader.Clone()
	}
	return signed
}
