package auth

import (
	"context"
	"github.com/ory/fosite"
	"github.com/ory/hydra/v2/client"
	"github.com/pydio/cells/v4/common/utils/configx"
	"net/http"
	"strings"
)

var _ client.Manager = new(clientDriver)

type clientDriver struct {
	store configx.Values
}

func (c clientDriver) AuthenticateClient(ctx context.Context, id string, secret []byte) (*client.Client, error) {
	//TODO implement me
	panic("implement me")
}

func (c clientDriver) GetClient(ctx context.Context, id string) (fosite.Client, error) {
	return c.GetConcreteClient(ctx, id)
}

func (c clientDriver) CreateClient(ctx context.Context, cli *client.Client) error {
	//TODO implement me
	panic("implement me")
}

func (c clientDriver) UpdateClient(ctx context.Context, cli *client.Client) error {
	//TODO implement me
	panic("implement me")
}

func (c clientDriver) DeleteClient(ctx context.Context, id string) error {
	//TODO implement me
	panic("implement me")
}

func (c clientDriver) GetClients(ctx context.Context, filters client.Filter) ([]client.Client, error) {
	//TODO implement me
	panic("implement me")
}

func (c clientDriver) CountClients(ctx context.Context) (int, error) {
	//TODO implement me
	panic("implement me")
}

func (c clientDriver) GetConcreteClient(ctx context.Context, id string) (*client.Client, error) {
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

func (c clientDriver) Authenticate(ctx context.Context, id string, secret []byte) (*client.Client, error) {
	//TODO implement me
	panic("implement me")
}
