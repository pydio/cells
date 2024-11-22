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

package migrations

import (
	"net/url"
	"path"
	"strings"

	"github.com/hashicorp/go-version"

	"github.com/pydio/cells/v5/common"
	"github.com/pydio/cells/v5/common/utils/configx"
	json "github.com/pydio/cells/v5/common/utils/jsonx"
)

func init() {
	v, _ := version.NewVersion("2.1.99")
	add(v, getMigration(updateDatabaseDefault))
	add(v, getMigration(updateStaticClients))
	add(v, getMigration(updateSites))
	add(v, getMigration(updateSourceKeys))
}

func updateStaticClients(config configx.Values) error {

	oauthSrv := common.ServiceWebNamespace_ + common.ServiceOAuth
	external := config.Val("defaults/url").String()

	if external == "" {
		return nil
	}

	config.Val("services/" + oauthSrv + "/issuer").Del()

	configSliceKeys := map[string][]string{
		"services/" + oauthSrv + "/insecureRedirects": []string{"#insecure_binds...#/auth/callback"},
	}

	for p, def := range configSliceKeys {
		val := config.Val(p)

		var data []string
		if val.Scan(&data); !stringSliceEqual(data, def) {
			// fmt.Printf("[Configs] Upgrading: forcing default config %s to %v\n", p, def)
			d, f := path.Split(p)
			config.Val(d, f).Set(def)
		}
	}

	oAuthFrontendConfig := map[string]interface{}{
		"client_id":                 "cells-frontend",
		"client_name":               "CellsFrontend Application",
		"grant_types":               []string{"authorization_code", "refresh_token"},
		"redirect_uris":             []string{"#default_bind#/auth/callback"},
		"post_logout_redirect_uris": []string{"#default_bind#/auth/logout"},
		"response_types":            []string{"code", "token", "id_token"},
		"scope":                     "openid email profile pydio offline",
	}

	// Special case for srvUrl/oauth2/oob url
	statics := config.Val("services/" + oauthSrv + "/staticClients")
	var data []map[string]interface{}
	if err := statics.Scan(&data); err == nil {
		var saveStatics bool
		var addCellsFrontend = true
		for _, static := range data {
			if clientID, ok := static["client_id"].(string); addCellsFrontend && ok {
				if clientID == "cells-frontend" {
					addCellsFrontend = false
				}
			}

			for _, n := range []string{"redirect_uris", "post_logout_redirect_uris"} {
				if redirs, ok := static[n].([]interface{}); ok {
					var newRedirs []string
					for _, redir := range redirs {
						redirStr := redir.(string)

						if strings.HasPrefix(redirStr, external) {
							if strings.HasSuffix(redirStr, "/oauth2/oob") {
								newRedirs = append(newRedirs, "#binds...#"+strings.TrimPrefix(redirStr, external))
								saveStatics = true
							} else {
								newRedirs = append(newRedirs, "#default_bind#"+strings.TrimPrefix(redirStr, external))
								saveStatics = true
							}
						} else {
							newRedirs = append(newRedirs, redirStr)
						}
					}
					static[n] = newRedirs
				}
			}
		}
		if addCellsFrontend {
			data = append([]map[string]interface{}{oAuthFrontendConfig}, data...)
			saveStatics = true
		}
		if saveStatics {
			// fmt.Println("[Configs] Upgrading: updating staticClients")
			config.Val("services/" + oauthSrv + "/staticClients").Set(data)
		}
	}

	return nil
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
					"StagingCA":  caUrl == common.DefaultCaStagingUrl,
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
