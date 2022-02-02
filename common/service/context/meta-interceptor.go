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

package servicecontext

import (
	"context"
	"strings"

	"google.golang.org/grpc/metadata"

	"github.com/pydio/cells/v4/common/service/context/ckeys"
	metadata2 "github.com/pydio/cells/v4/common/service/context/metadata"
)

// MetaIncomingContext looks for x-cells- metadata keys in IncomingContext and
// set them in standard metadata map
func MetaIncomingContext(ctx context.Context) (context.Context, bool, error) {
	if md, ok := metadata.FromIncomingContext(ctx); ok {
		cellsMeta := make(map[string]string)
		for k, v := range md {
			if strings.HasPrefix(k, ckeys.CellsMetaPrefix) {
				cellsMeta[strings.TrimPrefix(k, ckeys.CellsMetaPrefix)] = strings.Join(v, "")
			}
		}
		if len(cellsMeta) > 0 {
			ctx = metadata2.NewContext(ctx, cellsMeta)
			return ctx, true, nil
		}
	}
	return ctx, false, nil
}
