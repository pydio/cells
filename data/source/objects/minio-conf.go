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

package objects

import (
	"os"
	"path/filepath"

	"github.com/pydio/cells/v4/common"
	"github.com/pydio/cells/v4/common/runtime"
	json "github.com/pydio/cells/v4/common/utils/jsonx"
)

var legacyConfTemplate = `{
  "version": "32",
  "credential": {
    "accessKey": "ACCESS_KEY",
    "secretKey": "SECRET_KEY",
    "expiration": "0001-01-01T00:00:00Z"
  },
  "region": "",
  "browser": "on",
  "logger": {
    "console": {
      "enable": false
    },
    "file": {
      "enable": false,
      "filename": ""
    }
  },
  "notify": {
    "amqp": {
      "1": {
        "enable": false,
        "url": "",
        "exchange": "",
        "routingKey": "",
        "exchangeType": "",
        "deliveryMode": 0,
        "mandatory": false,
        "immediate": false,
        "durable": false,
        "internal": false,
        "noWait": false,
        "autoDeleted": false
      }
    },
    "elasticsearch": {
      "1": {
        "enable": false,
        "format": "",
        "url": "",
        "index": ""
      }
    },
    "kafka": {
      "1": {
        "enable": false,
        "brokers": null,
        "topic": "",
        "tls": {
          "enable": false,
          "skipVerify": false,
          "clientAuth": 0
        },
        "sasl": {
          "enable": false,
          "username": "",
          "password": ""
        }
      }
    },
    "mqtt": {
      "1": {
        "enable": false,
        "broker": "",
        "topic": "",
        "qos": 0,
        "clientId": "",
        "username": "",
        "password": "",
        "reconnectInterval": 0,
        "keepAliveInterval": 0
      }
    },
    "mysql": {
      "1": {
        "enable": false,
        "format": "",
        "dsnString": "",
        "table": "",
        "host": "",
        "port": "",
        "user": "",
        "password": "",
        "database": ""
      }
    },
    "nats": {
      "1": {
        "enable": false,
        "address": "",
        "subject": "",
        "username": "",
        "password": "",
        "token": "",
        "secure": false,
        "pingInterval": 0,
        "streaming": {
          "enable": false,
          "clusterID": "",
          "clientID": "",
          "async": false,
          "maxPubAcksInflight": 0
        }
      }
    },
    "postgresql": {
      "1": {
        "enable": false,
        "format": "",
        "connectionString": "",
        "table": "",
        "host": "",
        "port": "",
        "user": "",
        "password": "",
        "database": ""
      }
    },
    "redis": {
      "1": {
        "enable": false,
        "format": "",
        "address": "",
        "password": "",
        "key": ""
      }
    },
    "webhook": {
      "1": {
        "enable": false,
        "endpoint": ""
      }
    }
  }
}
`

// CreateMinioConfigFile generates a legacy config file
func CreateMinioConfigFile(serviceId string, accessKey string, secretKey string) (configDir string, err error) {

	var e error
	configDir, e = runtime.ServiceDataDir(common.ServiceGrpcNamespace_ + common.ServiceDataObjects)
	if e != nil {
		return "", e
	}

	gatewayDir := filepath.Join(configDir, serviceId)
	gatewayFile := filepath.Join(gatewayDir, "config.json")

	// Create path to folder
	if _, err := os.Stat(gatewayFile); err != nil && os.IsNotExist(err) {
		e := os.MkdirAll(gatewayDir, 0755)
		if e != nil {
			return "", e
		}
	} else {
		// File exists: remove it and recreate (config may have changed)
		if e := os.Remove(gatewayFile); e != nil {
			return "", e
		}
	}

	var legacyConf map[string]interface{}
	e = json.Unmarshal([]byte(legacyConfTemplate), &legacyConf)
	if e != nil {
		return "", e
	}
	legacyConf["credentials"] = map[string]string{
		"accessKey":  accessKey,
		"secretKey":  secretKey,
		"expiration": "0001-01-01T00:00:00Z",
	}

	// Create basic config file
	data, _ := json.Marshal(legacyConf)
	if file, e := os.OpenFile(gatewayFile, os.O_CREATE|os.O_WRONLY, 0755); e == nil {
		defer file.Close()
		file.Write(data)
	} else {
		return "", e
	}

	return gatewayDir, nil

}

func DeleteMinioConfigDir(serviceId string) error {

	configDir, e := runtime.ServiceDataDir(common.ServiceGrpcNamespace_ + common.ServiceDataObjects)
	if e != nil {
		return e
	}

	gatewayDir := filepath.Join(configDir, serviceId)
	return os.RemoveAll(gatewayDir)

}
