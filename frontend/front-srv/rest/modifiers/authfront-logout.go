package modifiers

import (
	"context"

	"github.com/emicklei/go-restful"
	"github.com/gorilla/sessions"
	"github.com/micro/go-micro/client"

	"github.com/pydio/cells/common"
	"github.com/pydio/cells/common/auth"
	"github.com/pydio/cells/common/proto/idm"
	"github.com/pydio/cells/common/proto/rest"
	"github.com/pydio/cells/common/service/frontend"
)

func LogoutAuth(middleware frontend.AuthMiddleware) frontend.AuthMiddleware {
	return func(req *restful.Request, rsp *restful.Response, in *rest.FrontSessionRequest, out *rest.FrontSessionResponse, session *sessions.Session) error {
		if a, ok := in.AuthInfo["type"]; !ok || a != "logout" { // Ignore this middleware
			return middleware(req, rsp, in, out, session)
		}

		if t, o := session.Values["access_token"]; o {
			v := auth.DefaultJWTVerifier()
			if ctx, cl, e := v.Verify(context.Background(), t.(string)); e == nil {
				// Send Event
				client.Publish(ctx, client.NewPublication(common.TOPIC_IDM_EVENT, &idm.ChangeEvent{
					Type: idm.ChangeEventType_LOGOUT,
					User: &idm.User{Login: cl.Name},
				}))
			}
		}

		// TODO - need to properly logout in hydra
		session.Values = make(map[interface{}]interface{})
		session.Options.MaxAge = 0

		return middleware(req, rsp, in, out, session)
	}
}
