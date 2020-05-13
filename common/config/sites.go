package config

import (
	"github.com/pkg/errors"
	"github.com/pydio/cells/common/proto/install"
)

var (
	DefaultBindingSite = &install.ProxyConfig{
		Binds:       []string{"0.0.0.0:8080"},
		TLSConfig:   &install.ProxyConfig_SelfSigned{SelfSigned: &install.TLSSelfSigned{}},
		SSLRedirect: true,
	}
)

// GetDefaultSiteURL returns the first available bindURL of all available sites
func GetDefaultSiteURL() string {
	ss, _ := LoadSites()
	for _, s := range ss {
		return s.GetDefaultBindURL()
	}
	return ""
}

// GetSitesAllowedHostnames returns a map of hostname => url for all sites.
// TODO : this function could switch to a list of specific authorized hostnames
func GetSitesAllowedHostnames() map[string]string {
	ss, _ := LoadSites()
	hh := make(map[string]string)
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
	if e := Get("defaults", "sites").Scan(&sites); e != nil {
		return nil, errors.WithMessage(e, "error while parsing sites from config ")
	}
	if len(configOnly) > 0 && configOnly[0] {
		return sites, nil
	}

	if len(sites) == 0 {
		sites = append(sites, DefaultBindingSite)
	}

	return sites, nil

}

// SaveSites saves a list of sites inside configuration
func SaveSites(sites []*install.ProxyConfig, user, msg string) error {

	Set(sites, "defaults", "sites")
	e := Save(user, msg)
	if e != nil {
		return e
	}
	ResetTlsConfigs()
	return nil

}
