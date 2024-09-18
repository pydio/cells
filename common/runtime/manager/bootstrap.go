/*
 * Copyright (c) 2024. Abstrium SAS <team (at) pydio.com>
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

package manager

import (
	"context"
	"fmt"
	"os"
	"strings"
	"text/template"

	"github.com/pydio/cells/v4/common/config"
	"github.com/pydio/cells/v4/common/proto/object"
	"github.com/pydio/cells/v4/common/runtime"
	"github.com/pydio/cells/v4/common/utils/propagator"

	_ "embed"
)

var (
	//go:embed bootstrap-defaults.yaml
	defaultsValues string
	//go:embed bootstrap.yaml
	bootstrapTemplate string
	//go:embed bootstrap-datasources.yaml
	bootstrapDatasources string

	bsTemplates map[string]string
)

func init() {
	bsTemplates = map[string]string{
		"core":        bootstrapTemplate,
		"datasources": bootstrapDatasources,
	}
}

// SetBootstrapTemplate overrides initial template
func SetBootstrapTemplate(tpl, name string) {
	bsTemplates[name] = tpl
}

// Bootstrap wraps a config.Store and is loaded from yaml templates or additional environment data
type Bootstrap struct {
	config.Store
	named string
}

func loadBootstrap(ctx context.Context) (*Bootstrap, error) {
	store, err := config.OpenStore(ctx, "mem://?encode=yaml")
	if err != nil {
		return nil, err
	}

	bs := &Bootstrap{
		Store: store,
		named: "core",
	}

	if n := runtime.GetString("bootstrap_template"); n != "" {
		if _, ok := bsTemplates[n]; !ok {
			return nil, fmt.Errorf("bootstrap template not found: %s", n)
		}
		bs.named = n
	}

	if err := bs.reload(nil); err != nil {
		return nil, err
	}
	return bs, nil
}

// MustReset triggers a full reload of the config
func (bs *Bootstrap) MustReset(conf config.Store) {
	_ = bs.reload(conf)
}

// WatchConfAndReset watches any config changes and reload the bootstrap. It is blocking, must be sent in goroutine.
func (bs *Bootstrap) WatchConfAndReset(ctx context.Context, configURL string, errorHandler func(error)) {
	conf, err := config.OpenStore(ctx, configURL)
	if err != nil {
		errorHandler(err)
		return
	}
	bs.MustReset(conf)

	res, err := conf.Watch()
	if err != nil {
		errorHandler(err)
		return
	}

	for {
		if _, er := res.Next(); er != nil {
			return
		}
		bs.MustReset(conf)
	}
}

func (bs *Bootstrap) reload(conf config.Store) error {
	tmpl := strings.Join([]string{
		defaultsValues,
		bsTemplates[bs.named],
	}, "\n")

	// Optionally override the template based on arguments
	if file := runtime.GetString("file"); file != "" {
		b, err := os.ReadFile(file)
		if err != nil {
			return err
		}
		tmpl = string(b)
	} else if yaml := runtime.GetString("yaml"); yaml != "" {
		tmpl = yaml
	}

	fullYaml, er := tplEval(tmpl, bs.named+"-yaml", conf)
	if er != nil {
		return er
	}
	if err := bs.Set([]byte(fullYaml)); err != nil {
		return err
	}

	var pairs = runtime.GetStringSlice(runtime.KeySet)
	if sets := runtime.GetString(runtime.KeySetsFile); sets != "" {
		if bb, err := os.ReadFile(sets); err == nil {
			for _, line := range strings.Split(string(bb), "\n") {
				line = strings.TrimSpace(line)
				if line[0] == '#' || line == "" {
					continue
				}
				pairs = append(pairs, line)
			}
		}
	}

	// Assign keys passed by arguments, by evaluating their value through templating as well
	for _, pair := range pairs {
		kv := strings.SplitN(pair, "=", 2)
		if len(kv) != 2 {
			continue
		}
		//_ = bs.Val(kv[0]).Set(kv[1])
		if val, er := tplEval(kv[1], bs.named+kv[0], conf); er == nil {
			_ = bs.Val(kv[0]).Set(val)
		} else {
			return er
		}
	}

	return nil

}

func tplEval(tpl, name string, conf config.Store) (string, error) {
	t, err := template.New(name).Funcs(map[string]any{
		"getServiceDataDir": runtime.MustServiceDataDir,
	}).Delims("{{{{", "}}}}").Parse(tpl)
	if err != nil {
		return "", err
	}

	var b strings.Builder
	dss, oss := loadDSData(tpl, conf)

	r := runtime.GetRuntime()
	if err := t.Execute(&b, struct {
		ConfigURL             string
		RegistryURL           string
		BrokerURL             string
		BindHost              string
		AdvertiseHost         string
		DiscoveryPort         string
		FrontendPort          string
		ApplicationWorkingDir string
		ApplicationDataDir    string
		ApplicationLogsDir    string
		ServiceDataDir        func(string) string
		Config                config.Store
		DataSources           map[string]*object.DataSource
		ObjectsSources        map[string]*object.MinioConfig
	}{
		ConfigURL:             runtime.ConfigURL(),
		RegistryURL:           runtime.RegistryURL(),
		BrokerURL:             runtime.BrokerURL(),
		Config:                conf,
		DataSources:           dss,
		ObjectsSources:        oss,
		BindHost:              r.GetString(runtime.KeyBindHost),
		AdvertiseHost:         r.GetString(runtime.KeyBindHost),
		DiscoveryPort:         r.GetString(runtime.KeyGrpcDiscoveryPort),
		FrontendPort:          r.GetString(runtime.KeyHttpPort),
		ApplicationWorkingDir: runtime.ApplicationWorkingDir(),
		ApplicationDataDir:    runtime.ApplicationWorkingDir(runtime.ApplicationDirData),
		ApplicationLogsDir:    runtime.ApplicationWorkingDir(runtime.ApplicationDirLogs),
	}); err != nil {
		return "", err
	}
	return b.String(), nil

}

func loadDSData(tpl string, conf config.Store) (map[string]*object.DataSource, map[string]*object.MinioConfig) {
	if conf == nil {
		return nil, nil
	}
	if !strings.Contains(tpl, ".ObjectsSources") && !strings.Contains(tpl, ".DataSources") {
		return nil, nil
	}
	ctx := propagator.With(context.Background(), config.ContextKey, conf)
	return config.ListSourcesFromConfig(ctx), config.ListMinioConfigsFromConfig(ctx, true)

}
