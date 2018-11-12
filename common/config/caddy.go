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

package config

import (
	"bytes"
	"fmt"
	"net/url"
	"strings"

	"github.com/mholt/caddy"
	"github.com/micro/go-micro/registry"
	"github.com/pydio/cells/common"
)

var (
	caddyPathes    map[string][]string
	caddyTemplates map[string]TemplateFunc
)

func init() {
	caddy.AppName = common.PackageLabel
	caddy.AppVersion = common.Version().String()
}

// InitCaddyFile creates a caddy LoaderFunc with the correct contents
func InitCaddyFile(serverType string, main TemplateFunc) error {
	caddyLoader := func(serverType string) (caddy.Input, error) {
		buf := main()

		return caddy.CaddyfileInput{
			Contents:       buf.Bytes(),
			ServerTypeName: serverType,
		}, nil
	}

	caddy.SetDefaultCaddyfileLoader(serverType, caddy.LoaderFunc(caddyLoader))

	return nil
}

// TemplateFunc is a function providing a stringer
type TemplateFunc func() *bytes.Buffer

// RegisterPluginTemplate adds a TemplateFunc to be called for each plugin
func RegisterPluginTemplate(serverType string, f TemplateFunc, pathes ...string) {
	caddyPathes[serverType] = pathes
	caddyTemplates[serverType] = f
}

func internalUrlFromServices(name string) []*url.URL {

	var urls []*url.URL

	services, _ := registry.GetService(name)

	for _, service := range services {
		for _, node := range service.Nodes {
			fmt.Println(node.Address, node.Port)
		}
	}

	return urls
}

func internalUrlFromConfig(name string, path []string, host string, tls bool, split ...bool) (*url.URL, error) {
	port := Get(path...).String("")
	if port == "" {
		return nil, fmt.Errorf("[caddy] cannot find port in config for %s", name)
	}
	if len(split) > 0 && split[0] {
		parts := strings.Split(port, ":")
		port = parts[len(parts)-1]
	}
	u := "http://"
	if tls {
		u = "https://"
	}
	u += host + ":" + port
	parsed, e := url.Parse(u)
	if e != nil {
		return nil, fmt.Errorf("cannot parse url %s for %s", u, name)
	}
	return parsed, nil
}
