/*
 * Copyright (c) 2018. Abstrium SAS <team (at) pydio.com>
 * This file is part of Pydio Cells.
 *
 * Pydio Cells is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * Pydio Cells is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with Pydio Cells.  If not, see <http://www.gnu.org/licenses/>.
 *
 * The latest code can be found at <https://pydio.com>.
 */

package auth

import (
	"context"
	"fmt"
	"net/http"
	"time"

	"github.com/coreos/go-oidc"
	"golang.org/x/oauth2"

	"github.com/pydio/cells/common"
	"github.com/pydio/cells/common/config"
)

type dexclient struct {
	ID     string `json:"id"`
	Secret string `json:"secret"`
}

type dexprovider struct {
	verifier                         *oidc.IDTokenVerifier
	oauth2Config                     oauth2.Config
	passwordCredentialsTokenVerifier *oidc.IDTokenVerifier
}

func RegisterDexProvider(c common.ConfigValues) {
	m := struct {
		Issuer  string       `json:"issuer"`
		Clients []*dexclient `json:"staticClients"`
	}{}

	err := c.Scan(&m)
	if err != nil {
		fmt.Println("Error scanning provider", err)
		return
	}

	externalURL := config.Get("defaults", "url").String("")

	ctx := oidc.ClientContext(context.Background(), &http.Client{
		Transport: &http.Transport{
			TLSClientConfig: config.GetTLSClientConfig("proxy"),
		},
	})

	var oidcProvider *oidc.Provider

	for {
		// Retrieve new provider
		if p, err := oidc.NewProvider(ctx, m.Issuer); err != nil {
			<-time.After(1 * time.Second)
			continue
		} else {
			oidcProvider = p
		}

		break
	}

	// We're first removing all providers that have the same type
	delProviders(func(p Provider) bool {
		return p.GetType() == ProviderTypeDex
	})

	// retrieve verifiers for each client
	for _, c := range m.Clients {
		p := new(dexprovider)

		p.verifier = oidcProvider.Verifier(&oidc.Config{ClientID: c.ID, SkipNonceCheck: true})
		p.oauth2Config = oauth2.Config{
			ClientID:     c.ID,
			ClientSecret: c.Secret,
			Endpoint:     oidcProvider.Endpoint(),
			RedirectURL:  externalURL + "/login/callback",
			Scopes:       []string{oidc.ScopeOpenID, "profile", "email"},
		}
		p.passwordCredentialsTokenVerifier = oidcProvider.Verifier(&oidc.Config{SkipClientIDCheck: true, SkipNonceCheck: true})

		addProvider(p)
	}
}

func (p *dexprovider) GetType() ProviderType {
	return ProviderTypeDex
}

func (p *dexprovider) Verify(ctx context.Context, rawIDToken string) (IDToken, error) {
	var token IDToken

	t, err := p.verifier.Verify(ctx, rawIDToken)
	if err != nil {
		return nil, err
	}

	token = t

	return token, nil
}

func (p *dexprovider) Exchange(ctx context.Context, code string) (*oauth2.Token, error) {
	return p.oauth2Config.Exchange(ctx, code)
}

func (p *dexprovider) PasswordCredentialsToken(ctx context.Context, username string, password string) (*oauth2.Token, error) {
	ctx = context.WithValue(ctx, oauth2.HTTPClient, &http.Client{
		Transport: &http.Transport{
			TLSClientConfig: config.GetTLSClientConfig("proxy"),
		},
	})
	return p.oauth2Config.PasswordCredentialsToken(ctx, username, password)
}

func (p *dexprovider) PasswordCredentialsTokenVerify(ctx context.Context, rawIDToken string) (IDToken, error) {
	var token IDToken

	t, err := p.passwordCredentialsTokenVerifier.Verify(ctx, rawIDToken)
	if err != nil {
		return nil, err
	}

	token = t

	return token, nil
}
