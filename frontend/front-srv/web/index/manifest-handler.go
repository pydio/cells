package index

import (
	"context"

	"github.com/pydio/cells/v4/common/proto/front"
	"github.com/pydio/cells/v4/common/service/frontend"
)

type ManifestHandler struct {
	front.UnimplementedManifestServiceServer
	HandlerName string
}

func (m *ManifestHandler) Name() string {
	return m.HandlerName
}

func (m *ManifestHandler) ExposedParameters(ctx context.Context, request *front.ExposedParametersRequest) (*front.ExposedParametersResponse, error) {
	pool, e := frontend.GetPluginsPool()
	if e != nil {
		return nil, e
	}
	response := &front.ExposedParametersResponse{}
	params := pool.ExposedParametersByScope(request.Scope, request.Exposed)
	for _, p := range params {
		response.Parameters = append(response.Parameters, &front.ExposedParameter{
			Name:     p.Attrname,
			Scope:    p.Attrscope,
			PluginId: p.PluginId,
		})
	}
	return response, nil
}
