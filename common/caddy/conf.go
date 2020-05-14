package caddy

import (
	"net/url"
	"strings"

	"github.com/mholt/caddy/caddytls"
	"github.com/pydio/cells/common/config"

	"github.com/pydio/cells/common/crypto/providers"
	"github.com/pydio/cells/common/proto/install"
)

type SiteConf struct {
	*install.ProxyConfig
	// Parsed values from proto oneOf
	TLS     string
	TLSCert string
	TLSKey  string
	// Parsed External host if any
	ExternalHost string
}

func (s SiteConf) Redirects() map[string]string {
	rr := make(map[string]string)
	for _, bind := range s.GetBinds() {
		parts := strings.Split(bind, ":")
		var host, port string
		if len(parts) == 2 {
			host = parts[0]
			port = parts[1]
			if host == "" {
				continue
			}
		} else {
			host = bind
		}
		if port == "" {
			rr["http://"+host] = "https://" + host
		} else if port == "80" {
			continue
		} else {
			rr["http://"+host] = "https://" + host + ":" + port
		}
	}

	return rr
}

func SiteConfFromProxyConfig(pc *install.ProxyConfig) (SiteConf, error) {
	bc := SiteConf{ProxyConfig: pc}
	if pc.ReverseProxyURL != "" {
		if u, e := url.Parse(pc.ReverseProxyURL); e == nil {
			bc.ExternalHost = u.Hostname()
		}
	}
	switch v := bc.TLSConfig.(type) {
	case *install.ProxyConfig_Certificate, *install.ProxyConfig_SelfSigned:
		certFile, keyFile, err := providers.LoadCertificates(pc)
		if err != nil {
			return bc, err
		}
		bc.TLSCert = certFile
		bc.TLSKey = keyFile
	case *install.ProxyConfig_LetsEncrypt:
		bc.TLS = v.LetsEncrypt.Email
	}
	return bc, nil
}

func SitesToCaddyConfigs(sites []*install.ProxyConfig) (caddySites []SiteConf, er error) {
	for _, proxyConfig := range sites {
		if bc, er := SiteConfFromProxyConfig(proxyConfig); er == nil {
			caddySites = append(caddySites, bc)
			if proxyConfig.HasTLS() && proxyConfig.GetLetsEncrypt() != nil {
				le := proxyConfig.GetLetsEncrypt()
				if le.AcceptEULA {
					caddytls.Agreed = true
				}
				if le.StagingCA {
					caddytls.DefaultCAUrl = config.DefaultCaStagingUrl
				} else {
					caddytls.DefaultCAUrl = config.DefaultCaUrl
				}
			}
		} else {
			return caddySites, er
		}
	}
	return caddySites, nil
}
