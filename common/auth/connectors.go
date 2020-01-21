package auth

import (
	"context"
	"net/http"

	"github.com/dexidp/dex/connector"
	dlog "github.com/dexidp/dex/pkg/log"
	"github.com/golang/protobuf/proto"
	"github.com/micro/go-micro/errors"

	"github.com/pydio/cells/common"
	defaults "github.com/pydio/cells/common/micro"
	"github.com/pydio/cells/common/proto/idm"
)

var (
	_ connector.PasswordConnector = (*pydioconnector)(nil)
)

func init() {
	RegisterConnectorType("pydio", func(_ proto.Message) (Opener, error) {
		return new(pydioconfig), nil
	})
}

type pydioconfig struct{}

func (c *pydioconfig) Open(string, dlog.Logger) (connector.Connector, error) {
	return &pydioconnector{}, nil
}

type pydioconnector struct{}

func (p *pydioconnector) Prompt() string {
	return "pydio"
}

func (p *pydioconnector) Login(ctx context.Context, s connector.Scopes, username, password string) (connector.Identity, bool, error) {
	// Check the user has successfully logged in
	c := idm.NewUserServiceClient(common.SERVICE_GRPC_NAMESPACE_+common.SERVICE_USER, defaults.NewClient())
	resp, err := c.BindUser(ctx, &idm.BindUserRequest{UserName: username, Password: password})
	if err != nil {
		errr := errors.Parse(err.Error())
		if errr.Code == http.StatusForbidden {
			return connector.Identity{}, false, nil
		}

		return connector.Identity{}, false, err
	}

	user := resp.GetUser()
	return connector.Identity{
		UserID:        user.GetUuid(),
		Username:      user.GetLogin(),
		Email:         user.GetAttributes()["email"],
		EmailVerified: true,
		Groups:        []string{},
	}, true, nil
}
