package auth

import (
	"context"
	"github.com/ory/hydra/v2/oauth2/trust"
	"gopkg.in/square/go-jose.v2"
	"time"
)

var _ trust.GrantManager = new(trustDriver)

type trustDriver struct{}

func (t trustDriver) CreateGrant(ctx context.Context, g trust.Grant, publicKey jose.JSONWebKey) error {
	//TODO implement me
	panic("implement me")
}

func (t trustDriver) GetConcreteGrant(ctx context.Context, id string) (trust.Grant, error) {
	//TODO implement me
	panic("implement me")
}

func (t trustDriver) DeleteGrant(ctx context.Context, id string) error {
	//TODO implement me
	panic("implement me")
}

func (t trustDriver) GetGrants(ctx context.Context, limit, offset int, optionalIssuer string) ([]trust.Grant, error) {
	//TODO implement me
	panic("implement me")
}

func (t trustDriver) CountGrants(ctx context.Context) (int, error) {
	//TODO implement me
	panic("implement me")
}

func (t trustDriver) FlushInactiveGrants(ctx context.Context, notAfter time.Time, limit int, batchSize int) error {
	//TODO implement me
	panic("implement me")
}
