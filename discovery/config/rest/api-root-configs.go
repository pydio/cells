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

package rest

import (
	"context"
	"strings"

	restful "github.com/emicklei/go-restful/v3"
	"go.uber.org/zap"

	"github.com/pydio/cells/v4/common/config"
	"github.com/pydio/cells/v4/common/errors"
	"github.com/pydio/cells/v4/common/proto/rest"
	"github.com/pydio/cells/v4/common/telemetry/log"
	json "github.com/pydio/cells/v4/common/utils/jsonx"
	"github.com/pydio/cells/v4/common/utils/permissions"
)

/*********************
GENERIC GET/PUT CALLS
*********************/

func (s *Handler) PutConfig(req *restful.Request, resp *restful.Response) error {

	ctx := req.Request.Context()
	var configuration rest.Configuration
	if err := req.ReadEntity(&configuration); err != nil {
		return err
	}
	if configuration.FullPath == "" {
		configuration.FullPath = req.PathParameter("FullPath")
	}
	u, _ := permissions.FindUserNameInContext(ctx)
	if u == "" {
		u = "rest"
	}
	fullPath := strings.Trim(configuration.FullPath, "/")
	path := strings.Split(fullPath, "/")
	if len(path) == 0 {
		return errors.WithMessage(errors.InvalidParameters, "no path given")
	}
	if !config.IsRestEditable(fullPath) {
		return errors.WithMessage(errors.StatusForbidden, "you are not allowed to edit that configuration")
	}
	var parsed map[string]interface{}
	if e := json.Unmarshal([]byte(configuration.Data), &parsed); e == nil {
		var original map[string]interface{}
		if o := config.Get(path...).Map(); len(o) > 0 {
			original = o
			// Delete was there to prevent a merge - now done directly in the config lib
			// config.Del(path...)
		}
		config.Set(parsed, path...)
		if err := config.Save(u, "Setting config via API"); err != nil {
			log.Logger(ctx).Error("Put", zap.Error(err))
			if original != nil {
				config.Set(original, path...)
			}
			return err
		}
		s.logPluginEnabled(req.Request.Context(), configuration.FullPath, parsed, original)
		// Reload new data
		return resp.WriteEntity(&rest.Configuration{
			FullPath: configuration.FullPath,
			Data:     config.Get(path...).String(),
		})
	} else {
		return errors.Tag(e, errors.UnmarshalError)
	}

}

func (s *Handler) GetConfig(req *restful.Request, resp *restful.Response) error {

	ctx := req.Request.Context()
	fullPath := strings.Trim(req.PathParameter("FullPath"), "/")
	log.Logger(ctx).Debug("Config.Get FullPath : " + fullPath)

	path := strings.Split(fullPath, "/")

	if !config.IsRestEditable(fullPath) {
		return errors.WithMessage(errors.StatusForbidden, "you are not allowed to edit that configuration")
	}

	data := config.Get(path...).String()

	output := &rest.Configuration{
		FullPath: fullPath,
		Data:     data,
	}
	return resp.WriteEntity(output)

}

func (s *Handler) logPluginEnabled(ctx context.Context, cPath string, conf map[string]interface{}, original map[string]interface{}) {
	k, o := conf["PYDIO_PLUGIN_ENABLED"]
	if !o {
		return
	}
	if original != nil {
		k1, o1 := original["PYDIO_PLUGIN_ENABLED"]
		if o1 && k1 == k {
			return
		}
	}
	status := k.(bool)
	if status {
		log.Auditer(ctx).Info("Enabling plugin " + cPath)
	} else {
		log.Auditer(ctx).Info("Disabling plugin " + cPath)
	}
}
