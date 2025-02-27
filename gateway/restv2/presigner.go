package restv2

import (
	"context"
	"net/http"
	"net/url"
	"path"
	"strings"

	"github.com/minio/minio-go/v7/pkg/signer"

	"github.com/pydio/cells/v5/common"
)

type v4Signer struct {
	apiKey    string
	apiSecret string
	region    string
	endpoint  *url.URL
	scheme    string
}

func NewV4SignerForRequest(r *http.Request) (PreSigner, error) {
	// Get token from Auth Bearer for now
	// Todo - generate a s3 key/secret instead
	s := &v4Signer{}
	s.region = "us-east-1"
	s.apiKey = strings.TrimPrefix(r.Header.Get("Authorization"), "Bearer ")
	s.apiSecret = common.S3GatewayRootPassword
	// Todo load external
	var err error
	s.endpoint, err = url.Parse("https://" + r.Host)
	if err != nil {
		return nil, err
	}
	return s, nil
}

func (v *v4Signer) PreSignV4(ctx context.Context, bucket, key string) (*http.Request, error) {
	u := *v.endpoint
	u.Path = path.Join(bucket, key)
	req, err := http.NewRequest(http.MethodGet, u.String(), nil)
	if err != nil {
		return nil, err
	}
	req = signer.PreSignV4(*req, v.apiKey, v.apiSecret, "", v.region, 900)
	return req, nil
}
