package migrations

import (
	"net/url"

	json "github.com/pydio/cells/x/jsonx"

	"github.com/hashicorp/go-version"
	"github.com/pydio/cells/common/caddy"
	"github.com/pydio/cells/x/configx"
)

func init() {
	v, _ := version.NewVersion("2.1.99")
	add(v, getMigration(updateDatabaseDefault))
	add(v, getMigration(updateSites))
	add(v, getMigration(updateSourceKeys))
}

func updateDatabaseDefault(config configx.Values) error {
	def := config.Val("defaults/database")

	if v := def.StringMap(); len(v) > 0 {
		return nil
	}

	if v := def.String(); v != "" {
		err := def.Set(configx.Reference("databases/" + v))
		return err
	}

	return nil
}

func updateSites(config configx.Values) error {

	urlInternal := config.Val("defaults", "urlInternal").String()
	urlExternal := config.Val("defaults", "url").String()
	// Do not store an empty site
	if urlInternal == "" && urlExternal == "" {
		return nil
	}

	site := configx.New()
	if urlInternal != "" {
		u, err := url.Parse(urlInternal)
		if err != nil {
			return err
		}

		site.Val("Binds").Set([]string{u.Host})
	}
	if urlExternal != "" {
		site.Val("ReverseProxyURL").Set(urlExternal)
	}

	proxy := config.Val("cert", "proxy")
	ssl := proxy.Val("ssl").Bool()
	self := proxy.Val("self").Bool()
	if ssl {
		autoCA := proxy.Val("autoCA").String()
		if self || autoCA != "" {
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

	return nil
}

func updateSourceKeys(config configx.Values) error {

	// fmt.Println("[Configs] Upgrading source keys")
	asSlice := func(s string) (sl []string, er error) {
		er = json.Unmarshal([]byte(s), &sl)
		return
	}

	indexSources := config.Val("services", "pydio.grpc.data.index", "sources")
	if sl, er := asSlice(indexSources.String()); er == nil {
		indexSources.Set(sl)
	}

	objectSources := config.Val("services", "pydio.grpc.data.objects", "sources")
	if sl, er := asSlice(objectSources.String()); er == nil {
		objectSources.Set(sl)
	}

	syncSources := config.Val("services", "pydio.grpc.data.sync", "sources")
	if sl, er := asSlice(syncSources.String()); er == nil {
		syncSources.Set(sl)
	}

	return nil
}
