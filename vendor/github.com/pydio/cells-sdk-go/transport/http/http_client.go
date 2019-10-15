package http

import (
	"crypto/tls"
	"net/http"

	"github.com/pydio/cells-sdk-go"
)

// GetHttpClient provides an option to rather use an http client that ignore SSL certificate issues.
func GetHttpClient(sdkConfig *cells_sdk.SdkConfig) *http.Client {

	t := http.DefaultTransport
	if sdkConfig.SkipVerify {
		t = &http.Transport{
			TLSClientConfig: &tls.Config{InsecureSkipVerify: true}, // ignore expired SSL certificates
		}
	}
	if sdkConfig.CustomHeaders != nil && len(sdkConfig.CustomHeaders) > 0 {
		t = &customHeaderRoundTripper{
			rt:      t,
			Headers: sdkConfig.CustomHeaders,
		}
	}
	return &http.Client{Transport: t}
}

type customHeaderRoundTripper struct {
	rt      http.RoundTripper
	Headers map[string]string
}

func (c customHeaderRoundTripper) RoundTrip(req *http.Request) (*http.Response, error) {
	for k, v := range c.Headers {
		req.Header.Set(k, v)
	}
	return c.rt.RoundTrip(req)
}
