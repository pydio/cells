package migrations

import (
	"log"
	"path"

	"github.com/hashicorp/go-version"
	"github.com/pydio/cells/common"
	"github.com/pydio/cells/x/configx"
)

func init() {

	v, _ := version.NewVersion("2.1.0")
	add(v, getMigration(moveConnectors))
	add(v, getMigration(movePydioConnectors))
}

func moveConnectors(config configx.Values) error {
	return UpdateKeys(config, map[string]string{
		"services/pydio.grpc.auth/dex/connectors": "services/" + common.SERVICE_WEB_NAMESPACE_ + common.SERVICE_OAUTH + "/connectors",
	})
}

func movePydioConnectors(config configx.Values) error {

	var c interface{}
	var connectors []map[string]interface{}

	err := config.Val("services/" + common.SERVICE_WEB_NAMESPACE_ + common.SERVICE_OAUTH + "/connectors").Scan(&c)
	if err != nil {
		return err
	}

	var changed = false
	for _, connector := range connectors {
		typ, ok := connector["type"].(string)
		if !ok {
			log.Println("Connector type missing, skipping")
			continue
		}
		if typ == "pydio" {
			config, ok := connector["config"].(map[string][]map[string]interface{})
			if !ok {
				log.Println("Config for connector type pydio missing, skipping")
				continue
			}

			pydioconnectors, ok := config["pydioconnectors"]
			if !ok {
				log.Println("Config pydioconnectors missing, skipping")
			}

			for _, pydioconnector := range pydioconnectors {
				typ, ok := pydioconnector["type"].(string)
				if !ok {
					log.Println("Pydio Connector type missing, skipping")
					continue
				}

				if typ != "pydioapi" {
					connectors = append(connectors, pydioconnectors...)
					changed = true
				}
			}

			// deleting pydio connector config
			delete(config, "pydioconnectors")
		}
	}

	if !changed {
		return nil

	}

	d, f := path.Split("services/" + common.SERVICE_WEB_NAMESPACE_ + common.SERVICE_OAUTH + "/connectors")
	config.Val(d, f).Set(connectors)

	return nil
}
