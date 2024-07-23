package oauth

import (
	"context"
	"net/http"
	"strings"

	"github.com/ory/fosite"
	"github.com/ory/hydra/v2/client"

	"github.com/pydio/cells/v4/common/config"
	"github.com/pydio/cells/v4/common/utils/configx"
)

var _ client.Manager = new(clientConfigDriver)

// NewClientConfigDriver creates a client.Manager directly reading from configuration
func NewClientConfigDriver(ctx context.Context) client.Manager {
	return &clientConfigDriver{store: config.Get(ctx, "services/pydio.web.oauth/staticClients")}
}

type clientConfigDriver struct {
	store configx.Values
}

func (c clientConfigDriver) AuthenticateClient(ctx context.Context, id string, secret []byte) (*client.Client, error) {
	//TODO implement me
	panic("implement me")
}

func (c clientConfigDriver) GetClient(ctx context.Context, id string) (fosite.Client, error) {
	return c.GetConcreteClient(ctx, id)
}

func (c clientConfigDriver) CreateClient(ctx context.Context, cli *client.Client) error {
	//TODO implement me
	panic("implement me")
}

func (c clientConfigDriver) UpdateClient(ctx context.Context, cli *client.Client) error {
	//TODO implement me
	panic("implement me")
}

func (c clientConfigDriver) DeleteClient(ctx context.Context, id string) error {
	//TODO implement me
	panic("implement me")
}

func (c clientConfigDriver) GetClients(ctx context.Context, filters client.Filter) ([]client.Client, error) {
	//TODO implement me
	panic("implement me")
}

func (c clientConfigDriver) CountClients(ctx context.Context) (int, error) {
	//TODO implement me
	panic("implement me")
}

func (c clientConfigDriver) GetConcreteClient(ctx context.Context, id string) (*client.Client, error) {
	var clis []*client.Client

	err := c.store.Scan(&clis)
	if err != nil {
		return nil, err
	}

	for _, cli := range clis {
		if cli.GetID() == id {

			// Get original request from context
			r, ok := ctx.Value(fosite.RequestContextKey).(*http.Request)
			if ok {
				var ctxCli client.Client
				ctxCli = *cli

				var redirectURIs []string
				for _, redirectURI := range []string(cli.RedirectURIs) {
					redirectURIs = append(redirectURIs, strings.Replace(redirectURI, "#default_bind#", "https://"+r.Host, 1))
				}

				ctxCli.RedirectURIs = redirectURIs
				ctxCli.TokenEndpointAuthMethod = "none"
				return &ctxCli, nil
			}

			return cli, nil
		}
	}

	return nil, fosite.ErrNotFound
}

func (c clientConfigDriver) Authenticate(ctx context.Context, id string, secret []byte) (*client.Client, error) {
	//TODO implement me
	panic("implement me")
}
