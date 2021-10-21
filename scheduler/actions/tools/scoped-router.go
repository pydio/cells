package tools

import (
	"context"

	"github.com/pydio/cells/common"
	"github.com/pydio/cells/common/auth"
	"github.com/pydio/cells/common/utils/permissions"
	"github.com/pydio/cells/common/views"
)

type ScopedRouterConsumer struct {
	owner        string
	ownerScope   bool
	presetClient views.Handler
}

// PresetHandler sets a ready to use views.Handler
func (s *ScopedRouterConsumer) PresetHandler(h views.Handler) {
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
func (s *ScopedRouterConsumer) GetHandler(ctx context.Context) (context.Context, views.Handler, error) {
	if s.presetClient != nil {
		return ctx, s.presetClient, nil
	}
	if s.owner == common.PydioSystemUsername || !s.ownerScope {
		return ctx, views.NewStandardRouter(views.RouterOptions{AdminView: true}), nil
	} else {
		if u, claims := permissions.FindUserNameInContext(ctx); u != s.owner || claims.Name != s.owner {
			if user, e := permissions.SearchUniqueUser(ctx, s.owner, ""); e != nil {
				return ctx, nil, e
			} else {
				ctx = auth.WithImpersonate(ctx, user)
			}
		}
		return ctx, views.NewStandardRouter(views.RouterOptions{}), nil
	}
}
