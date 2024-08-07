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
	"github.com/pydio/cells/v4/common/runtime"
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

type Tenant interface {
	Context(ctx context.Context) context.Context
	ID() string
}

type Manager interface {
	runtime.MultiContextProvider

	GetMaster() Tenant
	IsMaster(Tenant) bool
	ListTenants() []Tenant
	TenantByID(id string) (Tenant, error)
}

type basicTenant struct {
	id string
}

func (b *basicTenant) ID() string {
	return b.id
}

func (b *basicTenant) Context(ctx context.Context) context.Context {
	ctx = propagator.With[string](ctx, runtime.MultiContextKey, b.ID())
	ctx = propagator.WithAdditionalMetadata(ctx, map[string]string{metadataKey: b.ID()})
	return ctx
}

type basicManager struct {
	master Tenant
	tt     []Tenant
}

func (b *basicManager) Current(ctx context.Context) string {
	var id string
	propagator.Get[string](ctx, runtime.MultiContextKey, &id)
	return id
}

func (b *basicManager) RootContext(ctx context.Context) context.Context {
	if adminCmdTenantID == "" {
		adminCmdTenantID = "default"
	}
	return propagator.With(ctx, runtime.MultiContextKey, adminCmdTenantID)
}

func (b *basicManager) Iterate(ctx context.Context, add func(context.Context, string) error) error {
	for _, t := range b.tt {
		if e := add(t.Context(ctx), t.ID()); e != nil {
			return e
		}
	}
	return nil
}

func (b *basicManager) Watch(ctx context.Context, add func(context.Context, string) error, remove func(context.Context, string) error, iterate bool) error {
	if iterate {
		return b.Iterate(ctx, add)
	}
	// TODO Watch
	return nil
}

func (b *basicManager) GetMaster() Tenant {
	m, _ := b.TenantByID("default")
	return m
}

func (b *basicManager) IsMaster(t Tenant) bool {
	return t.ID() == "default"
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
