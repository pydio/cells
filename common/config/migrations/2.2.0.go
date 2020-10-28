package migrations

import (
	"net/url"

	"github.com/hashicorp/go-version"
	"github.com/pydio/cells/common/caddy"
	"github.com/pydio/cells/x/configx"
)

func init() {
	v, _ := version.NewVersion("2.2.0-dev")
	add(v, getMigration(updateDatabaseDefault))
	add(v, getMigration(updateSites))
}

func updateDatabaseDefault(config configx.Values) (bool, error) {
	def := config.Val("defaults/database")

	if v := def.StringMap(); len(v) > 0 {
		return false, nil
	}

	if v := def.String(); v != "" {
		err := def.Set(configx.Reference("databases/" + v))
		return true, err
	}

	return false, nil
}

func updateSites(config configx.Values) (bool, error) {

	site := configx.New()
	urlInternal := config.Val("defaults", "urlInternal").String()
	if urlInternal != "" {
		u, err := url.Parse(urlInternal)
		if err != nil {
			return false, err
		}

		site.Val("Binds").Set([]string{u.Host})
	}

	urlExternal := config.Val("defaults", "url").String()
	if urlExternal != "" {
		site.Val("ReverseProxyURL").Set(urlExternal)
	}

	proxy := config.Val("cert", "proxy")
	ssl := proxy.Val("ssl").Bool()
	if ssl {
		autoCA := proxy.Val("autoCA").String()
		if autoCA != "" {
			//Self-Signed
			site.Val("TLSConfig", "SelfSigned").Set(map[string]string{})
		} else {
			caUrl := proxy.Val("caUrl").String()
			if caUrl != "" {
				// Lets Encrypt
				site.Val("TLSConfig", "LetsEncrypt").Set(map[string]interface{}{
					"Email":      proxy.Val("email").String(),
					"AcceptEULA": true,
					"StagingCA":  caUrl == caddy.DefaultCaStagingUrl,
				})
			} else {
				// Manual certificates
				certFile := proxy.Val("certFile").String()
				keyFile := proxy.Val("keyFile").String()

				site.Val("TLSConfig", "Certificate").Set(map[string]string{
					"CertFile": certFile,
					"KeyFile":  keyFile,
				})
			}

		}
	}

	config.Val("defaults/sites").Set([]interface{}{
		site.Map(),
	})

	config.Val("defaults/url").Del()
	config.Val("defaults/urlInternal").Del()
	config.Val("cert").Del()

	return false, nil
}
