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

	"github.com/pydio/cells/v4/common"
	"github.com/pydio/cells/v4/common/auth"
	"github.com/pydio/cells/v4/common/auth/claim"
	"github.com/pydio/cells/v4/common/log"
	"github.com/pydio/cells/v4/common/service/context"
	"github.com/pydio/cells/v4/common/service/context/metadata"
	"github.com/pydio/cells/v4/common/utils/permissions"
)

// authHandler - handles all the incoming authorization headers and validates them if possible.
type pydioAuthHandler struct {
	handler         http.Handler
	jwtVerifier     *auth.JWTVerifier
	globalAccessKey string
}

// GetPydioAuthHandlerFunc validates Pydio authorization headers for the incoming request.
func GetPydioAuthHandlerFunc(globalAccessKey string) mux.MiddlewareFunc {
	return func(h http.Handler) http.Handler {
		return pydioAuthHandler{
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
	ctx := r.Context()
	ctx = servicecontext.HttpRequestInfoToMetadata(ctx, r)
	ctx = servicecontext.WithServiceName(ctx, common.ServiceGatewayData)

	resignRequestV4 := false
	resignRequestV4Presigned := false

	rq := r.URL.Query()
	jwt := rq.Get("pydio_jwt")

	if len(jwt) > 0 {
		// The legacy pydio_jwt path re-signs the request with gateway credentials
		// before MinIO validates it. Copy-source requests are not supported on
		// this compatibility path.
		if errCode := validateLegacyCopySource(r); errCode != cmd.ErrNone {
			cmd.ExposedWriteErrorResponse(ctx, w, errCode, r.URL)
			return
		}

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
		if signedKey, err := cmd.ExposedParsePresignV4(r.Form); err == nil && (signedKey != a.globalAccessKey || checkResignV4) {
			resignRequestV4Presigned = true
		}

	} else if bearer, ok := r.Header["X-Pydio-Bearer"]; !ok || len(bearer) == 0 {
		// Copy request.
		req := *r
		// Save authorization header.
		v4Auth := req.Header.Get("Authorization")
		// Parse signature version '4' header.
		if signedKey, err := cmd.ExposedParseSignV4(v4Auth); err == nil && signedKey != a.globalAccessKey {
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
			if amzDate := r.Header.Get("X-Amz-Date"); amzDate != "" {
				// Parse header as ISO8861 format - It is set at signature time, so more or less represents the request issue time.
				// If it's too far from now, request body has probably been buffered too long and now the token is invalid
				// In that case, trigger a 504 GatewayTimeout code so that it is interpreted as a retryable error.
				if reqTime, e := time.Parse("20060102T150405Z", amzDate); e == nil {
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

		if errCode := validateCopySourceSignature(r); errCode != cmd.ErrNone {
			cmd.ExposedWriteErrorResponse(ctx, w, errCode, r.URL)
			return
		}

		if errCode := validateExtractSignature(r); errCode != cmd.ErrNone {
			cmd.ExposedWriteErrorResponse(ctx, w, errCode, r.URL)
			return
		}

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

	ctx = metadata.WithUserNameMetadata(ctx, userName)
	newRequest := r.WithContext(ctx)
	a.handler.ServeHTTP(w, newRequest)

}

// validateLegacyCopySource reports whether copy-source is supported on the
// pydio_jwt compatibility path.
func validateLegacyCopySource(r *http.Request) cmd.APIErrorCode {
	if r.Header.Get("X-Amz-Copy-Source") != "" {
		return cmd.ErrAccessDenied
	}
	return cmd.ErrNone
}

// validateCopySourceSignature verifies copy-source requests against the
// signed headers selected for the request, so copy dispatch stays consistent
// with signature coverage.
func validateCopySourceSignature(r *http.Request) cmd.APIErrorCode {
	if r.Header.Get("X-Amz-Copy-Source") == "" {
		return cmd.ErrNone
	}
	if len(r.Header.Values("X-Amz-Copy-Source")) != 1 {
		return cmd.ErrAccessDenied
	}
	return requireSignedHeaderCoverage(r, "x-amz-copy-source")
}

// validateExtractSignature verifies that a snowball auto-extract header is
// covered by the signed headers selected for the request, so extract
// dispatch stays consistent with signature coverage. MinIO routes object
// writes carrying this header to its extract handler, but only when the
// value marks extraction; any other value keeps plain put dispatch.
func validateExtractSignature(r *http.Request) cmd.APIErrorCode {
	for _, value := range r.Header.Values("X-Amz-Meta-Snowball-Auto-Extract") {
		if strings.Contains(strings.ToLower(value), "true") {
			return requireSignedHeaderCoverage(r, "x-amz-meta-snowball-auto-extract")
		}
	}
	return cmd.ErrNone
}

// requireSignedHeaderCoverage checks that the given header is part of the
// SignedHeaders list of the signature mode selected for the request. SigV2
// authenticates x-amz-* headers implicitly, so those requests are accepted.
func requireSignedHeaderCoverage(r *http.Request, wanted string) cmd.APIErrorCode {
	signedHeaders, implicit, ok := selectedSignedHeaders(r)
	if implicit {
		return cmd.ErrNone
	}
	if !ok || !signedHeaderListContains(signedHeaders, wanted) {
		return cmd.ErrAccessDenied
	}
	return cmd.ErrNone
}

// selectedSignedHeaders resolves the SignedHeaders list for the signature
// mode MinIO selects for the request. implicit reports modes that cover
// x-amz-* headers by construction, where no list applies. ok reports
// whether a list was resolved for a list-based mode.
func selectedSignedHeaders(r *http.Request) (signedHeaders string, implicit bool, ok bool) {
	authorization := strings.TrimSpace(r.Header.Get("Authorization"))
	if strings.HasPrefix(authorization, "AWS4-HMAC-SHA256") {
		// Authorization SigV4 is selected whenever the Authorization header is
		// present; SignedHeaders must come from that header.
		if queryHasSignedHeaders(r) {
			return "", false, false
		}
		signedHeaders, ok = authorizationSignedHeaders(authorization)
		return signedHeaders, false, ok
	}

	if authorization != "" {
		// An Authorization value alone does not select SigV2. Query credentials
		// select query-presigned mode and use the query SignedHeaders.
		if queryHasV4Credentials(r) {
			signedHeaders, present, valid := querySignedHeaders(r)
			return signedHeaders, false, present && valid
		}

		// SigV2 has no SignedHeaders list. Its canonicalization authenticates
		// x-amz-* headers implicitly.
		return "", true, true
	}

	// With no Authorization header, MinIO selects query-presigned mode. Read
	// the SignedHeaders parameter strictly from the query.
	signedHeaders, present, ok := querySignedHeaders(r)
	if !present {
		// A valid query SigV2 request has no SignedHeaders parameter.
		return "", true, true
	}
	return signedHeaders, false, ok
}

func queryHasV4Credentials(r *http.Request) bool {
	query := r.URL.Query()
	for key := range query {
		if key == "X-Amz-Credential" {
			return true
		}
	}
	return false
}

func queryHasSignedHeaders(r *http.Request) bool {
	present := false
	for key := range r.URL.Query() {
		if strings.EqualFold(key, "X-Amz-SignedHeaders") {
			present = true
		}
	}
	return present
}

func querySignedHeaders(r *http.Request) (value string, present bool, valid bool) {
	query := r.URL.Query()
	for key, values := range query {
		if !strings.EqualFold(key, "X-Amz-SignedHeaders") {
			continue
		}
		present = true
		if key != "X-Amz-SignedHeaders" || len(values) != 1 || values[0] == "" || value != "" {
			return "", true, false
		}
		value = values[0]
	}
	return value, present, value != ""
}

func authorizationSignedHeaders(authorization string) (string, bool) {
	var signedHeaders string
	count := 0
	for _, field := range strings.Split(authorization, ",") {
		name, value, ok := strings.Cut(strings.TrimSpace(field), "=")
		if !ok || !strings.EqualFold(name, "SignedHeaders") {
			continue
		}
		count++
		signedHeaders = value
	}
	return signedHeaders, count == 1 && signedHeaders != ""
}

func signedHeaderListContains(signedHeaders, wanted string) bool {
	for _, header := range strings.Split(signedHeaders, ";") {
		if strings.EqualFold(strings.TrimSpace(header), wanted) {
			return true
		}
	}
	return false
}
