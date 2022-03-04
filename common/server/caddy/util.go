package caddy

import (
	"net/url"
	"strings"

	"google.golang.org/protobuf/proto"

	"github.com/pydio/cells/v4/common"
	"github.com/pydio/cells/v4/common/crypto/providers"
	"github.com/pydio/cells/v4/common/proto/install"
	"github.com/pydio/cells/v4/common/utils/uuid"
)

type SiteConf struct {
	*install.ProxyConfig
	// Parsed values from proto oneOf
	TLS     string
	TLSCert string
	TLSKey  string
	// Parsed External host if any
	ExternalHost string
	// Custom Root for this site
	WebRoot string
}

// Redirects compute required redirects if SSLRedirect is set
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
		targetHost := host
		if host == "0.0.0.0" {
			targetHost = "{host}"
		}
		if port == "" {
			rr["http://"+host] = "https://" + targetHost
		} else if port == "80" {
			continue
		} else {
			rr["http://"+host] = "https://" + targetHost + ":" + port
		}
	}

	return rr
}

// SitesToCaddyConfigs computes all SiteConf from all *install.ProxyConfig by analyzing
// TLSConfig, ReverseProxyURL and Maintenance fields values
func SitesToCaddyConfigs(sites []*install.ProxyConfig) (caddySites []SiteConf, er error) {
	for _, proxyConfig := range sites {
		if bc, er := computeSiteConf(proxyConfig); er == nil {
			caddySites = append(caddySites, bc)
		} else {
			return caddySites, er
		}
	}
	return caddySites, nil
}

func computeSiteConf(pc *install.ProxyConfig) (SiteConf, error) {
	bc := SiteConf{
		ProxyConfig: proto.Clone(pc).(*install.ProxyConfig),
	}
	if pc.ReverseProxyURL != "" {
		if u, e := url.Parse(pc.ReverseProxyURL); e == nil {
			bc.ExternalHost = u.Host
		}
	}
	if bc.TLSConfig == nil {
		for i, b := range bc.Binds {
			bc.Binds[i] = "http://" + b
		}
	} else {
		for i, b := range bc.Binds {
			bc.Binds[i] = strings.Replace(b, "0.0.0.0", "", 1)
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
			// todo v4 : is there something to do with AcceptEULA flag ? Was caddytls.Agreed = true
			caUrl := common.DefaultCaUrl
			if v.LetsEncrypt.StagingCA {
				caUrl = common.DefaultCaStagingUrl
			}
			bc.TLS = v.LetsEncrypt.Email + ` {
				ca ` + caUrl + `
			}`
		}
	}
	bc.WebRoot = uuid.New()
	return bc, nil
}
