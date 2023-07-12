/*
 * Copyright (c) 2019-2021. Abstrium SAS <team (at) pydio.com>
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
	"sync"

	hconf "github.com/ory/hydra/v2/driver/config"
	hconfx "github.com/ory/x/configx"
	"github.com/ory/x/logrusx"
	"github.com/pydio/cells/v4/common/config"
	"github.com/pydio/cells/v4/common/utils/configx"
)

type ConfigurationProvider interface {

	// GetProvider returns an instanciated hconf.Provider struct
	GetProvider() *hconf.Provider

	// Clients lists all defined clients
	Clients() configx.Scanner

	// Connectors lists all defined connectors
	Connectors() configx.Scanner
}

var (
	confMap     map[string]ConfigurationProvider
	confMutex   *sync.Mutex
	defaultConf ConfigurationProvider

	onConfigurationInits []func(scanner configx.Scanner)
	confInit             bool
)

func init() {
	confMap = make(map[string]ConfigurationProvider)
	confMutex = &sync.Mutex{}
}

func InitConfiguration(values configx.Values) {
	confMutex.Lock()
	defer confMutex.Unlock()
	initConnector := false
	for _, rootUrl := range config.GetSitesAllowedURLs() {
		p := NewProvider(rootUrl.String(), values)
		if !initConnector {
			// Use first conf as default
			defaultConf = p
			for _, onConfigurationInit := range onConfigurationInits {
				onConfigurationInit(p.Connectors())
			}
			initConnector = true
		}
		confMap[rootUrl.Host] = p
	}
	confInit = true
}

func OnConfigurationInit(f func(scanner configx.Scanner)) {
	onConfigurationInits = append(onConfigurationInits, f)

	if confInit {
		confMutex.Lock()
		defer confMutex.Unlock()
		for _, provider := range confMap {
			f(provider.Connectors())
			break
		}
	}
}

func GetConfigurationProvider(hostname ...string) ConfigurationProvider {
	confMutex.Lock()
	defer confMutex.Unlock()

	if len(hostname) > 0 {
		if c, ok := confMap[hostname[0]]; ok {
			return c
		}
	}

	return defaultConf
}

func NewProvider(rootURL string, values configx.Values) ConfigurationProvider {

	val := configx.New()
	if secret := values.Val("secret").String(); secret != "" {
		_ = val.Val(hconf.KeyGetSystemSecret).Set([]string{values.Val("secret").String()})
	}
	_ = val.Val(hconf.KeyPublicURL).Set(rootURL + "/oidc")
	_ = val.Val(hconf.KeyIssuerURL).Set(rootURL + "/oidc")
	_ = val.Val(hconf.KeyLoginURL).Set(rootURL + "/oauth2/login")
	_ = val.Val(hconf.KeyLogoutURL).Set(rootURL + "/oauth2/logout")
	_ = val.Val(hconf.KeyConsentURL).Set(rootURL + "/oauth2/consent")
	_ = val.Val(hconf.KeyErrorURL).Set(rootURL + "/oauth2/fallbacks/error")
	_ = val.Val(hconf.KeyLogoutRedirectURL).Set(rootURL + "/oauth2/logout/callback")

	_ = val.Val(hconf.KeyAccessTokenStrategy).Set(values.Val("accessTokenStrategy").Default("opaque").String())
	_ = val.Val(hconf.KeyConsentRequestMaxAge).Set(values.Val("consentRequestMaxAge").Default("30m").String())
	_ = val.Val(hconf.KeyAccessTokenLifespan).Set(values.Val("accessTokenLifespan").Default("10m").String())
	_ = val.Val(hconf.KeyRefreshTokenLifespan).Set(values.Val("refreshTokenLifespan").Default("1440h").String())
	_ = val.Val(hconf.KeyIDTokenLifespan).Set(values.Val("idTokenLifespan").Default("1h").String())
	_ = val.Val(hconf.KeyAuthCodeLifespan).Set(values.Val("authCodeLifespan").Default("10m").String())

	_ = val.Val(hconf.KeyLogLevel).Set("trace")
	_ = val.Val("log.leak_sensitive_values").Set(true)

	rr := values.Val("insecureRedirects").StringArray()
	sites, _ := config.LoadSites()
	var out []string
	for _, r := range rr {
		out = append(out, varsFromStr(r, sites)...)
	}
	if len(out) > 0 {
		_ = val.Val("dangerous-allow-insecure-redirect-urls").Set(out)
	}

	provider, err := hconf.New(context.TODO(), logrusx.New("test", "test"), hconfx.WithValues(val.Map()))
	if err != nil {
		fmt.Println("We have an error here", err)
	}
	return &configurationProvider{
		defaultProvider: &defaultProvider{provider},
		v:               values,
	}
}

type configurationProvider struct {
	defaultProvider hconf.Provider
	// values
	v configx.Values
}

type defaultProvider struct {
	*hconf.DefaultProvider
}

func (v *configurationProvider) GetProvider() *hconf.Provider {
	return &v.defaultProvider
}

func (v *configurationProvider) Clients() configx.Scanner {
	return v.v.Val("staticClients")
}

func (v *configurationProvider) Connectors() configx.Scanner {
	return v.v.Val("connectors")
}

func (d *defaultProvider) Config() *hconf.DefaultProvider {
	return d.DefaultProvider
}
