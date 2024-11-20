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
	"github.com/pydio/cells/v4/common/utils/openurl"

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
func SetBootstrapTemplate(name, tpl string) {
	bsTemplates[name] = tpl
}

// Bootstrap wraps a config.Store and is loaded from yaml templates or additional environment data
type Bootstrap struct {
	config.Store
	named string
}

func NewBootstrap(ctx context.Context, runtimeTemplate string) (*Bootstrap, error) {
	store, err := config.OpenStore(ctx, "mem://?encode=yaml")
	if err != nil {
		return nil, err
	}

	bs := &Bootstrap{
		Store: store,
		named: "core",
	}

	if runtimeTemplate != "" {
		if _, ok := bsTemplates[runtimeTemplate]; !ok {
			return nil, fmt.Errorf("bootstrap template not found: %s", runtimeTemplate)
		}
		bs.named = runtimeTemplate
	}

	bs.reload(ctx, nil)

	return bs, nil
}

// MustReset triggers a full reload of the config
func (bs *Bootstrap) MustReset(ctx context.Context, conf *openurl.Pool[config.Store]) {
	_ = bs.reload(ctx, conf)
}

// WatchConfAndReset watches any config changes and reload the bootstrap. It is blocking, must be sent in goroutine.
//func (bs *Bootstrap) WatchConfAndReset(ctx context.Context, configURL string, errorHandler func(error)) {
//	conf, err := config.OpenStore(ctx, configURL)
//	if err != nil {
//		errorHandler(err)
//		return
//	}
//	bs.MustReset(ctx, conf)
//
//	res, err := conf.Watch()
//	if err != nil {
//		errorHandler(err)
//		return
//	}
//
//	for {
//		if _, er := res.Next(); er != nil {
//			return
//		}
//		bs.MustReset(ctx, conf)
//	}
//}

func (bs *Bootstrap) reload(ctx context.Context, storePool *openurl.Pool[config.Store]) error {
	var store config.Store

	if storePool != nil {
		if st, err := storePool.Get(ctx); err != nil {
			return err
		} else {
			store = st
		}
	}

	runtimeDefaults, runtimeOthers := runtimeSetPairs()

	var defaultTemplate = defaultsValues
	if len(runtimeDefaults) > 0 {

		var er error
		for _, def := range runtimeDefaults {
			if def.val, er = tplEval(ctx, def.val, bs.named+def.key, store); er != nil {
				return er
			}
		}
		// Update defaults before joining two templates together
		// Use Yaml.Nodes patching to make sure to keep references
		defYaml, _ := tplEval(ctx, defaultsValues, "default", store)
		if patched, er := patchYaml(defYaml, runtimeDefaults); er == nil {
			defaultTemplate = patched
		} else {
			return er
		}
	}

	tmpl := strings.Join([]string{
		defaultTemplate,
		bsTemplates[bs.named],
	}, "\n")

	// Optionally fully override the template based on arguments
	if file := runtime.GetString(runtime.KeyBootstrapFile); file != "" {
		b, err := os.ReadFile(file)
		if err != nil {
			return err
		}
		tmpl = string(b)
	} else if yaml := runtime.GetString(runtime.KeyBootstrapYAML); yaml != "" {
		tmpl = yaml
	} else {

		// TODO - shouldn't run a bootstrap if we haven't given one
		return nil
	}

	fullYaml, er := tplEval(ctx, tmpl, bs.named+"-yaml", store)
	if er != nil {
		return er
	}
	// fmt.Println("FULL YAML", fullYaml)
	if err := bs.Set([]byte(fullYaml)); err != nil {
		return err
	}

	// Now apply runtimeOther keyPairs
	for _, pair := range runtimeOthers {
		if val, er := tplEval(ctx, pair.val, bs.named+pair.key, store); er != nil {
			return er
		} else {
			_ = bs.Val(pair.key).Set(val)
		}
	}

	return nil
}

type keyPair struct {
	key string
	val string
}

func runtimeSetPairs() (def, proc []keyPair) {
	var pairs = runtime.GetStringSlice(runtime.KeyBootstrapSet)
	if sets := runtime.GetString(runtime.KeyBootstrapSetsFile); sets != "" {
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
		if strings.HasPrefix(kv[0], "defaults/") {
			def = append(def, keyPair{kv[0], kv[1]})
		} else {
			proc = append(proc, keyPair{kv[0], kv[1]})
		}
	}

	return
}

func tplEval(ctx context.Context, tpl, name string, conf config.Store) (string, error) {
	t, err := template.New(name).Funcs(map[string]any{
		"getServiceDataDir": runtime.MustServiceDataDir,
	}).Delims("{{{{", "}}}}").Parse(tpl)
	if err != nil {
		return "", err
	}

	var b strings.Builder
	dss, oss := loadDSData(ctx, tpl, conf)

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

func loadDSData(ctx context.Context, tpl string, conf config.Store) (map[string]*object.DataSource, map[string]*object.MinioConfig) {
	if conf == nil {
		return nil, nil
	}
	if !strings.Contains(tpl, ".ObjectsSources") && !strings.Contains(tpl, ".DataSources") {
		return nil, nil
	}
	return config.ListSourcesFromConfig(ctx), config.ListMinioConfigsFromConfig(ctx, true)

}
