/*
 * Copyright (c) 2026. Abstrium SAS <team (at) pydio.com>
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

package cmd

import (
	"context"
	"testing"

	"github.com/pydio/cells/v5/common/config"
	"github.com/pydio/cells/v5/common/proto/install"
	"github.com/pydio/cells/v5/common/utils/openurl"
	"github.com/pydio/cells/v5/common/utils/propagator"
)

type countingConfigStore struct {
	config.Store
	saves int
}

func (s *countingConfigStore) Save(string, string) error {
	s.saves++
	return nil
}

func TestApplyInstallConfigsSavesCustomSitesInSingleSnapshot(t *testing.T) {
	ctx := context.Background()
	store := &countingConfigStore{Store: config.NewStore()}
	pool := openurl.MustMemPool[config.Store](ctx, func(context.Context, string) config.Store {
		return store
	})
	ctx = propagator.With[*openurl.Pool[config.Store]](ctx, config.ContextKey, pool)

	proxySites := []*install.ProxyConfig{{Binds: []string{"proxy-config:8080"}}}
	customSites := `[{"Binds":["custom-config:8443"],"ReverseProxyURL":"https://cells.example.com"}]`
	if err := applyInstallConfigs(ctx, proxySites, map[string]string{
		"defaults/sites#json": customSites,
	}); err != nil {
		t.Fatal(err)
	}

	if store.saves != 1 {
		t.Fatalf("expected one configuration save, got %d", store.saves)
	}

	var sites []*install.ProxyConfig
	if err := config.Get(ctx, "defaults", "sites").Scan(&sites); err != nil {
		t.Fatal(err)
	}
	if len(sites) != 1 || len(sites[0].Binds) != 1 || sites[0].Binds[0] != "custom-config:8443" {
		t.Fatalf("expected CustomConfigs sites to override proxy sites, got %#v", sites)
	}
}
