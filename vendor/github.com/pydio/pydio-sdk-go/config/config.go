package config

import (
	"path/filepath"
)

// SdkConfig contains necessary data to connect to Pydio Cells API.
type SdkConfig struct {
	// Protocol used: http, https or wss.
	Protocol string `json:"protocol"`
	// Url stores domain name or IP & port to the server.
	Url string `json:"url"`
	// Path may add an addition path segment to access server, e.g; /pydio
	Path string `json:"path"`
	// Pydio User Authentication
	User     string `json:"user"`
	Password string `json:"password"`
	// Disable SSL check for self-signed certificates - not recommended
	SkipVerify bool `json:"skipVerify"`
}

var (
	DefaultConfig   *SdkConfig
)

// GetDefaultConfigFiles simply retrieves absolute path for cells and s3 SDK config
// files give the absolute path to the root of the pydio-sdk-go source code folder.
func GetDefaultConfigFiles(codeRootPath string) (string) {
	rpath := filepath.Join(codeRootPath, "config")
	cpath := filepath.Join(rpath, "config.json")
	return cpath
}
