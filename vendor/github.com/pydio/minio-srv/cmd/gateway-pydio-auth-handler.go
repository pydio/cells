package cmd

import (
	"context"
	"fmt"
	"net/http"
	"strings"

	"github.com/pydio/cells/common"
	"github.com/pydio/cells/common/auth"
	"github.com/pydio/cells/common/auth/claim"
	"github.com/pydio/cells/common/service/context"
	context2 "github.com/pydio/cells/common/utils/context"
	"github.com/pydio/cells/common/utils/permissions"
	"github.com/pydio/minio-srv/cmd/logger"
	auth2 "github.com/pydio/minio-srv/pkg/auth"
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

// handler for validating incoming authorization headers.
func (a pydioAuthHandler) ServeHTTP(w http.ResponseWriter, r *http.Request) {

	//var md map[string]string
	var userName string
	ctx := r.Context()
	ctx = servicecontext.HttpRequestInfoToMetadata(ctx, r)
	if a.gateway {
		ctx = servicecontext.WithServiceName(ctx, common.SERVICE_GATEWAY_DATA)
	} else {
		ctx = servicecontext.WithServiceName(ctx, common.SERVICE_GRPC_NAMESPACE_+common.SERVICE_DATA_OBJECTS)
	}
	storeJwtInGlobalIAM := false
	jwt := r.URL.Query().Get("pydio_jwt")

	if a.gateway && len(jwt) > 0 {
		//logger.Info("Found JWT in URL: replace by header and remove from URL")
		r.Header.Set("X-Pydio-Bearer", jwt)
		r.URL.RawQuery = strings.Replace(r.URL.RawQuery, "&pydio_jwt="+jwt, "", 1)

	} else if bearer, ok := r.Header["X-Pydio-Bearer"]; a.gateway && (!ok || len(bearer) == 0) {
		// Copy request.
		req := *r
		// Save authorization header.
		v4Auth := req.Header.Get("Authorization")
		// Parse signature version '4' header.
		signV4Values, err := parseSignV4(v4Auth, globalServerRegion)
		if err == ErrNone {
			accessKey := signV4Values.Credential.accessKey
			if accessKey != globalServerConfig.GetCredential().AccessKey {
				//logger.Info("Use AWS Api Key as JWT: " + signV4Values.Credential.accessKey)
				storeJwtInGlobalIAM = true
				r.Header.Set("X-Pydio-Bearer", accessKey)
			}
		}
	}

	if values, ok := r.Header[common.PydioContextUserKey]; !a.gateway && ok && len(values) > 0 {

		userName = strings.Join(values, "")

	} else if bearer, ok := r.Header["X-Pydio-Bearer"]; ok && len(bearer) > 0 {

		rawIDToken := strings.Join(bearer, "")
		var err error
		var claims claim.Claims
		ctx, claims, err = a.jwtVerifier.Verify(ctx, rawIDToken)
		if err != nil {
			writeErrorResponse(w, ErrAccessDenied, r.URL)
			return
		}
		userName = claims.Name
		if storeJwtInGlobalIAM {
			globalIAMSys.SetTempUser(rawIDToken, auth2.Credentials{}, "")
		}

	} else if agent, aOk := r.Header["User-Agent"]; aOk && strings.Contains(strings.Join(agent, ""), "pydio.sync.client.s3") {

		userName = common.PydioSystemUsername

	} else {

		if a.gateway {

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
				logger.LogIf(ctx, er)
				writeErrorResponse(w, ErrAccessDenied, r.URL)
				return
			}

		} else {
			bucketLocation := r.Method == "GET" && strings.HasSuffix(r.URL.String(), "?location=")
			if !bucketLocation {
				logger.LogIf(ctx, fmt.Errorf("S3 DataSource: could not find neither X-Pydio-Bearer nor X-Pydio-User in headers, error 401 on "+r.Method+r.URL.String()))
				writeErrorResponse(w, ErrAccessDenied, r.URL)
				return
			}
		}

	}

	ctx = context2.WithUserNameMetadata(ctx, userName)

	if a.gateway {
		//logger.Info("AuthHandler: updating request with context")
	}

	newRequest := r.WithContext(ctx)
	a.handler.ServeHTTP(w, newRequest)

}
