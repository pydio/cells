package transport

const (
	// KeyS3BearerHeader is the legacy additional header used by Pydio Cells API
	// to authenticate the request to the tweaked S3 API.
	KeyS3BearerHeader = "X-Pydio-Bearer"
)

var (

	// RunEnvAwareTests flag permits easy switch off of all tests
	// that will not pass in basic environment, typically in TeamCity, without specific configuration
	RunEnvAwareTests = false // TODO enhance
)
