package auth

import (
	"context"
	"log"
	"net/http"

	"github.com/dexidp/dex/connector"
	"github.com/golang/protobuf/proto"
	"github.com/micro/go-micro/errors"
	"github.com/sirupsen/logrus"

	"github.com/pydio/cells/common"
	"github.com/pydio/cells/common/config"
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

	var m []struct {
		ID   string `"json:id"`
		Name string `"json:id"`
		Type string `"json:type"`
	}
	if err := config.Values("services", common.SERVICE_GRPC_NAMESPACE_+common.SERVICE_AUTH, "dex").Array("connectors").Scan(&m); err != nil {
		log.Fatal("Wrong configuration ", err)
	}

	for _, mm := range m {
		RegisterConnector(mm.ID, mm.Name, mm.Type, nil)
	}
}

type pydioconfig struct{}

func (c *pydioconfig) Open(logrus.FieldLogger) (connector.Connector, error) {
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
