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

func (s *ScopedRouterConsumer) PresetHandler(h views.Handler) {
	s.presetClient = h
}

func (s *ScopedRouterConsumer) ParseScope(owner string, params map[string]string) {
	s.owner = owner
	if sc, ok := params["scope"]; ok && sc == "owner" {
		s.ownerScope = true
	}
}

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
