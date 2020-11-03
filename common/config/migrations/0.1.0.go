package migrations

import (
	"github.com/hashicorp/go-version"
	"github.com/pydio/cells/common"
	"github.com/pydio/cells/x/configx"
)

func init() {
	v, _ := version.NewVersion("0.1.0")
	add(v, getMigration(renameKeys))
}

func renameKeys(config configx.Values) (bool, error) {
	return UpdateKeys(config, map[string]string{
		"services/pydio.api.websocket":            "services/" + common.SERVICE_GATEWAY_NAMESPACE_ + common.SERVICE_WEBSOCKET,
		"services/pydio.grpc.gateway.data":        "services/" + common.SERVICE_GATEWAY_DATA,
		"services/pydio.grpc.gateway.proxy":       "services/" + common.SERVICE_GATEWAY_PROXY,
		"services/pydio.rest.gateway.dav":         "services/" + common.SERVICE_GATEWAY_DAV,
		"services/pydio.rest.gateway.wopi":        "services/" + common.SERVICE_GATEWAY_WOPI,
		"ports/micro.api":                         "ports/" + common.SERVICE_MICRO_API,
		"services/micro.api":                      "services/" + common.SERVICE_MICRO_API,
		"services/pydio.api.front-plugins":        "services/" + common.SERVICE_WEB_NAMESPACE_ + common.SERVICE_FRONT_STATICS,
		"services/pydio.grpc.auth/dex/connectors": "services/" + common.SERVICE_WEB_NAMESPACE_ + common.SERVICE_OAUTH + "/connectors",
	})
}
