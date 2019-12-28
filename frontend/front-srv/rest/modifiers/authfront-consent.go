package modifiers

import (
	"github.com/emicklei/go-restful"
	"github.com/gorilla/sessions"

	"github.com/pydio/cells/common/auth/hydra"
	"github.com/pydio/cells/common/proto/rest"
	"github.com/pydio/cells/common/service/frontend"
)

func ConsentAuth(middleware frontend.AuthMiddleware) frontend.AuthMiddleware {

	return func(req *restful.Request, rsp *restful.Response, in *rest.FrontSessionRequest, out *rest.FrontSessionResponse, session *sessions.Session) error {
		if a, ok := in.AuthInfo["type"]; !ok || a != "consent" { // Ignore this middleware
			return middleware(req, rsp, in, out, session)
		}

		challenge := in.AuthInfo["challenge"]

		// Need to check if we should skip that ...
		consent, err := hydra.GetConsent(challenge)
		if err != nil {
			return err
		}

		// Nonce is being set somewhere else
		// nonce, ok := session.Values["nonce"]
		// if !ok {
		// 	nonce = uuid.New()
		// }

		// TODO - add id_token values

		resp, err := hydra.AcceptConsent(challenge, struct {
			GrantScope               []string `json:"grant_scope"`
			GrantAccessTokenAudience []string `json:"grant_access_token_audience"`
		}{
			consent.RequestedScope,
			consent.RequestedAccessTokenAudience,
		})
		if err != nil {
			return err
		}

		out.RedirectTo = resp.RedirectTo

		return nil

		// token := respMap["id_token"].(string)
		// expiry := respMap["expires_in"].(float64)
		// refreshToken := respMap["refresh_token"].(string)

		// session.Values["jwt"] = token
		// session.Values["refresh_token"] = refreshToken
		// session.Values["expiry"] = time.Now().Add(time.Duration(expiry) * time.Second).Unix()
		// session.Values["nonce"] = nonce

		// out.JWT = token
		// out.ExpireTime = int32(expiry)

		// return middleware(req, rsp, in, out, session)
	}
}
