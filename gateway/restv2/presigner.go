package restv2

import (
	"context"
	"fmt"
	"net/http"
	"net/url"
	"path"
	"strings"
	"time"

	"github.com/minio/minio-go/v7/pkg/signer"
	"go.uber.org/zap"

	"github.com/pydio/cells/v5/common"
	"github.com/pydio/cells/v5/common/auth/claim"
	"github.com/pydio/cells/v5/common/client/grpc"
	"github.com/pydio/cells/v5/common/proto/auth"
	"github.com/pydio/cells/v5/common/telemetry/log"
	"github.com/pydio/cells/v5/common/utils/cache"
	cache_helper "github.com/pydio/cells/v5/common/utils/cache/helper"
)

type SignerProviderFunc func(endpoint *url.URL, apiKey, apiSecret, region, session string, expiration int64) PreSigner

var SignerProvider SignerProviderFunc = func(endpoint *url.URL, apiKey, apiSecret, region, session string, expiration int64) PreSigner {
	return &v4Signer{
		endpoint:   endpoint,
		apiKey:     apiKey,
		apiSecret:  apiSecret,
		region:     region,
		expiration: expiration,
	}
}

type v4Signer struct {
	apiKey     string
	apiSecret  string
	region     string
	endpoint   *url.URL
	expiration int64
}

func (v *v4Signer) PreSignV4(ctx context.Context, bucket, key string) (*http.Request, time.Time, error) {
	u := *v.endpoint
	u.Path = path.Join(bucket, key)
	req, err := http.NewRequest(http.MethodGet, u.String(), nil)
	if err != nil {
		return nil, time.Now(), err
	}
	exp := time.Now().Add(time.Duration(v.expiration) * time.Second)
	req = signer.PreSignV4(*req, v.apiKey, v.apiSecret, "", v.region, v.expiration)
	return req, exp, nil
}

func NewV4SignerForRequest(r *http.Request, expSeconds int64) (PreSigner, error) {

	ctx := r.Context()
	// Cache for half the expiration time
	ca, err := cache_helper.ResolveCache(ctx, common.CacheTypeShared, cache.Config{
		Prefix:      "requests/presign",
		CleanWindow: fmt.Sprintf("%ds", expSeconds),
		Eviction:    fmt.Sprintf("%ds", expSeconds/2),
	})
	if err != nil {
		return nil, err
	}
	// Todo load from external ?
	endpoint, err := url.Parse("https://" + r.Host)
	if err != nil {
		return nil, err
	}
	claims, _ := claim.FromContext(r.Context())
	cacheKey := claims.Subject + "-" + endpoint.Hostname()
	expirationDuration := time.Second * time.Duration(expSeconds)
	var apiKey, apiSecret string

	var found bool
	var cached []byte
	if ca.Get(cacheKey, &cached) {
		parts := strings.Split(string(cached), "::")
		if len(parts) == 2 {
			apiKey = parts[0]
			apiSecret = parts[1]
			found = true
		}
	}
	if !found {
		t := time.Now()
		cl := auth.NewPersonalAccessTokenServiceClient(grpc.ResolveConn(ctx, common.ServiceTokenGRPC))
		resp, er := cl.Generate(ctx, &auth.PatGenerateRequest{
			Type:               auth.PatType_PERSONAL,
			UserUuid:           claims.Subject,
			UserLogin:          claims.Name,
			Label:              "Automated PreSigned Key",
			ExpiresAt:          time.Now().Add(expirationDuration).Unix(),
			Issuer:             endpoint.Hostname(),
			GenerateSecretPair: true,
		})
		if er != nil {
			return nil, er
		}
		log.Logger(ctx).Info("Generated a new key pair with expiration for "+claims.Name, zap.Duration("t", time.Since(t)))
		apiKey = resp.GetAccessToken()
		apiSecret = resp.GetSecretPair()
		_ = ca.Set(cacheKey, []byte(apiKey+"::"+apiSecret))
	}

	return SignerProvider(endpoint, apiKey, apiSecret, "us-east-1", "", expSeconds), nil
}
