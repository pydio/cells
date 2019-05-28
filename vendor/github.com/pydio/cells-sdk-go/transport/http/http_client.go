package http

import (
	"crypto/tls"
	"net/http"

	"github.com/pydio/cells-sdk-go"
)

// GetHttpClient provides an option to rather use an http client that ignore SSL certificate issues.
func GetHttpClient(sdkConfig *cells_sdk.SdkConfig) *http.Client {

	if sdkConfig.SkipVerify {
		//log.Println("[WARNING] Using SkipVerify for ignoring SSL certificate issues!")
		return &http.Client{Transport: &http.Transport{
			TLSClientConfig: &tls.Config{InsecureSkipVerify: true}, // ignore expired SSL certificates
		}}
	}
	return http.DefaultClient
}
