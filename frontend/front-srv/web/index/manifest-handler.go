package index

import (
	"context"

	"github.com/pydio/cells/common/proto/front"
	"github.com/pydio/cells/common/service/frontend"
)

type ManifestHandler struct{}

func (m *ManifestHandler) ExposedParameters(ctx context.Context, request *front.ExposedParametersRequest, response *front.ExposedParametersResponse) error {
	pool, e := frontend.GetPluginsPool()
	if e != nil {
		return e
	}
	params := pool.ExposedParametersByScope(request.Scope, request.Exposed)
	for _, p := range params {
		response.Parameters = append(response.Parameters, &front.ExposedParameter{
			Name:     p.Attrname,
			Scope:    p.Attrscope,
			PluginId: p.PluginId,
		})
	}
	return nil
}
