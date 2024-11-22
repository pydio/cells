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
	"bytes"
	"context"
	"log"
	"os"
	"strings"
	"text/template"

	"github.com/spf13/viper"
	yaml "gopkg.in/yaml.v3"

	"github.com/pydio/cells/v4/common/config"
	"github.com/pydio/cells/v4/common/proto/object"
	"github.com/pydio/cells/v4/common/runtime"
	"github.com/pydio/cells/v4/common/utils/openurl"

	_ "embed"
)

// Bootstrap wraps a config.Store and is loaded from yaml templates or additional environment data
type Bootstrap struct {
	config.Store

	viper     *Viper
	templates []*viper.Viper
}

type Viper struct {
	*viper.Viper
}

func NewBootstrap(ctx context.Context) (*Bootstrap, error) {
	store, err := config.OpenStore(ctx, "mem://?encode=yaml")
	if err != nil {
		return nil, err
	}

	v := viper.NewWithOptions(viper.KeyDelimiter("::"))
	v.SetConfigType("yaml")

	bs := &Bootstrap{
		viper: &Viper{v},
		Store: store,
	}

	if err := bs.reload(ctx, nil); err != nil {
		return nil, err
	}

	return bs, nil
}

// RegisterTemplate adds a new template to the list
func (bs *Bootstrap) RegisterTemplate(typ string, tpl string) error {
	v := viper.NewWithOptions(viper.KeyDelimiter("/"))
	v.SetConfigType(typ)
	if err := v.ReadConfig(bytes.NewBufferString(tpl)); err != nil {
		return err
	}

	bs.templates = append(bs.templates, v)

	return nil
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

func (bs *Bootstrap) Viper() *Viper {
	return bs.viper
}

func (bs *Bootstrap) reload(ctx context.Context, storePool *openurl.Pool[config.Store]) error {
	// var store config.Store

	runtimeConfig := viper.NewWithOptions(viper.KeyDelimiter("::"))
	runtimeConfig.SetConfigType("yaml")

	/*if storePool != nil {
		if st, err := storePool.Get(ctx); err != nil {
			return err
		} else {
			store = st
		}
	}*/

	for _, c := range bs.templates {
		if err := runtimeConfig.MergeConfigMap(c.AllSettings()); err != nil {
			return err
		}
	}

	// Finally we're adding any flags we can have in the --sets
	if sets := runtime.GetString(runtime.KeyBootstrapSetsFile); sets != "" {
		if b, err := os.ReadFile(sets); err == nil {
			if err := runtimeConfig.MergeConfig(bytes.NewBuffer(b)); err != nil {
				return err
			}
		}
	}

	// Or in the --set flags
	if sets := runtime.GetStringSlice(runtime.KeyBootstrapSet); len(sets) > 0 {
		c := viper.NewWithOptions(viper.KeyDelimiter("/"))
		for _, v := range sets {
			vv := strings.SplitN(v, "=", 2)
			k, vvv := vv[0], vv[1]
			c.Set(k, vvv)
		}

		if err := runtimeConfig.MergeConfigMap(c.AllSettings()); err != nil {
			return err
		}
	}

	bs.viper.Viper = runtimeConfig

	return nil
}

func (bs *Bootstrap) String() string {
	// Marshal the map to YAML
	fullYamlData, err := yaml.Marshal(bs.viper.AllSettings())
	if err != nil {
		log.Fatalf("Error marshaling config to YAML: %v", err)
	}

	return string(fullYamlData)
}

type keyPair struct {
	key string
	val string
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
