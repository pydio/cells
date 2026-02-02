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
	GetEntityId() string
	GetItems() []string
	GetEntities() []string
}

type TypedUserMetaNamespace struct {
	MetaNamespaceDefinition
	*UserMetaNamespace
}

// metaNsDef is the legacy internal type for backward compatibility
type metaNsDef struct {
	Type  string      `json:"type,omitempty"`
	Data  interface{} `json:"data,omitempty"`
	Steps bool        `json:"steps,omitempty"`
	Hide  bool        `json:"hide,omitempty"`
}

// MetaNsDef is the full structured type with entity support
type MetaNsDef struct {
	Type   string `json:"type,omitempty"`
	Entity struct {
		EntityID string `json:"entity_id,omitempty"`
		Entity   string `json:"entity,omitempty"`
	} `json:"entity,omitempty"`
	Data struct {
		Items []struct {
			Key   string `json:"key"`
			Value string `json:"value"`
			Color string `json:"color,omitempty"`
		} `json:"items,omitempty"`
		Steps  bool     `json:"steps,omitempty"`
		Entity []string `json:"entity,omitempty"`
	} `json:"data,omitempty"`
	GroupName string `json:"groupName,omitempty"`
	Steps     bool   `json:"steps,omitempty"`
	Hide      bool   `json:"hide,omitempty"`
}

// Implement MetaNamespaceDefinition interface for legacy metaNsDef
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

func (d *metaNsDef) GetEntityId() string {
	return ""
}

func (d *metaNsDef) GetItems() []string {
	return nil
}

func (d *metaNsDef) GetEntities() []string {
	return nil
}

// Implement MetaNamespaceDefinition interface for MetaNsDef
func (d *MetaNsDef) GetType() string {
	return d.Type
}

func (d *MetaNsDef) GetData() interface{} {
	return d.Data
}

func (d *MetaNsDef) GetSteps() bool {
	return d.Steps
}

func (d *MetaNsDef) DefaultHide() bool {
	return d.Hide
}

func (d *MetaNsDef) GetItems() []string {
	var items []string
	for _, item := range d.Data.Items {
		items = append(items, item.Value)
	}
	return items
}

func (d *MetaNsDef) GetEntities() []string {
	return d.Data.Entity
}

func (d *MetaNsDef) GetEntityId() string {
	return d.Entity.EntityID
}

func (d *MetaNsDef) SetEntityId(entityID string) {
	d.Entity.EntityID = entityID
}

func (m *UserMetaNamespace) UnmarshallDefinition() (MetaNamespaceDefinition, error) {
	var fullDef MetaNsDef
	if e := json.Unmarshal([]byte(m.JsonDefinition), &fullDef); e == nil {
		if fullDef.Entity.EntityID != "" || len(fullDef.Data.Items) > 0 || len(fullDef.Data.Entity) > 0 {
			return &fullDef, nil
		}
	}

	// Default to legacy metaNsDef for backward compatibility
	var legacyDef metaNsDef
	if e := json.Unmarshal([]byte(m.JsonDefinition), &legacyDef); e != nil {
		return nil, e
	}
	return &legacyDef, nil
}
