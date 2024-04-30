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

package config

import (
	"fmt"
)

var (
	tm TenantsManager = &basicManager{
		tt: []Tenant{
			&basicTenant{id: "default"},
			&basicTenant{id: "tenant1"},
			&basicTenant{id: "tenant2"},
		},
	}
)

func RegisterTenantsManager(m TenantsManager) {
	tm = m
}

func GetTenantsManager() TenantsManager {
	return tm
}

type Tenant interface {
	ID() string
}

type TenantsManager interface {
	GetMaster() Tenant
	IsMaster(Tenant) bool
	ListTenants() []Tenant
	TenantByID(id string) (Tenant, error)
	Subscribe(cb func(event TenantWatchEvent)) error
}

type TenantWatchEvent interface {
	Action() string
	Tenant() Tenant
}

type basicTenant struct {
	id string
}

func (b *basicTenant) ID() string {
	return b.id
}

type basicManager struct {
	master Tenant
	tt     []Tenant
}

func (b *basicManager) GetMaster() Tenant {
	m, _ := b.TenantByID("master")
	return m
}

func (b *basicManager) IsMaster(t Tenant) bool {
	return t.ID() == "master"
}

func (b *basicManager) ListTenants() []Tenant {
	return b.tt
}

func (b *basicManager) TenantByID(id string) (Tenant, error) {
	for _, t := range b.tt {
		if t.ID() == id {
			return t, nil
		}
	}
	return nil, fmt.Errorf("not found")
}

func (b *basicManager) Subscribe(cb func(event TenantWatchEvent)) error {
	return nil
}
