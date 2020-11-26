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

func renameKeys(config configx.Values) error {
	return UpdateKeys(config, map[string]string{
		"services/pydio.api.websocket":      "services/" + common.ServiceGatewayNamespace_ + common.ServiceWebSocket,
		"services/pydio.grpc.gateway.data":  "services/" + common.ServiceGatewayData,
		"services/pydio.grpc.gateway.proxy": "services/" + common.ServiceGatewayProxy,
		"services/pydio.rest.gateway.dav":   "services/" + common.ServiceGatewayDav,
		"services/pydio.rest.gateway.wopi":  "services/" + common.ServiceGatewayWopi,
		"ports/micro.api":                   "ports/" + common.ServiceMicroApi,
		"services/micro.api":                "services/" + common.ServiceMicroApi,
		"services/pydio.api.front-plugins":  "services/" + common.ServiceWebNamespace_ + common.ServiceFrontStatics,
		// "services/pydio.grpc.auth/dex/connectors": "services/" + common.ServiceWebNamespace_ + common.ServiceOAuth + "/connectors",
	})
}
