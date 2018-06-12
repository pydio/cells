package cmd

import (
	"context"
	"net/http"
	"strings"

	"go.uber.org/zap"

//	"github.com/micro/go-micro/metadata"
	"github.com/pydio/cells/common"
	"github.com/pydio/cells/common/auth"
	pydiolog "github.com/pydio/cells/common/log"
	"github.com/pydio/cells/common/service/context"
	"github.com/pydio/cells/common/auth/claim"
	"github.com/pydio/cells/common/utils"
	"github.com/micro/go-micro/metadata"
	"io/ioutil"
	"bytes"
)

// authHandler - handles all the incoming authorization headers and validates them if possible.
type pydioAuthHandler struct {
	handler     http.Handler
	jwtVerifier *auth.JWTVerifier
	gateway     bool
}

// setAuthHandler to validate authorization header for the incoming request.
func getPydioAuthHandlerFunc(gateway bool) HandlerFunc {
	return func(h http.Handler) http.Handler {
		return pydioAuthHandler{
			handler:     h,
			jwtVerifier: auth.DefaultJWTVerifier(),
			gateway:     gateway,
		}
	}
}

func checkRequestAuthTypeSkipAccessKey(r *http.Request, bucket, policyAction, region string) APIErrorCode {
	reqAuthType := getRequestAuthType(r)

	switch reqAuthType {
	case authTypePresignedV2, authTypeSignedV2:
		// Signature V2 validation.
		s3Error := isReqAuthenticatedV2(r)
		if s3Error != ErrNone {
			errorIf(errSignatureMismatch, "%s", dumpRequest(r))
		}
		return s3Error
	case authTypeSigned, authTypePresigned:
		s3Error := isReqAuthenticatedSkipAccessKey(r, region)
		if s3Error != ErrNone {
			errorIf(errSignatureMismatch, "%s", dumpRequest(r))
		}
		return s3Error
	}

	if reqAuthType == authTypeAnonymous && policyAction != "" {
		// http://docs.aws.amazon.com/AmazonS3/latest/dev/using-with-s3-actions.html
		sourceIP := getSourceIPAddress(r)
		return enforceBucketPolicy(bucket, policyAction, r.URL.Path,
			r.Referer(), sourceIP, r.URL.Query())
	}

	// By default return ErrAccessDenied
	return ErrAccessDenied
}


func reqSignatureV4VerifySkipAccessKey(r *http.Request, region string) (s3Error APIErrorCode) {
	sha256sum := getContentSha256Cksum(r)
	switch {
	case isRequestSignatureV4(r):
		return doesSignatureMatch(sha256sum, r, region, true)
	case isRequestPresignedSignatureV4(r):
		return doesPresignedSignatureMatch(sha256sum, r, region)
	default:
		return ErrAccessDenied
	}
}

// Verify if request has valid AWS Signature Version '4'.
func isReqAuthenticatedSkipAccessKey(r *http.Request, region string) (s3Error APIErrorCode) {
	if r == nil {
		return ErrInternalError
	}
	if errCode := reqSignatureV4VerifySkipAccessKey(r, region); errCode != ErrNone {
		return errCode
	}
	payload, err := ioutil.ReadAll(r.Body)
	if err != nil {
		errorIf(err, "Unable to read request body for signature verification")
		return ErrInternalError
	}

	// Populate back the payload.
	r.Body = ioutil.NopCloser(bytes.NewReader(payload))

	// Verify Content-Md5, if payload is set.
	if r.Header.Get("Content-Md5") != "" {
		if r.Header.Get("Content-Md5") != getMD5HashBase64(payload) {
			return ErrBadDigest
		}
	}

	if skipContentSha256Cksum(r) {
		return ErrNone
	}

	// Verify that X-Amz-Content-Sha256 Header == sha256(payload)
	// If X-Amz-Content-Sha256 header is not sent then we don't calculate/verify sha256(payload)
	sum := r.Header.Get("X-Amz-Content-Sha256")
	if isRequestPresignedSignatureV4(r) {
		sum = r.URL.Query().Get("X-Amz-Content-Sha256")
	}
	if sum != "" && sum != getSHA256Hash(payload) {
		return ErrContentSHA256Mismatch
	}
	return ErrNone
}



// handler for validating incoming authorization headers.
func (a pydioAuthHandler) ServeHTTP(w http.ResponseWriter, r *http.Request) {

	//var md map[string]string
	var userName string
	ctx := r.Context()
	ctx = servicecontext.HttpRequestInfoToMetadata(ctx, r)
	if a.gateway{
		ctx = servicecontext.WithServiceName(ctx, common.SERVICE_GATEWAY_DATA)
	} else {
		ctx = servicecontext.WithServiceName(ctx, common.SERVICE_GRPC_NAMESPACE_ + common.SERVICE_DATA_OBJECTS)
	}

	jwt := r.URL.Query().Get("pydio_jwt")

	if a.gateway && len(jwt) > 0 {
		pydiolog.Logger(ctx).Debug("Found JWT in URL: replace by header and remove from URL")
		r.Header.Set("X-Pydio-Bearer", jwt)
		r.URL.RawQuery = strings.Replace(r.URL.RawQuery, "&pydio_jwt="+jwt, "", 1)

	} else if bearer, ok := r.Header["X-Pydio-Bearer"]; a.gateway && (!ok || len(bearer) == 0) {
		// Copy request.
		req := *r
		// Save authorization header.
		v4Auth := req.Header.Get("Authorization")
		// Parse signature version '4' header.
		signV4Values, err := parseSignV4(v4Auth)
		if err == ErrNone {
			accessKey := signV4Values.Credential.accessKey
			cred := serverConfig.GetCredential()
			if accessKey != cred.AccessKey {
				pydiolog.Logger(ctx).Debug("Use AWS Api Key as JWT: " + signV4Values.Credential.accessKey)
				r.Header.Set("X-Pydio-Bearer", accessKey)
			}
		}
	}

	if bearer, ok := r.Header["X-Pydio-Bearer"]; ok && len(bearer) > 0 {

		rawIDToken := strings.Join(bearer, "")
		var err error
		var claims claim.Claims
		ctx, claims, err = a.jwtVerifier.Verify(ctx, rawIDToken)
		if err != nil {
			writeErrorResponse(w, ErrAccessDenied, r.URL)
			return
		}
		userName = claims.Name

	} else if values, ok := r.Header[common.PYDIO_CONTEXT_USER_KEY]; !a.gateway && ok && len(values) > 0 {

		userName = strings.Join(values, "")

	} else if agent, aOk := r.Header["User-Agent"]; aOk && strings.Contains(strings.Join(agent, ""), "pydio.sync.client.s3") {

		userName = common.PYDIO_SYSTEM_USERNAME

	} else {

		if a.gateway {

			if user, er := utils.SearchUniqueUser(ctx, common.PYDIO_S3ANON_USERNAME, ""); er == nil {
				userName = common.PYDIO_S3ANON_USERNAME
				var s []string
				for _, role := range user.Roles {
					if role.UserRole { // Just append the User Role
						s = append(s, role.Uuid)
					}
				}
				anonClaim := claim.Claims{
					Name:common.PYDIO_S3ANON_USERNAME,
					Roles:strings.Join(s, ","),
					Profile:"anon",
					GroupPath:"/",
				}
				pydiolog.Logger(ctx).Error("S3 Gateway: Anonymous User", zap.String("request", r.URL.String()))
				ctx = context.WithValue(ctx, claim.ContextKey, anonClaim)

			} else {
				pydiolog.Logger(ctx).Error("S3 Gateway: No User found, error 401", zap.Error(er), zap.String("request", r.URL.String()))
				writeErrorResponse(w, ErrAccessDenied, r.URL)
				return
			}
			//a.handler.ServeHTTP(w, r)
		} else {
			pydiolog.Logger(ctx).Error("S3 DataSource: could not find neither X-Pydio-Bearer nor X-Pydio-User in headers, error 401", zap.Any("requestHeaders", r.Header))
			writeErrorResponse(w, ErrAccessDenied, r.URL)
			return
		}

	}

	md := make(map[string]string)
	if meta, ok := metadata.FromContext(ctx); ok {
		for k, v := range meta{
			md[k] = v
		}
	}
	md[common.PYDIO_CONTEXT_USER_KEY] = userName
	ctx = metadata.NewContext(ctx, md)

	// Add it as value for easier use inside the gateway, but this will not be transmitted
	ctx = context.WithValue(ctx, common.PYDIO_CONTEXT_USER_KEY, userName)

	if a.gateway {
		pydiolog.Logger(ctx).Debug("AuthHandler: updating request with context", zap.Any("ctx", ctx))
	}

	newRequest := r.WithContext(ctx)
	a.handler.ServeHTTP(w, newRequest)

}
