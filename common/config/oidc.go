package config

import (
	"encoding/json"
	"fmt"

	"github.com/pydio/cells/common"

	"github.com/coreos/dex/storage"

	"github.com/coreos/dex/connector/oidc"

	"github.com/pydio/cells/common/utils/std"
)

type OidcConnector struct {
	ID     string       `json:"id"`
	Name   string       `json:"name"`
	Type   string       `json:"type"`
	Config *oidc.Config `json:"config"`
}

type OidcConfig struct {
	ClientID      string   `json:"clientID"`
	ClientSecret  string   `json:"clientSecret"`
	RedirectURIs  []string `json:"redirectURIs"`
	ResponseTypes []string `json:"responseTypes"`
	GrantTypes    []string `json:"grantTypes"`
	Scopes        []string `json:"scopes"`
}

// UpdateOIDCConnectorsConfig updates or inserts the pydio-oidc connector config to make sure URLs are
// synced with the server external URL.
func UpdateOIDCConnectorsConfig(configValue []byte, insert bool, serverUrl string) (interface{}, bool, error) {
	var save bool
	if insert {
		var connectors []interface{}
		if err := json.Unmarshal(configValue, &connectors); err != nil {
			return nil, false, err
		}
		secret := std.Randkey(24)
		var basicAuth bool
		connectors = append(connectors, &OidcConnector{
			ID:   "pydio-oidc",
			Name: "Pydio OIDC",
			Type: "oidc",
			Config: &oidc.Config{
				ClientID:             "pydiooidc",
				ClientSecret:         secret,
				Issuer:               fmt.Sprintf("%s/a/config/discovery", serverUrl),
				RedirectURI:          fmt.Sprintf("%s/auth/dex/callback", serverUrl),
				HostedDomains:        []string{},
				Scopes:               []string{},
				BasicAuthUnsupported: &basicAuth,
			},
		})
		save = true
		return connectors, save, nil
	} else {
		var connectors []map[string]interface{}
		if err := json.Unmarshal(configValue, &connectors); err != nil {
			return nil, false, err
		}
		var newConnectors []interface{}
		for _, c := range connectors {
			if c["id"] != "pydio-oidc" {
				newConnectors = append(newConnectors, c)
				continue
			}
			d, _ := json.Marshal(c)
			var oC OidcConnector
			if e := json.Unmarshal(d, &oC); e != nil {
				return nil, false, e
			}
			issuerUrl := fmt.Sprintf("%s/a/config/discovery", serverUrl)
			if oC.Config.Issuer != issuerUrl {
				oC.Config.Issuer = issuerUrl
				save = true
			}
			redirectUrl := fmt.Sprintf("%s/auth/dex/callback", serverUrl)
			if oC.Config.RedirectURI != redirectUrl {
				oC.Config.RedirectURI = redirectUrl
				save = true
			}
			newConnectors = append(newConnectors, oC)
		}
		return newConnectors, save, nil
	}
}

// ReadOIDCConnectorConfig finds the pydio-oidc connector config from the connectors array
func ReadOIDCConnectorConfig(configValue []byte) (*oidc.Config, error) {

	var connectors []map[string]interface{}
	if err := json.Unmarshal(configValue, &connectors); err != nil {
		return nil, err
	}
	for _, c := range connectors {
		if c["id"] != "pydio-oidc" {
			continue
		}
		d, _ := json.Marshal(c)
		var oC OidcConnector
		if e := json.Unmarshal(d, &oC); e != nil {
			return nil, e
		}
		return oC.Config, nil
	}

	return nil, fmt.Errorf("oidc.secret.not.found")
}

// UpdateOIDCClients sets the necessary URIs on StaticClients
func UpdateOIDCClients(configValue []byte, serverUrl string) (interface{}, bool, error) {
	var save bool
	var clients []*storage.Client
	if err := json.Unmarshal(configValue, &clients); err != nil {
		return nil, false, err
	}
	newUri := fmt.Sprintf("%s/login/callback", serverUrl)
	for _, c := range clients {
		if c.RedirectURIs != nil && len(c.RedirectURIs) > 0 && c.RedirectURIs[0] != newUri {
			c.RedirectURIs[0] = newUri
			save = true
		}
	}
	return clients, save, nil
}

func OIDCConnectorsLabels() map[string]string {
	confValues := Get("services", common.SERVICE_GRPC_NAMESPACE_+common.SERVICE_AUTH, "dex", "connectors").Bytes()
	labels := make(map[string]string)
	var connectors []map[string]interface{}
	if err := json.Unmarshal(confValues, &connectors); err != nil {
		return labels
	}
	for _, c := range connectors {
		id := c["id"].(string)
		if label, ok := c["name"]; ok {
			labels[id] = label.(string)
		}
	}
	return labels
}
