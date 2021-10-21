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

package config

import (
	"net/url"

	"github.com/spf13/viper"

	"github.com/pkg/errors"
	"github.com/pydio/cells/common/proto/install"
	"github.com/pydio/cells/x/configx"
)

var (
	defaultAlwaysOverride = false
	DefaultBindingSite    = &install.ProxyConfig{
		Binds:       []string{"0.0.0.0:8080"},
		TLSConfig:   &install.ProxyConfig_SelfSigned{SelfSigned: &install.TLSSelfSigned{}},
		SSLRedirect: false,
	}
)

// GetDefaultSiteURL returns the first available bindURL of all available sites
func GetDefaultSiteURL(sites ...*install.ProxyConfig) string {
	if len(sites) == 0 {
		sites, _ = LoadSites()
	}
	// Try first to find a declared external URL
	for _, s := range sites {
		if s.ReverseProxyURL != "" {
			return s.ReverseProxyURL
		}
	}
	// Else return default Bind URL
	for _, s := range sites {
		return s.GetDefaultBindURL()
	}
	return ""
}

// GetSitesAllowedURLs returns a map of hostname => url for all sites.
// TODO : this function could switch to a list of specific authorized hostnames
func GetSitesAllowedURLs() map[string]*url.URL {
	ss, _ := LoadSites()
	hh := make(map[string]*url.URL)
	for _, site := range ss {
		for k, v := range site.GetExternalUrls() {
			hh[k] = v
		}
	}
	return hh
}

// LoadSites returns all sites defined by order of preference :
// - ENV VARS
// - YAML CONFIG
// - INTERNAL CONFIG
// - If none is found, returns a default value
// If configOnly is set to true, will only return the ones saved in configs
func LoadSites(configOnly ...bool) ([]*install.ProxyConfig, error) {

	var sites []*install.ProxyConfig
	if e := Get(configx.FormatPath("defaults", "sites")).Scan(&sites); e != nil {
		return nil, errors.WithMessage(e, "error while parsing sites from config ")
	}
	if len(configOnly) > 0 && configOnly[0] {
		return sites, nil
	} else if defaultAlwaysOverride {
		// If we did not require only the configs (for management),
		// defaultAlwaysOverride skips all configs and just returns DefaultBindingSite
		return []*install.ProxyConfig{DefaultBindingSite}, nil
	}

	if len(sites) == 0 {
		sites = append(sites, DefaultBindingSite)
	}

	return sites, nil

}

// SaveSites saves a list of sites inside configuration
func SaveSites(sites []*install.ProxyConfig, user, msg string) error {

	Set(sites, configx.FormatPath("defaults", "sites"))
	e := Save(user, msg)
	if e != nil {
		return e
	}
	//ResetTlsConfigs()
	return nil

}

// GetPublicBaseUri returns the default public uri
func GetPublicBaseUri() string {
	return "/public"
}

func EnvOverrideDefaultBind() bool {
	bind := viper.GetString("bind")
	if bind == "" {
		return false
	}
	defaultAlwaysOverride = true
	DefaultBindingSite.Binds = []string{bind}
	if ext := viper.GetString("external"); ext != "" {
		DefaultBindingSite.ReverseProxyURL = ext
	}
	if noTls := viper.GetBool("no_tls"); noTls {
		DefaultBindingSite.TLSConfig = nil
	} else if tlsCert, tlsKey := viper.GetString("tls_cert_file"), viper.GetString("tls_cert_key"); tlsCert != "" && tlsKey != "" {
		DefaultBindingSite.TLSConfig = &install.ProxyConfig_Certificate{Certificate: &install.TLSCertificate{
			CertFile: tlsCert,
			KeyFile:  tlsKey,
		}}
	} else if leEmail, leAgree := viper.GetString("le_email"), viper.GetBool("le_agree"); leEmail != "" && leAgree {
		le := &install.TLSLetsEncrypt{
			Email:      leEmail,
			AcceptEULA: leAgree,
		}
		if viper.GetBool("le_staging") {
			le.StagingCA = true
		}
		DefaultBindingSite.TLSConfig = &install.ProxyConfig_LetsEncrypt{LetsEncrypt: le}
	}
	return true
}

func DefaultBindOverrideToFlags() (flags []string) {
	if !defaultAlwaysOverride {
		return
	}
	flags = append(flags, "--bind", viper.GetString("bind"))
	if ext := viper.GetString("external"); ext != "" {
		flags = append(flags, "--external", ext)
	}
	if noTls := viper.GetBool("no_tls"); noTls {
		flags = append(flags, "--no_tls")
	} else if tlsCert, tlsKey := viper.GetString("tls_cert_file"), viper.GetString("tls_cert_key"); tlsCert != "" && tlsKey != "" {
		flags = append(flags, "--tls_cert_file", tlsCert)
		flags = append(flags, "--tls_key_file", tlsKey)
	} else if leEmail, leAgree := viper.GetString("le_email"), viper.GetBool("le_agree"); leEmail != "" && leAgree {
		flags = append(flags, "--le_email", leEmail)
		flags = append(flags, "--le_agree")
		if viper.GetBool("le_staging") {
			flags = append(flags, "--le_staging")
		}
	}
	return
}
