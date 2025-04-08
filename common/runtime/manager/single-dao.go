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
	"strings"
	"text/template"

	"github.com/spf13/viper"

	"github.com/pydio/cells/v5/common/config"
	"github.com/pydio/cells/v5/common/runtime"
	"github.com/pydio/cells/v5/common/service"
	"github.com/pydio/cells/v5/common/utils/propagator"
	"github.com/pydio/cells/v5/common/utils/uuid"
)

var (
	singleYAML = `
caches:
  local:
    uri: pm://
  shared:
    uri: pm://
storages:
  {{- range $idx, $dsn := . }}
  storage{{ $idx }}: 
    uri: {{ $dsn }}
  {{- end }}
services:
  test:
    storages:
      main:
	    {{- range $idx, $dsn := . }}
        - type: storage{{ $idx }}
	    {{- end }}
`

	multipleYAML = `
caches:
  local:
    uri: pm://
  shared:
    uri: pm://
storages:
  {{- range $idx, $dsn := .Dsn }}
  storage{{ $idx }}: 
    uri: {{ $dsn }}
  {{- end }}
services:
  {{- range $name, $storage := .Services }}
  {{$name}}:
    storages:
      main:
	    {{- range $idx, $dao := $storage }}
        - type: storage{{ $idx }}
          {{if index $dao "policies"}}policies: {{ index $dao "policies" }}{{end}}
          {{if index $dao "prefix"}}prefix: {{ index $dao "prefix" }}{{end}}
	    {{- end }}
  {{- end }}
`
	singleTpl   *template.Template
	multipleTpl *template.Template
)

func init() {
	var err error
	singleTpl, err = template.New("test").Option("missingkey=zero").Parse(singleYAML)
	if err != nil {
		panic(err)
	}
	multipleTpl, err = template.New("multiple").Option("missingkey=zero").Parse(multipleYAML)
	if err != nil {
		panic(err)
	}
}

func DSNtoContextDAO(ctx context.Context, dsn []string, daoFunc any) (context.Context, error) {
	// read template
	b := &strings.Builder{}
	err := singleTpl.Execute(b, dsn)
	if err != nil {
		return nil, err
	}
	v := viper.New()
	v.Set(runtime.KeyLogSQL, false)
	v.Set(runtime.KeyKeyring, "mem://")
	v.Set(runtime.KeyRegistry, "mem://")
	v.Set(runtime.KeyConfig, "mem://")
	mem, _ := config.OpenStore(ctx, "mem://")
	ctx = propagator.With(ctx, config.ContextKey, mem)

	runtime.SetRuntime(v)

	sd := service.StorageDrivers{}
	sd.Register(daoFunc)

	var svc service.Service
	runtime.Register("test", func(ctx context.Context) {
		svc = service.NewService(
			service.Name("test"),
			service.Context(ctx),
			service.WithStorageDrivers(sd),
			service.Migrations([]*service.Migration{{
				TargetVersion: service.FirstRun(),
				Up:            StorageMigration(),
			}}),
		)
	})

	mgr, err := NewManager(ctx, "test", nil)
	if err != nil {
		return nil, err
	}

	if err := mgr.Bootstrap(b.String()); err != nil {
		return nil, err
	}

	ctx = mgr.Context()
	ctx = propagator.With(ctx, service.ContextKey, svc)
	ctx = runtime.MultiContextManager().RootContext(ctx)

	if err := mgr.ServeAll(); err != nil {
		return nil, err
	}

	return ctx, nil
}

func MockServicesToContextDAO(ctx context.Context, dsn map[string]string, servicesWithDAO map[string]map[string]map[string]any) (context.Context, error) {
	// read template
	b := &strings.Builder{}
	data := map[string]interface{}{
		"Dsn":      dsn,
		"Services": servicesWithDAO,
	}
	err := multipleTpl.Execute(b, data)
	if err != nil {
		return nil, err
	}
	fmt.Println("YAML", b.String())
	v := viper.New()
	v.Set(runtime.KeyLogSQL, false)
	v.Set(runtime.KeyKeyring, "mem://")
	v.Set(runtime.KeyRegistry, "mem://")
	v.Set(runtime.KeyConfig, "mem://")
	mem, _ := config.OpenStore(ctx, "mem://")
	ctx = propagator.With(ctx, config.ContextKey, mem)

	runtime.SetRuntime(v)
	ns := uuid.New()

	//var svc service.Service
	for name, daoDef := range servicesWithDAO {
		var drivers service.StorageDrivers
		for _, daoMap := range daoDef {
			drivers.Register(daoMap["func"])
		}
		runtime.Register(ns, func(ctx context.Context) {
			service.NewService(
				service.Name(name),
				service.Context(ctx),
				service.WithStorageDrivers(drivers),
				service.Migrations([]*service.Migration{{
					TargetVersion: service.FirstRun(),
					Up:            StorageMigration(),
				}}),
			)
		})
	}

	mgr, err := NewManager(ctx, ns, nil)
	if err != nil {
		return nil, err
	}

	if err := mgr.Bootstrap(b.String()); err != nil {
		return nil, err
	}

	ctx = mgr.Context()
	//ctx = propagator.With(ctx, service.ContextKey, svc)
	ctx = runtime.MultiContextManager().RootContext(ctx)

	if err := mgr.ServeAll(); err != nil {
		return nil, err
	}

	return ctx, nil
}
