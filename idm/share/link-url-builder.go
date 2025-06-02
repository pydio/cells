/*
 * Copyright (c) 2025 Abstrium SAS <team (at) pydio.com>
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

package share

import (
	"context"
	"net/url"
	"path"

	"github.com/pydio/cells/v5/common"
	"github.com/pydio/cells/v5/common/config"
	"github.com/pydio/cells/v5/common/config/routing"
	"github.com/pydio/cells/v5/common/proto/rest"
)

type LinkURLBuilder interface {
	BuildLinkURL(ctx context.Context, link *rest.ShareLink) error
}

var (
	PublicLinkUrlBuilder LinkURLBuilder = &defaultLinkURLBuilder{}
)

type defaultLinkURLBuilder struct{}

// BuildLinkURL retrieves external public base (from sites configuration) and eventually fix an URL host (from config)
func (d *defaultLinkURLBuilder) BuildLinkURL(ctx context.Context, link *rest.ShareLink) error {
	publicBase := routing.RouteIngressURIContext(ctx, common.RoutePublic, common.DefaultRoutePublic)
	link.LinkUrl = path.Join(publicBase, link.LinkHash)
	if configBase := config.Get(ctx, "services", common.ServiceRestNamespace_+common.ServiceShare, "url").String(); configBase != "" {
		if cfu, e := url.Parse(configBase); e == nil {
			cfu.Path = path.Join(publicBase, link.LinkHash)
			link.LinkUrl = cfu.String()
		}
	}
	return nil
}
