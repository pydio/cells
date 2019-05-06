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

package caddy

import (
	"bytes"
	"context"
	"fmt"
	"html/template"
	"strings"
	"time"

	"github.com/golang/protobuf/ptypes/empty"
	"github.com/mholt/caddy"
	"github.com/mholt/caddy/caddyhttp/httpserver"
	"github.com/micro/go-micro/broker"
	"github.com/micro/go-micro/registry"
	"go.uber.org/zap"

	"github.com/pydio/cells/common"
	"github.com/pydio/cells/common/config"
	"github.com/pydio/cells/common/log"
	"github.com/pydio/cells/common/micro"
	"github.com/pydio/cells/common/service/context"
	proto "github.com/pydio/cells/common/service/proto"
)

var (
	mainCaddy = &Caddy{}
	FuncMap   = template.FuncMap{
		"urls":           internalURLFromServices,
		"serviceAddress": addressFromService,
	}
	restartChan     chan bool
	restartRequired bool
	gatewayCtx      = servicecontext.WithServiceName(servicecontext.WithServiceColor(context.Background(), servicecontext.ServiceColorOther), common.SERVICE_GATEWAY_PROXY)
)

func init() {
	caddy.AppName = common.PackageLabel
	caddy.AppVersion = common.Version().String()
	httpserver.GracefulTimeout = 30 * time.Second
	restartChan = make(chan bool, 1)

	go watchRestart()

}

func watchRestart() {
	for {
		select {
		case <-restartChan:
			log.Logger(context.Background()).Debug("Received Proxy Restart Event")
			restartRequired = true
		case <-time.After(10 * time.Second):
			if restartRequired {
				log.Logger(context.Background()).Debug("Restarting Proxy Now")
				restartRequired = false
				restart()
			}
		}
	}
}

// Caddy contains the templates and functions for building a dynamic caddyfile
type Caddy struct {
	serverType    string
	caddyfile     string
	caddytemplate *template.Template
	player        TemplateFunc
	pathes        []string
	templates     []TemplateFunc
	configPaths   [][]string
	instance      *caddy.Instance
}

// TemplateFunc is a function providing a stringer
type TemplateFunc func() (*bytes.Buffer, error)

// Enable the caddy builder
func Enable(caddyfile string, player TemplateFunc) {
	caddytemplate, err := template.New("pydiocaddy").Funcs(FuncMap).Parse(caddyfile)
	if err != nil {
		log.Fatal("could not load template: ", zap.Error(err))
	}

	mainCaddy.caddyfile = caddyfile
	mainCaddy.caddytemplate = caddytemplate
	mainCaddy.player = player

	caddyLoader := func(serverType string) (caddy.Input, error) {
		buf, err := mainCaddy.Play()
		if err != nil {
			return nil, err
		}

		return caddy.CaddyfileInput{
			Contents:       buf.Bytes(),
			ServerTypeName: serverType,
		}, nil
	}

	caddy.SetDefaultCaddyfileLoader("http", caddy.LoaderFunc(caddyLoader))
}

// Get returns the currently enabled caddy builder
func Get() *Caddy {
	return mainCaddy
}

// RegisterPluginTemplate adds a TemplateFunc to be called for each plugin
func RegisterPluginTemplate(fn TemplateFunc, watchConfigPath []string, pathes ...string) error {

	mainCaddy.pathes = append(mainCaddy.pathes, pathes...)
	mainCaddy.templates = append(mainCaddy.templates, fn)
	if len(watchConfigPath) > 0 {
		mainCaddy.configPaths = append(mainCaddy.configPaths, watchConfigPath)
	}

	return nil
}

func Start() error {
	// load caddyfile
	caddyfile, err := caddy.LoadCaddyfile("http")
	if err != nil {
		return err
	}

	// start caddy server
	instance, err := caddy.Start(caddyfile)
	if err != nil {
		return err
	}

	mainCaddy.instance = instance
	return nil
}

func Stop() error {
	instance := GetInstance()
	instance.ShutdownCallbacks()
	instance.Stop()

	return nil
}

func Restart() error {
	go func() {
		restartChan <- true
	}()

	return nil
}

func StartWithFastRestart() error {
	e := Start()
	go func() {
		<-time.After(2 * time.Second)

		log.Logger(context.Background()).Debug("Restarting Proxy Now (fast restart)")

		restart()
		restartRequired = false
	}()
	return e
}

func restart() error {

	if mainCaddy.instance == nil {
		return fmt.Errorf("instance not started")
	}

	// load caddyfile
	caddyfile, err := caddy.LoadCaddyfile("http")
	if err != nil {
		return err
	}

	if common.LogLevel == zap.DebugLevel {
		fmt.Println(string(caddyfile.Body()))
	} else {
		log.Logger(gatewayCtx).Info("Restarting proxy", zap.ByteString("caddyfile", caddyfile.Body()))
	}

	// start caddy server
	instance, err := mainCaddy.instance.Restart(caddyfile)
	if err != nil {
		return err
	}

	log.Logger(gatewayCtx).Info("Restart done")

	mainCaddy.instance = instance

	broker.Publish(common.TOPIC_PROXY_RESTART, &broker.Message{Body: []byte("")})

	return nil
}

func (c *Caddy) Play() (*bytes.Buffer, error) {
	return c.player()
}

func GetInstance() *caddy.Instance {
	return mainCaddy.instance
}

func (c *Caddy) GetTemplate() *template.Template {
	return c.caddytemplate
}

func GetPathes() []string {
	return mainCaddy.pathes
}

func GetTemplates() []TemplateFunc {
	return mainCaddy.templates
}

func GetConfigPaths() [][]string {
	return mainCaddy.configPaths
}

func internalURLFromServices(name string, uri ...string) string {
	var res []string

	services, _ := registry.GetService(name)

	for _, service := range services {
		for _, node := range service.Nodes {
			res = append(res, fmt.Sprintf("%s:%d%s", node.Address, node.Port, strings.Join(uri, "")))
		}
	}

	if len(res) == 0 {
		go func() {
			restartChan <- true
		}()
		return "PENDING"
	}

	return strings.Join(res, " ")
}

func addressFromService(name string, uri ...string) string {

	c := proto.NewService(name, defaults.NewClient())
	r, err := c.Status(context.Background(), &empty.Empty{})
	if err != nil {
		return "NOT_AVAILABLE"
	}

	if !r.GetOK() {
		return "NOT_AVAILABLE"
	}

	return r.Address
}

func peersFromConfig(path []string, def ...string) string {
	c := config.Get(path...)
	return c.String(def[0])
}
