/*
 * Copyright (c) 2018. Abstrium SAS <team (at) pydio.com>
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

// Package grpc spins an OpenID Connect Server using the coreos/dex implementation
package web

import (
	"context"
	"encoding/json"
	"fmt"
	"log"

	"github.com/coreos/dex/connector"
	"github.com/coreos/dex/connector/oidc"
	"github.com/golang/protobuf/jsonpb"
	"github.com/micro/go-micro"
	"github.com/ory/hydra/driver"
	"github.com/ory/hydra/driver/configuration"
	"github.com/ory/hydra/oauth2"
	"github.com/sirupsen/logrus"

	"github.com/pydio/cells/common"
	"github.com/pydio/cells/common/config"
	defaults "github.com/pydio/cells/common/micro"
	"github.com/pydio/cells/common/plugins"
	"github.com/pydio/cells/common/proto/auth"
	"github.com/pydio/cells/common/service"
	"github.com/pydio/cells/idm/oauth"
)

// ConnectorConfig is a configuration that can open a connector.
type ConnectorConfig interface {
	Open(logrus.FieldLogger) (connector.Connector, error)
}

var (
	connectors = make(map[string]connector.Connector)
	store      *oauth2.FositeSQLStore
	reg        driver.Registry
	conf       configuration.Provider
)

func init() {
	plugins.Register(func() {
		service.NewService(
			service.Name(common.SERVICE_WEB_NAMESPACE_+common.SERVICE_AUTH),
			service.Tag(common.SERVICE_TAG_IDM),
			service.Description("OAuth Provider"),
			service.WithStorage(oauth.NewDAO),
			service.WithGeneric(func(ctx context.Context, cancel context.CancelFunc) (service.Runner, service.Checker, service.Stopper, error) {
				return service.RunnerFunc(func() error {
						return nil
					}), service.CheckerFunc(func() error {
						return nil
					}), service.StopperFunc(func() error {
						return nil
					}), nil
			},
				serve,
			),
		)
	})

	c := new(auth.OAuth2ConnectorCollection)
	if err := config.Values("services", common.SERVICE_GRPC_NAMESPACE_+common.SERVICE_AUTH, "dex").Scan(c); err != nil {
		log.Fatal("Wrong configuration ", err)
	}

	for _, cc := range c.Connectors {
		var connectorConfig ConnectorConfig

		switch cc.Type {
		case "oidc":
			connectorConfig = new(oidc.Config)
		default:
			continue
		}

		// TODO should marshal to byte reader
		jsonStr, err := (&jsonpb.Marshaler{OrigName: true}).MarshalToString(cc.GetConfig())
		if err != nil {
			continue
		}

		if err := json.Unmarshal([]byte(jsonStr), connectorConfig); err != nil {
			continue
		}

		conn, err := connectorConfig.Open(nil)
		if err != nil {
			continue
		}
		connectors[cc.GetName()] = conn
	}

	fmt.Println("Connectors value is ", connectors)

	// fmt.Println("Connectors config ", connectorsConfig.Connectors[1].GetConfig())
}

func serve(s service.Service) (micro.Option, error) {
	srv := defaults.NewHTTPServer()

	hd := srv.NewHandler(NewRouter())

	if err := srv.Handle(hd); err != nil {
		return nil, err
	}

	return micro.Server(srv), nil
}

type ReplacerFunc func(map[string]interface{}) map[string]interface{}

func parseAndReplace(i interface{}, replacer ReplacerFunc) interface{} {

	switch m := i.(type) {
	case []map[string]interface{}:
		var new []map[string]interface{}
		for _, mm := range m {
			new = append(new, parseAndReplace(mm, replacer).(map[string]interface{}))
		}

		return new
	case map[string]interface{}:
		new := replacer(m)
		for k, v := range new {
			new[k] = parseAndReplace(v, replacer)
		}
		return new
	case []interface{}:
		var new []interface{}
		for _, mm := range m {
			new = append(new, parseAndReplace(mm, replacer))
		}

		return new

	}

	return i
}
