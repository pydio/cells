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
	"fmt"
	"net/http"
	"runtime/debug"
	"strings"

	"google.golang.org/grpc/metadata"

	"github.com/pydio/cells/v4/cmd"
	"github.com/pydio/cells/v4/common/middleware"
	"github.com/pydio/cells/v4/common/runtime"
	"github.com/pydio/cells/v4/common/utils/openurl"
	"github.com/pydio/cells/v4/common/utils/propagator"
)

var (
	adminCmdTenantID string
)

const (
	metadataKey     = "tenant"
	defaultTenantID = "default"
	headerTenantID  = "X-Pydio-Tenant"
)

func init() {
	runtime.RegisterMultiContextManager(tm)

	cmd.AdminCmd.PersistentFlags().StringVar(&adminCmdTenantID, "tenant_id", "default", "Tenant ID to apply command")

	// GRPC OUTGOING
	middleware.RegisterModifier(propagator.OutgoingContextModifier(func(ctx context.Context) context.Context {
		tenantID := defaultTenantID
		var t string
		if propagator.Get(ctx, runtime.MultiContextKey, &t) {
			tenantID = t
		}
		ctx = metadata.AppendToOutgoingContext(ctx, metadataKey, tenantID)
		return ctx
	}))
	// GRPC INCOMING
	middleware.RegisterModifier(propagator.IncomingContextModifier(func(ctx context.Context) (context.Context, bool, error) {
		tenantID := defaultTenantID
		// Make sure to check meta first if IncomingContext is not set
		if ca, ok := propagator.CanonicalMeta(ctx, metadataKey); ok {
			tenantID = ca
		} else if md, ok2 := metadata.FromIncomingContext(ctx); ok2 {
			if t := md.Get(metadataKey); len(t) > 0 {
				tenantID = strings.Join(t, "")
			}
		}

		// Check that it does exist
		tenant, err := tm.TenantByID(tenantID)
		if err != nil {
			return ctx, false, err
		}
		return tenant.Context(ctx), true, nil
	}))
	// HTTP INCOMING
	middleware.RegisterModifier(middleware.HttpContextModifier(func(r *http.Request) (*http.Request, error) {
		tenant := r.Header.Get(headerTenantID)
		if tenant == "" {
			tenant = defaultTenantID
			// Append to Headers if request is forwarded
			r.Header.Set(headerTenantID, defaultTenantID)
		}
		// Check that it does exist, and append to context
		t, err := tm.TenantByID(tenant)
		if err != nil {
			return nil, err
		}
		return r.WithContext(t.Context(r.Context())), nil
	}))
	// TEMPLATE
	openurl.RegisterTemplateInjector(func(ctx context.Context, m map[string]interface{}) error {
		var tID string
		m["Tenant"] = defaultTenantID
		if propagator.Get[string](ctx, runtime.MultiContextKey, &tID) {
			if tID != "" {
				m["Tenant"] = tID
			} else {
				fmt.Println("TemplateInjector - empty tenant string found in context, using " + defaultTenantID)
			}
		} else {
			if !runtime.IsCoreContext(ctx) {
				fmt.Println("TemplateInjector - tenant not found in context, not core, using " + defaultTenantID)
				debug.PrintStack()
			}
		}
		return nil
	})
	openurl.RegisterTplFunc("tenantPathWithBlank", PathWithBlank)
	openurl.RegisterTplFunc("tenantSepWithBlank", ValueOrBlank)
}

// PathWithBlank returns the /tenant value, unless the tenant equals the blank value and it returns empty
func PathWithBlank(tenant, blankValue string) string {
	if tenant == blankValue {
		return ""
	} else {
		return "/" + tenant
	}
}

func ValueOrBlank(tenant, separator, blankValue string) string {
	if tenant == blankValue {
		return ""
	} else {
		return tenant + separator
	}
}
