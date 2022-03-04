package tools

import (
	"context"

	"github.com/pydio/cells/v4/common/nodes/compose"

	"github.com/pydio/cells/v4/common"
	"github.com/pydio/cells/v4/common/auth"
	"github.com/pydio/cells/v4/common/nodes"
	"github.com/pydio/cells/v4/common/utils/permissions"
)

type ScopedRouterConsumer struct {
	common.RuntimeHolder
	owner        string
	ownerScope   bool
	presetClient nodes.Handler
}

// PresetHandler sets a ready to use views.Handler
func (s *ScopedRouterConsumer) PresetHandler(h nodes.Handler) {
	s.presetClient = h
}

// ParseScope checks if parameters have scope=owner value
func (s *ScopedRouterConsumer) ParseScope(owner string, params map[string]string) {
	s.owner = owner
	if sc, ok := params["scope"]; ok && sc == "owner" {
		s.ownerScope = true
	}
}

// GetHandler lazy initialize an views.Handler depending on the scope
func (s *ScopedRouterConsumer) GetHandler(ctx context.Context) (context.Context, nodes.Handler, error) {
	if s.presetClient != nil {
		return ctx, s.presetClient, nil
	}
	if s.owner == common.PydioSystemUsername || !s.ownerScope {
		return ctx, compose.PathClientAdmin(s.GetRuntimeContext()), nil
	} else {
		if u, claims := permissions.FindUserNameInContext(ctx); u != s.owner || claims.Name != s.owner {
			if user, e := permissions.SearchUniqueUser(ctx, s.owner, ""); e != nil {
				return ctx, nil, e
			} else {
				ctx = auth.WithImpersonate(ctx, user)
			}
		}
		return ctx, compose.PathClient(s.GetRuntimeContext()), nil
	}
}
