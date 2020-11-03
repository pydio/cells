package frontend

import (
	"net/http"

	"github.com/pydio/cells/x/configx"
)

type RequestStatus struct {
	Config        configx.Values
	AclParameters configx.Values
	AclActions    configx.Values
	WsScopes      []string

	User     *User
	NoClaims bool
	Lang     string

	Request *http.Request
}
