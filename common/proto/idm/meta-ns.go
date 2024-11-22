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

package idm

import (
	json "github.com/pydio/cells/v5/common/utils/jsonx"
)

type MetaNamespaceDefinition interface {
	GetType() string
	GetData() interface{}
	GetSteps() bool
	DefaultHide() bool
}

type metaNsDef struct {
	Type  string
	Data  interface{} `json:"data,omitempty"`
	Steps bool        `json:"steps,omitempty"`
	Hide  bool        `json:"hide,omitempty"`
}

func (d *metaNsDef) GetType() string {
	return d.Type
}

func (d *metaNsDef) GetData() interface{} {
	return d.Data
}

func (d *metaNsDef) GetSteps() bool {
	return d.Steps
}

func (d *metaNsDef) DefaultHide() bool {
	return d.Hide
}

func (m *UserMetaNamespace) UnmarshallDefinition() (MetaNamespaceDefinition, error) {
	var def metaNsDef
	if e := json.Unmarshal([]byte(m.JsonDefinition), &def); e != nil {
		return nil, e
	} else {
		return &def, nil
	}
}
