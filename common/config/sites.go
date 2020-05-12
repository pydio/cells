package config

import (
	"github.com/pkg/errors"
	"github.com/pydio/cells/common/proto/install"
)

func GetDefaultSiteURL() string {
	ss, _ := LoadSites()
	for _, s := range ss {
		return s.GetDefaultBindURL()
	}
	return ""
}

func LoadSites(configOnly ...bool) ([]*install.ProxyConfig, error) {

	var sites []*install.ProxyConfig
	if e := Get("defaults", "sites").Scan(&sites); e != nil {
		return nil, errors.WithMessage(e, "error while parsing sites from config ")
	}
	if len(configOnly) > 0 && configOnly[0] {
		return sites, nil
	}

	if len(sites) == 0 {
		// Bind on 0.0.0.0 as self-signed
		sites = append(sites, &install.ProxyConfig{
			Binds:       []string{"localhost:8080", "0.0.0.0:8080"},
			TLSConfig:   &install.ProxyConfig_SelfSigned{SelfSigned: &install.TLSSelfSigned{}},
			SSLRedirect: true,
		})
	}

	return sites, nil

}

func SaveSites(sites []*install.ProxyConfig, user, msg string) error {

	Set(sites, "defaults", "sites")
	e := Save(user, msg)
	if e != nil {
		return e
	}
	ResetTlsConfigs()
	return nil

}
