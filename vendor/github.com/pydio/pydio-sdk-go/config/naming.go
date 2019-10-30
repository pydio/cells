package config

import (
	hashiversion "github.com/hashicorp/go-version"
)

const (
	// KeyS3BearerHeader is the leagacy additional header used by Pydio Cells API
	// to authenticate the request to the twicked S3 API.
	KeyS3BearerHeader = "X-Pydio-Bearer"
)

var (
	// PackageType stores and exposes current package type.
	PackageType string
	// PackageLabel stores and exposes current package label.
	PackageLabel string

	// The 3 below vars are initialized by the go linker directly
	// in the resulting binary when doing 'make main'
	version = "0.1.0"
	// BuildStamp stores the current build stamp.
	BuildStamp string
	// BuildRevision stores the current build version.
	BuildRevision string

	// RunEnvAwareTests flag permits easy switch off of all tests
	// that will not pass in basic environment, typically in TeamCity, without specific configuration
	RunEnvAwareTests = false // TODO enhance
)

// Version retrieves the current build version of the app. Note that this is updated via the linker upon build.
func Version() *hashiversion.Version {
	v, _ := hashiversion.NewVersion(version)
	return v
}
