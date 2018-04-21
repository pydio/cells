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
	"io/ioutil"
	"net/url"
	"os"
	"path/filepath"
	"text/template"
)

// Data passed to the bootstrapConf template
type FrontBootstrapConf struct {
	ProxyUrl         *url.URL
	WebSocketUrl     *url.URL
	DexID            string
	DexSecret        string
	DisableSslVerify string
}

var (
	bootstrapTpl = `
{
	"core.conf":{
		"UNIQUE_INSTANCE_CONFIG":{
			"instance_name":"conf.pydio",
			"group_switch_value":"conf.pydio"
		},
		"ENDPOINT_REST_API": "{{.ProxyUrl}}/a",
		"ENDPOINT_FRONT_PLUGINS": "{{.ProxyUrl}}/plug",
		"ENDPOINT_S3_GATEWAY": "{{.ProxyUrl}}/io",
		"ENDPOINT_WEBSOCKET": "{{.WebSocketUrl}}/ws/event",
		"ENDPOINT_DEX": "{{.ProxyUrl}}/auth",
		"ENDPOINT_DEX_CLIENTID": "{{.DexID}}",
		"ENDPOINT_DEX_CLIENTSECRET": "{{.DexSecret}}",
{{if .DisableSslVerify}}		"SKIP_SSL_VERIFY":{{.DisableSslVerify}},{{end}}
		"FRONTEND_URL":"{{.ProxyUrl}}",
		"PUBLIC_BASEURI":"/public"
	},
	"core.auth":{
		"MASTER_INSTANCE_CONFIG":{
			"instance_name":"auth.pydio",
			"group_switch_value":"auth.pydio"
		}
	},
	"core.cache":{
		"UNIQUE_INSTANCE_CONFIG":[]
	}
}`
)

// FrontBootstrapFromConfig reads pydio config to generate the associated bootstrap.conf
// for frontend.
func FrontBootstrapFromConfig(proxyUrl string) (*FrontBootstrapConf, error) {

	c := &FrontBootstrapConf{}
	if proxyUrl == "" {
		// load proxyUrl from config
		proxyUrl = Get("defaults", "url").String("")
	}
	if proxyUrl == "" {
		return c, fmt.Errorf("cannot find url for bootstrap")
	}
	var e error
	if c.ProxyUrl, e = url.Parse(proxyUrl); e != nil {
		return c, e
	}
	wsUrl := &url.URL{}
	if c.ProxyUrl.Scheme == "https" {
		wsUrl.Scheme = "wss"
	} else {
		wsUrl.Scheme = "ws"
	}
	wsUrl.Host = c.ProxyUrl.Host
	c.WebSocketUrl = wsUrl

	type DexClient struct {
		Id           string
		Name         string
		Secret       string
		RedirectURIs []string
	}
	var dexClients []*DexClient
	if e := Get("services", "pydio.grpc.auth", "dex", "staticClients").Scan(&dexClients); e != nil {
		return c, e
	}
	dexClient := dexClients[0]
	c.DexID = dexClient.Id
	c.DexSecret = dexClient.Secret
	tls := Get("cert", "proxy", "ssl").Bool(false)
	if tls {
		if self := Get("cert", "proxy", "self").Bool(false); self {
			c.DisableSslVerify = "true"
		}
	}

	return c, nil
}

// FrontWriteBootstrap takes a config, executes the template and save to the front
func FrontWriteBootstrap(rootFolder string, conf *FrontBootstrapConf) error {

	buf := bytes.NewBuffer([]byte{})
	if tmpl, err := template.New("bootstrap").Parse(bootstrapTpl); err != nil {
		return err
	} else {
		if err = tmpl.Execute(buf, conf); err != nil {
			return err
		}
	}

	dir := filepath.Join(rootFolder, "data", "plugins", "boot.conf")
	if e := os.MkdirAll(dir, 0755); e != nil {
		return e
	}
	if e := os.Chmod(filepath.Join(rootFolder, "data"), 0777); e != nil {
		return e
	}
	if e := os.Chmod(filepath.Join(rootFolder, "data", "plugins"), 0777); e != nil {
		return e
	}
	if e := os.Chmod(dir, 0777); e != nil {
		return e
	}

	//fmt.Println("Writing bootstrap json", string(buf.Bytes()))

	jsonFile := filepath.Join(dir, "bootstrap.json")
	fmt.Println("Writing file", jsonFile)
	if e := ioutil.WriteFile(jsonFile, buf.Bytes(), 0755); e == nil {
		os.Chmod(jsonFile, 0777)
	} else {
		return e
	}

	return nil

}

// FrontWriteBootstrap clears the frontend caches
func FrontClearCache(rootFolder string) {
	// Clear cache
	cacheDataDir := filepath.Join(rootFolder, "data", "cache")
	os.RemoveAll(cacheDataDir)
	os.MkdirAll(cacheDataDir, 0644)
	os.Chmod(cacheDataDir, 0777)
}

// FrontWriteBootstrap touches additional files in frontend boot.conf folder to avoid
// triggering an install process in the frontend
func FrontTouchAdditionalFiles(rootFolder string) {

	dir := filepath.Join(rootFolder, "data", "plugins", "boot.conf")
	if f, e := os.OpenFile(filepath.Join(dir, "admin_counted"), os.O_RDONLY|os.O_CREATE, 0755); e == nil {
		f.Close()
	}
	if f, e := os.OpenFile(filepath.Join(dir, "diag_result.php"), os.O_RDONLY|os.O_CREATE, 0755); e == nil {
		f.Close()
	}
	if f, e := os.OpenFile(filepath.Join(dir, "first_run_passed"), os.O_RDONLY|os.O_CREATE, 0755); e == nil {
		f.Close()
	}
	if f, e := os.OpenFile(filepath.Join(dir, "server_uuid"), os.O_RDONLY|os.O_CREATE, 0755); e == nil {
		f.Close()
	}

}
