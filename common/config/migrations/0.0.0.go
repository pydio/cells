package migrations

import (
	"fmt"
	"path"
	"strings"

	"github.com/hashicorp/go-version"
	"github.com/ory/hydra/x"
	"github.com/pydio/cells/common"
	"github.com/pydio/cells/x/configx"
)

func init() {
	// Version 0.0.0 is always run
	initialVersion, _ := version.NewVersion("0.0.0")
	add(initialVersion, getMigration(setDefaultConfig))
	add(initialVersion, getMigration(forceDefaultConfig))

	// add(&migrations.Migration{TargetVersion: common.Version(), Up: getMigration(updateLeCaURL)})
}

func setDefaultConfig(config configx.Values) (bool, error) {
	var save bool

	oauthSrv := common.SERVICE_WEB_NAMESPACE_ + common.SERVICE_OAUTH
	secret, err := x.GenerateSecret(32)
	if err != nil {
		return false, err
	}
	var syncRedirects = []string{
		"http://localhost:3000/servers/callback", // SYNC UX DEBUG PORT
		"http://localhost:[3636-3666]/servers/callback",
	}
	external := config.Val("defaults/url").String()
	oAuthFrontendConfig := map[string]interface{}{
		"client_id":                 "cells-frontend",
		"client_name":               "CellsFrontend Application",
		"grant_types":               []string{"authorization_code", "refresh_token"},
		"redirect_uris":             []string{external + "/auth/callback"},
		"post_logout_redirect_uris": []string{external + "/auth/logout"},
		"response_types":            []string{"code", "token", "id_token"},
		"scope":                     "openid email profile pydio offline",
	}
	oAuthSyncConfig := map[string]interface{}{
		"client_id":      "cells-sync",
		"client_name":    "CellsSync Application",
		"grant_types":    []string{"authorization_code", "refresh_token"},
		"redirect_uris":  syncRedirects,
		"response_types": []string{"code", "token", "id_token"},
		"scope":          "openid email profile pydio offline",
	}

	oAuthCecConfig := map[string]interface{}{
		"client_id":   "cells-client",
		"client_name": "Cells Client CLI Tool",
		"grant_types": []string{"authorization_code", "refresh_token"},
		"redirect_uris": []string{
			"http://localhost:3000/servers/callback",
			external + "/oauth2/oob",
		},
		"response_types": []string{"code", "token", "id_token"},
		"scope":          "openid email profile pydio offline",
	}
	oAuthMobileConfig := map[string]interface{}{
		"client_id":   "cells-mobile",
		"client_name": "Mobile Applications",
		"grant_types": []string{"authorization_code", "refresh_token"},
		"redirect_uris": []string{
			"cellsauth://callback",
		},
		"response_types": []string{"code", "token", "id_token"},
		"scope":          "openid email profile pydio offline",
	}
	configKeys := map[string]interface{}{
		"frontend/plugin/editor.libreoffice/LIBREOFFICE_HOST": "localhost",
		"frontend/plugin/editor.libreoffice/LIBREOFFICE_PORT": "9980",
		"frontend/plugin/editor.libreoffice/LIBREOFFICE_SSL":  true,
		"services/" + oauthSrv + "/cors/public": map[string]interface{}{
			"allowedOrigins": "*",
		},
		"services/" + oauthSrv + "/secret": string(secret),
		"services/" + oauthSrv + "/staticClients": []map[string]interface{}{
			oAuthFrontendConfig,
			oAuthSyncConfig,
			oAuthCecConfig,
			oAuthMobileConfig,
		},
	}

	for p, def := range configKeys {
		val := config.Val(p)
		var data interface{}

		if e := val.Scan(&data); e == nil && data == nil {
			fmt.Printf("[Configs] Upgrading: setting default config %s to %v\n", p, def)
			d, f := path.Split(p)
			config.Val(d, f).Set(def)
			save = true
		}
	}

	return save, nil
}

func forceDefaultConfig(config configx.Values) (bool, error) {
	var save bool
	oauthSrv := common.SERVICE_WEB_NAMESPACE_ + common.SERVICE_OAUTH
	external := config.Val("defaults/url").String()

	// Easy finding usage of srvUrl
	configKeys := map[string]interface{}{
		"services/" + oauthSrv + "/issuer": external + "/oidc/",
	}

	for p, def := range configKeys {
		val := config.Val(p)
		var data interface{}
		if val.Scan(&data); data != def {
			fmt.Printf("[Configs] Upgrading: forcing default config %s to %v\n", p, def)
			d, f := path.Split(p)
			config.Val(d, f).Set(def)
			save = true
		}
	}

	configSliceKeys := map[string][]string{
		"services/" + oauthSrv + "/insecureRedirects": []string{external + "/auth/callback"},
	}

	for p, def := range configSliceKeys {
		val := config.Val(p)

		var data []string
		if val.Scan(&data); !stringSliceEqual(data, def) {
			fmt.Printf("[Configs] Upgrading: forcing default config %s to %v\n", p, def)
			d, f := path.Split(p)
			config.Val(d, f).Set(def)
			save = true
		}
	}

	oAuthFrontendConfig := map[string]interface{}{
		"client_id":                 "cells-frontend",
		"client_name":               "CellsFrontend Application",
		"grant_types":               []string{"authorization_code", "refresh_token"},
		"redirect_uris":             []string{external + "/auth/callback"},
		"post_logout_redirect_uris": []string{external + "/auth/logout"},
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
						if strings.HasSuffix(redir.(string), "/oauth2/oob") && redir.(string) != external+"/oauth2/oob" {
							newRedirs = append(newRedirs, external+"/oauth2/oob")
							saveStatics = true
						} else if strings.HasSuffix(redir.(string), "/auth/callback") && redir.(string) != external+"/auth/callback" {
							newRedirs = append(newRedirs, external+"/auth/callback")
							saveStatics = true
						} else if strings.HasSuffix(redir.(string), "/auth/logout") && redir.(string) != external+"/auth/logout" {
							newRedirs = append(newRedirs, external+"/auth/logout")
							saveStatics = true
						} else {
							newRedirs = append(newRedirs, redir.(string))
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
			fmt.Println("[Configs] Upgrading: updating staticClients")
			config.Val("services/" + oauthSrv + "/staticClients").Set(data)
			save = true
		}
	}

	return save, nil
}

// // updateLeCaURL changes the URL of acme API endpoint for Let's Encrypt certificate generation to v2 if it is used.
// func updateLeCaURL(config configx.Values) (bool, error) {

// 	caURLKey := "cert/proxy/caUrl"
// 	caURLOldValue := "https://acme-v01.api.letsencrypt.org/directory"
// 	caURLNewValue := "https://acme-v02.api.letsencrypt.org/directory"

// 	paths := strings.Split(caURLKey, "/")
// 	val := config.Get(paths...)

// 	var data interface{}
// 	save := false
// 	if e := val.Scan(&data); e == nil && data != nil {
// 		ov := data.(string)
// 		if ov == caURLOldValue {
// 			fmt.Printf("[Configs] Upgrading: rather use acme v2 API to generate Let's Encrypt certificates\n")
// 			config.Set(caURLNewValue, paths...)
// 			save = true
// 		}
// 	}
// 	return save, nil
// }
