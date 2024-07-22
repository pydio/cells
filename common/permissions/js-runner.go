/*
 * Copyright (c) 2019-2021. Abstrium SAS <team (at) pydio.com>
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

package permissions

import (
	"context"
	"reflect"
	"time"

	"github.com/pkg/errors"
	"github.com/robertkrimen/otto"
	"go.uber.org/zap"

	"github.com/pydio/cells/v4/common/telemetry/log"
)

type JsUser struct {
	Uuid        string
	Name        string
	GroupPath   string
	GroupFlat   string
	Profile     string
	DisplayName string
	Email       string
	AuthSource  string
	Roles       []string
}

type JsRequest struct {
	UserAgent string
	UserIP    string
}

func RunJavaScript(ctx context.Context, script string, inputs map[string]interface{}, outputs map[string]interface{}) error {

	t := time.Now()
	vm := otto.New()

	for inputVar, inputData := range inputs {
		if er := vm.Set(inputVar, inputData); er != nil {
			return er
		}
	}
	for outputVar, outputData := range outputs {
		if er := vm.Set(outputVar, outputData); er != nil {
			return er
		}
	}

	if _, e := vm.Run(script); e == nil {

		for oVar, oData := range outputs {

			dataVal := reflect.ValueOf(oData)
			if vmValue, err := vm.Get(oVar); err == nil {

				switch dataVal.Kind() {
				case reflect.String:
					outputs[oVar], _ = vmValue.ToString()
				case reflect.Bool:
					outputs[oVar], _ = vmValue.ToBoolean()
				default:
					return errors.New("JS Runner : unsupported expected output type")
				}

			} else {
				return errors.Wrap(err, "javascript runner")
			}

		}
	} else {
		return errors.Wrap(e, "javascript runner")
	}

	log.Logger(ctx).Debug("JavaScript Runner", zap.Duration("time", time.Since(t)))
	return nil

}
