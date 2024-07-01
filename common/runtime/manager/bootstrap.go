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
	"io"
	"os"
	"strings"
	"text/template"

	ypatch "github.com/palantir/pkg/yamlpatch"

	"github.com/pydio/cells/v4/common/config"
	"github.com/pydio/cells/v4/common/runtime"

	_ "embed"
)

var (
	//go:embed bootstrap-defaults.yaml
	defaultsTemplate string
	//go:embed bootstrap.yaml
	bootstrapTemplate string
)

// SetBootstrapTemplate overrides initial template
func SetBootstrapTemplate(tpl string) {
	bootstrapTemplate = tpl
}

// Bootstrap wraps a config.Store and is loaded from yaml templates or additional environment data
type Bootstrap struct {
	config.Store
}

func loadBootstrap(ctx context.Context) (*Bootstrap, error) {
	store, err := config.OpenStore(ctx, "mem://?encode=yaml")
	if err != nil {
		return nil, err
	}

	bs := &Bootstrap{Store: store}

	if err := bs.reload(nil); err != nil {
		return nil, err
	}
	return &Bootstrap{Store: store}, nil
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
		defaultsTemplate,
		bootstrapTemplate,
	}, "\n")

	// Then generate the new template based on the config
	if file := runtime.GetString("file"); file != "" {
		f, err := os.Open(file)
		if err != nil {
			return err
		}
		b, err := io.ReadAll(f)
		if err != nil {
			return err
		}
		tmpl = string(b)
	} else if yaml := runtime.GetString("yaml"); yaml != "" {
		tmpl = yaml
	}

	patch := ypatch.Patch{}
	for _, pair := range runtime.GetStringSlice(runtime.KeySet) {
		kv := strings.SplitN(pair, "=", 2)
		if len(kv) != 2 {
			continue
		}
		if !strings.HasPrefix(kv[0], "/") {
			kv[0] = "/" + kv[0]
		}
		if pa, er := ypatch.ParsePath(kv[0]); er == nil {
			patch = append(patch, ypatch.Operation{
				Type:  ypatch.OperationAdd,
				Path:  pa,
				Value: kv[1],
			})
		} else {
			return er
		}
	}

	if len(patch) > 0 {
		if patched, er := ypatch.Apply([]byte(tmpl), patch); er != nil {
			return er
		} else {
			tmpl = string(patched)
		}
	}

	t, err := template.New("context").Funcs(map[string]any{
		"getServiceDataDir": runtime.MustServiceDataDir,
	}).Delims("{{{{", "}}}}").Parse(tmpl)
	if err != nil {
		return err
	}

	var b strings.Builder

	r := runtime.GetRuntime()
	if err := t.Execute(&b, struct {
		ConfigURL             string
		RegistryURL           string
		BrokerURL             string
		CacheURL              string
		BindHost              string
		AdvertiseHost         string
		DiscoveryPort         string
		FrontendPort          string
		ApplicationWorkingDir string
		ApplicationDataDir    string
		ApplicationLogsDir    string
		ServiceDataDir        func(string) string
		Config                config.Store
	}{
		ConfigURL:             runtime.ConfigURL(),
		RegistryURL:           runtime.RegistryURL(),
		BrokerURL:             runtime.BrokerURL(),
		CacheURL:              runtime.CacheURL(""),
		Config:                conf,
		BindHost:              r.GetString(runtime.KeyBindHost),
		AdvertiseHost:         r.GetString(runtime.KeyBindHost),
		DiscoveryPort:         r.GetString(runtime.KeyGrpcDiscoveryPort),
		FrontendPort:          r.GetString(runtime.KeyHttpPort),
		ApplicationWorkingDir: runtime.ApplicationWorkingDir(),
		ApplicationDataDir:    runtime.ApplicationWorkingDir(runtime.ApplicationDirData),
		ApplicationLogsDir:    runtime.ApplicationWorkingDir(runtime.ApplicationDirLogs),
	}); err != nil {
		return err
	}

	_ = bs.Set([]byte(b.String()))

	return nil

}
