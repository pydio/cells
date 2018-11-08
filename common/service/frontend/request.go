package frontend

import (
	"net/http"

	"github.com/pydio/cells/common/config"
	config2 "github.com/pydio/go-os/config"
)

type RequestStatus struct {
	Config        config2.Config
	AclParameters *config.Map
	AclActions    *config.Map
	WsScopes      []string

	User     *User
	NoClaims bool
	Lang     string

	Request *http.Request
}
