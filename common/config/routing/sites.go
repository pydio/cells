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

package routing

import (
	"context"
	"net/url"

	"github.com/pkg/errors"

	"github.com/pydio/cells/v4/common"
	"github.com/pydio/cells/v4/common/config"
	"github.com/pydio/cells/v4/common/proto/install"
	"github.com/pydio/cells/v4/common/runtime"
	"github.com/pydio/cells/v4/common/service/context/metadata"
	"github.com/pydio/cells/v4/common/utils/configx"
	"github.com/pydio/cells/v4/common/utils/slug"
)

var (
	defaultAlwaysOverride = false
	DefaultBindingSite    = &install.ProxyConfig{
		Binds:       []string{"0.0.0.0:" + runtime.DefaultBindingSitePort},
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

// SiteFromContext lookups for siteHash in the context
func SiteFromContext(ctx context.Context) (*install.ProxyConfig, bool) {
	meta, ok := metadata.FromContextRead(ctx)
	if !ok {
		return nil, false
	}
	siteHash, ok2 := meta[common.XPydioSiteHash]
	if !ok2 || len(siteHash) == 0 {
		return nil, false
	}
	ss, _ := LoadSites()
	var found *install.ProxyConfig
	for _, site := range ss {
		if site.Hash() == siteHash {
			found = site
			break
		}
	}
	return found, found != nil
}

// LoadSites returns all sites defined by order of preference :
// - ENV VARS
// - YAML CONFIG
// - INTERNAL CONFIG
// - If none is found, returns a default value
// If configOnly is set to true, will only return the ones saved in configs
func LoadSites(configOnly ...bool) ([]*install.ProxyConfig, error) {

	var sites []*install.ProxyConfig
	if e := config.Get(configx.FormatPath("defaults", "sites")).Scan(&sites); e != nil {
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

	if e := config.Set(sites, configx.FormatPath("defaults", "sites")); e != nil {
		return e
	}
	if e := config.Save(user, msg); e != nil {
		return e
	}
	return nil

}

// GetPublicBaseUri returns the default public uri
func GetPublicBaseUri() string {
	return "/" + slug.Make(config.Get(configx.FormatPath("frontend", "plugin", "action.share", "LINK_PUBLIC_URI_BASE")).Default("public").String())
}

// GetPublicBaseDavSegment returns the segment used to exposed minisites through DAV
func GetPublicBaseDavSegment() string {
	return slug.Make(config.Get(configx.FormatPath("frontend", "plugin", "action.share", "LINK_PUBLIC_URI_DAV_SEGMENT")).Default("dav").String())
}

func EnvOverrideDefaultBind() bool {
	bind := runtime.GetString(runtime.KeySiteBind)
	if bind == "" {
		return false
	}
	defaultAlwaysOverride = true
	DefaultBindingSite.Binds = []string{bind}
	if ext := runtime.GetString(runtime.KeySiteExternal); ext != "" {
		DefaultBindingSite.ReverseProxyURL = ext
	}
	if noTls := runtime.GetBool(runtime.KeySiteNoTLS); noTls {
		DefaultBindingSite.TLSConfig = nil
	} else if tlsCert, tlsKey := runtime.GetString(runtime.KeySiteTlsCertFile), runtime.GetString(runtime.KeySiteTlsKeyFile); tlsCert != "" && tlsKey != "" {
		DefaultBindingSite.TLSConfig = &install.ProxyConfig_Certificate{Certificate: &install.TLSCertificate{
			CertFile: tlsCert,
			KeyFile:  tlsKey,
		}}
	} else if leEmail, leAgree := runtime.GetString(runtime.KeySiteLetsEncryptEmail), runtime.GetBool(runtime.KeySiteLetsEncryptAgree); leEmail != "" && leAgree {
		le := &install.TLSLetsEncrypt{
			Email:      leEmail,
			AcceptEULA: leAgree,
		}
		if runtime.GetBool(runtime.KeySiteLetsEncryptStaging) {
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
	flags = append(flags, "--"+runtime.KeySiteBind, runtime.GetString(runtime.KeySiteBind))
	if ext := runtime.GetString(runtime.KeySiteExternal); ext != "" {
		flags = append(flags, "--"+runtime.KeySiteExternal, ext)
	}
	if noTls := runtime.GetBool(runtime.KeySiteNoTLS); noTls {
		flags = append(flags, "--"+runtime.KeySiteNoTLS)
	} else if tlsCert, tlsKey := runtime.GetString(runtime.KeySiteTlsCertFile), runtime.GetString(runtime.KeySiteTlsKeyFile); tlsCert != "" && tlsKey != "" {
		flags = append(flags, "--"+runtime.KeySiteTlsCertFile, tlsCert)
		flags = append(flags, "--"+runtime.KeySiteTlsKeyFile, tlsKey)
	} else if leEmail, leAgree := runtime.GetString(runtime.KeySiteLetsEncryptEmail), runtime.GetBool(runtime.KeySiteLetsEncryptAgree); leEmail != "" && leAgree {
		flags = append(flags, "--"+runtime.KeySiteLetsEncryptEmail, leEmail)
		flags = append(flags, "--"+runtime.KeySiteLetsEncryptAgree)
		if runtime.GetBool(runtime.KeySiteLetsEncryptStaging) {
			flags = append(flags, "--"+runtime.KeySiteLetsEncryptStaging)
		}
	}
	return
}
