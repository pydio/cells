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
	"strings"
	"text/template"

	"github.com/spf13/viper"

	"github.com/pydio/cells/v4/common/runtime"
	"github.com/pydio/cells/v4/common/runtime/tenant"
	"github.com/pydio/cells/v4/common/service"
	"github.com/pydio/cells/v4/common/utils/propagator"
)

var (
	singleYAML = `
caches:
  short:
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

	singleTpl *template.Template
)

func init() {
	var err error
	singleTpl, err = template.New("test").Parse(singleYAML)
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
	v.Set(runtime.KeyConfig, "mem://")
	v.Set("yaml", b.String())

	runtime.SetRuntime(v)

	var svc service.Service
	runtime.Register("test", func(ctx context.Context) {
		svc = service.NewService(
			service.Name("test"),
			service.Context(ctx),
			service.WithStorageDrivers(daoFunc),
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

	ctx = mgr.Context()
	ctx = propagator.With(ctx, service.ContextKey, svc)
	ctx = propagator.With(ctx, tenant.ContextKey, tenant.GetManager().GetMaster())

	return ctx, nil
}
