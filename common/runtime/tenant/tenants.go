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

package tenant

import (
	"context"

	"github.com/pydio/cells/v4/common/errors"
	"github.com/pydio/cells/v4/common/utils/propagator"
)

var (
	tm Manager = &basicManager{
		tt: []Tenant{
			&basicTenant{id: "default"},
			&basicTenant{id: "sub1"},
			&basicTenant{id: "sub2"},
		},
	}
	ErrNotFound = errors.RegisterBaseSentinel(errors.StatusUnauthorized, "tenant not found")
)

func RegisterManager(m Manager) {
	tm = m
}

func GetManager() Manager {
	return tm
}

type Tenant interface {
	Context(ctx context.Context) context.Context
	ID() string
}

type Manager interface {
	GetMaster() Tenant
	IsMaster(Tenant) bool
	ListTenants() []Tenant
	Iterate(ct context.Context, f func(ctx context.Context, t Tenant) error) error
	TenantByID(id string) (Tenant, error)
	Subscribe(cb func(event WatchEvent)) error
}

type WatchEvent interface {
	Action() string
	Tenant() Tenant
	Context(ctx context.Context) context.Context
}

type basicTenant struct {
	id string
}

func (b *basicTenant) ID() string {
	return b.id
}

func (b *basicTenant) Context(ctx context.Context) context.Context {
	return propagator.With(ctx, ContextKey, b)
}

type basicManager struct {
	master Tenant
	tt     []Tenant
}

func (b *basicManager) GetMaster() Tenant {
	m, _ := b.TenantByID("default")
	return m
}

func (b *basicManager) IsMaster(t Tenant) bool {
	return t.ID() == "default"
}

func (b *basicManager) Iterate(c context.Context, f func(ctx context.Context, t Tenant) error) error {
	for _, t := range b.tt {
		if e := f(t.Context(c), t); e != nil {
			return e
		}
	}
	return nil
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
	return nil, errors.WithStack(ErrNotFound)
}

func (b *basicManager) Subscribe(cb func(event WatchEvent)) error {
	return nil
}
