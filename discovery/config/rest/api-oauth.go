package rest

import (
	restful "github.com/emicklei/go-restful"
	"github.com/pydio/cells/common/config"
	"github.com/pydio/cells/common/proto/rest"
)

// GetDataSource retrieves a datasource given its name.
func (s *Handler) OAuthConfiguration(req *restful.Request, resp *restful.Response) {

	externalURL := config.Get("defaults", "url").String("")

	res := &rest.OAuthConfigurationResponse{
		Issuer:                externalURL + "/a/config/discovery",
		AuthorizationEndpoint: externalURL + "/oauth2/auth",
		TokenEndpoint:         externalURL + "/oauth2/token",
		JwksUri:               externalURL + "/oauth2/jwks",
		ResponseTypesSupported: []string{"code",
			"token",
			"id_token",
			"code token",
			"code id_token",
			"token id_token",
			"code token id_token",
			"none",
		},
		SubjectTypesSupported:             []string{},
		IdTokenSigningAlgValuesSupported:  []string{},
		ScopesSupported:                   []string{},
		TokenEndpointAuthMethodsSupported: []string{},
		ClaimsSupported:                   []string{},
	}

	resp.WriteAsJson(res)
}
