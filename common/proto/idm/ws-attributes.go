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
	"strings"

	json "github.com/pydio/cells/x/jsonx"
)

type WsAttributes struct {
	AllowSync     bool   `json:"ALLOW_SYNC,omitempty"`
	SkipRecycle   bool   `json:"SKIP_RECYCLE,omitempty"`
	DefaultRights string `json:"DEFAULT_RIGHTS,omitempty"`
	QuotaValue    string `json:"QUOTA,omitempty"`
	MetaLayout    string `json:"META_LAYOUT,omitempty"`
}

func (m *Workspace) LoadAttributes() *WsAttributes {
	attributes := &WsAttributes{}
	if m.Attributes != "" && m.Attributes != "{}" {
		// In case bool value was stored as string
		strAttr := strings.ReplaceAll(m.Attributes, "\"true\"", "true")
		strAttr = strings.ReplaceAll(strAttr, "\"false\"", "false")
		// Unmarshal to WsAttributes struct
		if e := json.Unmarshal([]byte(strAttr), attributes); e == nil {
			return attributes
		}
	}
	return attributes
}

func (m *Workspace) SetAttributes(a *WsAttributes) {
	bb, _ := json.Marshal(a)
	s := string(bb)
	if s == "{}" {
		s = ""
	}
	m.Attributes = s
}
