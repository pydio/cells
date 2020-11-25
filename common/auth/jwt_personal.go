package auth

import (
	"context"

	"gopkg.in/square/go-jose.v2/jwt"

	defaults "github.com/pydio/cells/common/micro"
	"github.com/pydio/cells/common/proto/auth"
	json "github.com/pydio/cells/x/jsonx"
)

type patProvider struct {
	service string
}

func RegisterPersonalAccessTokenProvider(service string) {
	p := new(patProvider)

	p.service = service

	addProvider(p)
}

func (p *patProvider) GetType() ProviderType {
	return ProviderTypePAT
}

func (p *patProvider) Verify(ctx context.Context, s string) (IDToken, error) {

	// Quick check if it has been tampered
	_, e := jwt.ParseSigned(s)
	if e != nil {
		return nil, e
	}

	cli := auth.NewAuthTokenVerifierClient(p.service, defaults.NewClient())
	resp, e := cli.Verify(ctx, &auth.VerifyTokenRequest{Token: s})
	if e != nil {
		return nil, e
	}
	token := new(grpctoken)

	if err := json.Unmarshal(resp.GetData(), &token.claims); err != nil {
		return nil, err
	}

	return token, nil

}
